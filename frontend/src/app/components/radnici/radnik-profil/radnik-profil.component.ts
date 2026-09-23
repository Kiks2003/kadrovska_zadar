import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RadnikService } from '../../../services/radnik.service';
import { RadnaDozvola, Radnik, STATUS_LABELS, VRSTA_DOZVOLE_LABELS } from '../../../models/radnik';
import { parseApiError } from '../../../shared/parse-api-error';
import { danaDo, stanjeDozvole } from '../../../shared/stanje-dozvole';
import { DozvolaFormComponent } from '../dozvola-form/dozvola-form.component';
import { RadnikDokumentiComponent } from '../radnik-dokumenti/radnik-dokumenti.component';

@Component({
  selector: 'app-radnik-profil',
  standalone: true,
  imports: [RouterLink, DatePipe, DozvolaFormComponent, RadnikDokumentiComponent],
  templateUrl: './radnik-profil.component.html',
  styleUrl: './radnik-profil.component.scss'
})
export class RadnikProfilComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private radnikService = inject(RadnikService);

  radnik = signal<Radnik | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  dozvolaError = signal<string | null>(null);

  // 'nova' = forma za novu dozvolu, broj = id dozvole koja se uređuje.
  urediDozvolu = signal<'nova' | number | null>(null);

  readonly STATUS_LABELS = STATUS_LABELS;
  readonly VRSTA_DOZVOLE_LABELS = VRSTA_DOZVOLE_LABELS;
  readonly stanjeDozvole = stanjeDozvole;

  inicijali = computed(() => {
    const r = this.radnik();
    return r ? `${r.ime.charAt(0)}${r.prezime.charAt(0)}`.toUpperCase() : '';
  });

  // Aktualna dozvola je ona s najkasnijim datumom isteka.
  aktualnaDozvola = computed<RadnaDozvola | null>(() => {
    const dozvole = (this.radnik()?.dozvole ?? []).filter(d => d.datum_isteka);
    return dozvole.reduce<RadnaDozvola | null>(
      (najnovija, d) => !najnovija || d.datum_isteka > najnovija.datum_isteka ? d : najnovija,
      null
    );
  });

  danaDoIsteka = computed(() => {
    const istek = this.aktualnaDozvola()?.datum_isteka;
    return istek ? danaDo(istek) : null;
  });

  stanjeAktualne = computed(() => stanjeDozvole(this.aktualnaDozvola()?.datum_isteka ?? null));

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => this.load(Number(params.get('id'))));
  }

  load(id: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.radnikService.getRadnik(id).subscribe({
      next: radnik => {
        this.radnik.set(radnik);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.status === 404 ? 'Radnik nije pronađen.' : parseApiError(err));
        this.loading.set(false);
      }
    });
  }

  onDozvolaSaved(dozvola: RadnaDozvola): void {
    this.urediDozvolu.set(null);
    this.radnik.update(r => r && {
      ...r,
      dozvole: [...r.dozvole.filter(d => d.id !== dozvola.id), dozvola]
        .sort((a, b) => (b.datum_isteka ?? '').localeCompare(a.datum_isteka ?? ''))
    });
  }

  obrisiDozvolu(dozvola: RadnaDozvola): void {
    if (!confirm(`Obrisati dozvolu "${VRSTA_DOZVOLE_LABELS[dozvola.vrsta]}" (istek ${dozvola.datum_isteka})?`)) {
      return;
    }
    this.dozvolaError.set(null);
    this.radnikService.deleteDozvola(dozvola.id).subscribe({
      next: () => this.radnik.update(r => r && {
        ...r,
        dozvole: r.dozvole.filter(d => d.id !== dozvola.id)
      }),
      error: (err: HttpErrorResponse) => this.dozvolaError.set(parseApiError(err))
    });
  }
}
