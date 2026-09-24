import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, debounceTime, distinctUntilChanged, of, Subject, switchMap } from 'rxjs';
import { RadnikService } from '../../../services/radnik.service';
import { Radnik, STATUS_LABELS, VRSTA_DOZVOLE_LABELS, VrstaDozvole } from '../../../models/radnik';
import { parseApiError } from '../../../shared/parse-api-error';
import { stanjeDozvole } from '../../../shared/stanje-dozvole';

// Mora odgovarati PAGE_SIZE u conf/settings/rest.py.
const PAGE_SIZE = 10;

const FILTERI = ['search', 'status', 'vrsta_dozvole', 'stanje_dozvole', 'poslodavac', 'struka'] as const;
type Filter = typeof FILTERI[number];

@Component({
  selector: 'app-radnici-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, DatePipe],
  templateUrl: './radnici-list.component.html',
  styleUrl: './radnici-list.component.scss'
})
export class RadniciListComponent implements OnInit {
  private radnikService = inject(RadnikService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  radnici = signal<Radnik[]>([]);
  totalCount = signal(0);
  page = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);
  deleteError = signal<string | null>(null);

  totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / PAGE_SIZE)));

  readonly STATUS_LABELS = STATUS_LABELS;
  readonly VRSTE_DOZVOLE = Object.entries(VRSTA_DOZVOLE_LABELS) as [VrstaDozvole, string][];
  readonly stanjeDozvole = stanjeDozvole;

  filterForm = this.fb.nonNullable.group<Record<Filter, string>>({
    search: '',
    status: '',
    vrsta_dozvole: '',
    stanje_dozvole: '',
    poslodavac: '',
    struka: ''
  });

  imaFiltera = signal(false);

  private load$ = new Subject<Params>();

  ngOnInit(): void {
    // Zahtjevi idu kroz switchMap da stariji odgovor ne pregazi noviji.
    this.load$.pipe(
      switchMap(params => {
        this.loading.set(true);
        this.error.set(null);
        return this.radnikService.getRadnici(params).pipe(
          catchError((err: HttpErrorResponse) => {
            this.error.set(parseApiError(err));
            return of(null);
          })
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(res => {
      this.loading.set(false);
      this.radnici.set(res?.results ?? []);
      this.totalCount.set(res?.count ?? 0);
    });

    // Filteri i stranica žive u URL-u (?status=aktivan&page=2), pa ostaju
    // sačuvani kad se korisnik vrati s profila radnika.
    this.route.queryParams.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(params => {
      const vrijednosti = Object.fromEntries(FILTERI.map(f => [f, params[f] ?? ''])) as Record<Filter, string>;
      this.filterForm.setValue(vrijednosti, { emitEvent: false });
      this.imaFiltera.set(FILTERI.some(f => vrijednosti[f]));
      this.page.set(Number(params['page']) || 1);
      this.load$.next(params);
    });

    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.primijeniFiltere());
  }

  private primijeniFiltere(page = 1): void {
    const vrijednosti = this.filterForm.getRawValue();
    const queryParams: Params = {};
    for (const f of FILTERI) {
      const v = vrijednosti[f].trim();
      if (v) {
        queryParams[f] = v;
      }
    }
    if (page > 1) {
      queryParams['page'] = page;
    }
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
  }

  ocistiFiltere(): void {
    this.filterForm.reset();
    this.primijeniFiltere();
  }

  idiNaStranicu(page: number): void {
    this.primijeniFiltere(page);
  }

  aktualniIstek(radnik: Radnik): string | null {
    return radnik.dozvole.reduce<string | null>(
      (max, d) => d.datum_isteka && (!max || d.datum_isteka > max) ? d.datum_isteka : max,
      null
    );
  }

  remove(radnik: Radnik): void {
    if (!confirm(`Obrisati radnika ${radnik.ime} ${radnik.prezime}?`)) {
      return;
    }
    this.deleteError.set(null);
    this.radnikService.deleteRadnik(radnik.id).subscribe({
      next: () => {
        // Zadnji radnik na stranici -> prethodna stranica, inače ponovno učitaj ovu.
        if (this.radnici().length === 1 && this.page() > 1) {
          this.idiNaStranicu(this.page() - 1);
        } else {
          this.load$.next(this.route.snapshot.queryParams);
        }
      },
      error: (err: HttpErrorResponse) => this.deleteError.set(parseApiError(err))
    });
  }
}
