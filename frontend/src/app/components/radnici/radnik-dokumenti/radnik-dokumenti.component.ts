import { Component, inject, input, OnDestroy, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { RadnikService } from '../../../services/radnik.service';
import {
  Dokument,
  Radnik,
  VRSTA_DOKUMENTA_LABELS,
  VRSTA_DOZVOLE_LABELS,
  VrstaDokumenta
} from '../../../models/radnik';
import { parseApiError } from '../../../shared/parse-api-error';
import { PdfPregledComponent } from '../pdf-pregled/pdf-pregled.component';

const MAX_MB = 10;

@Component({
  selector: 'app-radnik-dokumenti',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, PdfPregledComponent],
  templateUrl: './radnik-dokumenti.component.html',
  styleUrl: './radnik-dokumenti.component.scss'
})
export class RadnikDokumentiComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private radnikService = inject(RadnikService);

  radnik = input.required<Radnik>();

  dokumenti = signal<Dokument[]>([]);
  prikaziFormu = signal(false);
  odabranaDatoteka = signal<File | null>(null);
  datotekaError = signal<string | null>(null);
  uploadLoading = signal(false);
  error = signal<string | null>(null);

  // Dokument otvoren u pregledniku i njegov blob: URL.
  pregled = signal<{ dokument: Dokument; url: string } | null>(null);
  ucitavaSeId = signal<number | null>(null);

  readonly VRSTE = Object.entries(VRSTA_DOKUMENTA_LABELS) as [VrstaDokumenta, string][];
  readonly VRSTA_DOKUMENTA_LABELS = VRSTA_DOKUMENTA_LABELS;
  readonly VRSTA_DOZVOLE_LABELS = VRSTA_DOZVOLE_LABELS;
  readonly MAX_MB = MAX_MB;

  form = this.fb.group({
    naziv: ['', Validators.maxLength(200)],
    vrsta: ['ostalo' as VrstaDokumenta, Validators.required],
    dozvola: [null as number | null]
  });

  ngOnInit(): void {
    this.dokumenti.set(this.radnik().dokumenti);
  }

  ngOnDestroy(): void {
    this.zatvoriPregled();
  }

  nazivDozvole(id: number | null): string | null {
    const d = id ? this.radnik().dozvole.find(x => x.id === id) : null;
    return d ? `${VRSTA_DOZVOLE_LABELS[d.vrsta]} (do ${d.datum_isteka})` : null;
  }

  velicina(bajtovi: number): string {
    return bajtovi < 1024 * 1024
      ? `${Math.max(1, Math.round(bajtovi / 1024))} KB`
      : `${(bajtovi / 1024 / 1024).toFixed(1)} MB`;
  }

  otvoriFormu(): void {
    this.form.reset({ naziv: '', vrsta: 'ostalo', dozvola: null });
    this.odabranaDatoteka.set(null);
    this.datotekaError.set(null);
    this.error.set(null);
    this.prikaziFormu.set(true);
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.datotekaError.set(null);
    this.odabranaDatoteka.set(null);
    if (!file) {
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.datotekaError.set('Dopušteni su samo PDF dokumenti.');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      this.datotekaError.set(`Datoteka je veća od ${MAX_MB} MB.`);
      return;
    }
    this.odabranaDatoteka.set(file);
    if (!this.form.value.naziv) {
      this.form.patchValue({ naziv: file.name.replace(/\.pdf$/i, '') });
    }
  }

  upload(): void {
    const file = this.odabranaDatoteka();
    if (!file) {
      this.datotekaError.set('Odaberite PDF dokument.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { naziv, vrsta, dozvola } = this.form.getRawValue();
    const data = new FormData();
    data.append('radnik', String(this.radnik().id));
    data.append('vrsta', vrsta ?? 'ostalo');
    data.append('naziv', naziv ?? '');
    if (dozvola) {
      data.append('dozvola', String(dozvola));
    }
    data.append('datoteka', file, file.name);

    this.error.set(null);
    this.uploadLoading.set(true);
    this.radnikService.uploadDokument(data).pipe(
      finalize(() => this.uploadLoading.set(false))
    ).subscribe({
      next: dokument => {
        this.dokumenti.update(list => [dokument, ...list]);
        this.prikaziFormu.set(false);
      },
      error: (err: HttpErrorResponse) => this.error.set(parseApiError(err))
    });
  }

  pregledaj(dokument: Dokument): void {
    this.ucitavaSeId.set(dokument.id);
    this.radnikService.getDokumentPdf(dokument.id).pipe(
      finalize(() => this.ucitavaSeId.set(null))
    ).subscribe({
      next: blob => {
        this.zatvoriPregled();
        const pdf = new Blob([blob], { type: 'application/pdf' });
        this.pregled.set({ dokument, url: URL.createObjectURL(pdf) });
      },
      error: (err: HttpErrorResponse) => this.error.set(this.porukaZaPdf(err))
    });
  }

  zatvoriPregled(): void {
    const p = this.pregled();
    if (p) {
      URL.revokeObjectURL(p.url);
      this.pregled.set(null);
    }
  }

  preuzmi(dokument: Dokument): void {
    this.radnikService.getDokumentPdf(dokument.id, true).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = dokument.izvorni_naziv;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url));
      },
      error: (err: HttpErrorResponse) => this.error.set(this.porukaZaPdf(err))
    });
  }

  obrisi(dokument: Dokument): void {
    if (!confirm(`Obrisati dokument "${dokument.naziv}"?`)) {
      return;
    }
    this.error.set(null);
    this.radnikService.deleteDokument(dokument.id).subscribe({
      next: () => {
        if (this.pregled()?.dokument.id === dokument.id) {
          this.zatvoriPregled();
        }
        this.dokumenti.update(list => list.filter(d => d.id !== dokument.id));
      },
      error: (err: HttpErrorResponse) => this.error.set(parseApiError(err))
    });
  }

  private porukaZaPdf(err: HttpErrorResponse): string {
    // Kod responseType 'blob' tijelo greške nije JSON, pa parseApiError ne pomaže.
    return err.status === 404
      ? 'Dokument nije pronađen.'
      : 'Dokument se ne može učitati. Pokušajte ponovno.';
  }
}
