import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { RadnikService } from '../../../services/radnik.service';
import { Radnik, RadnikCreatePayload } from '../../../models/radnik';
import { parseApiError } from '../../../shared/parse-api-error';

@Component({
  selector: 'app-radnik-unos',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './radnik-unos.component.html',
  styleUrl: './radnik-unos.component.scss'
})
export class RadnikUnosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private radnikService = inject(RadnikService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Postavljen kad se uređuje postojeći radnik (/radnici/:id/uredi).
  radnikId = signal<number | null>(null);
  loading = signal(false);
  loadError = signal<string | null>(null);
  submitLoading = signal(false);
  submitError = signal<string | null>(null);

  private readonly DATE_FIELDS = ['datum_rodjenja', 'datum_zaposlenja'] as const;

  form = this.fb.group({
    ime: ['', Validators.required],
    prezime: ['', Validators.required],
    oib: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    struka: ['', Validators.required],
    datum_rodjenja: [''],
    drzavljanstvo: [''],
    broj_putovnice: [''],
    adresa: [''],
    telefon: [''],
    email: ['', Validators.email],
    poslodavac: [''],
    datum_zaposlenja: [''],
    status: ['aktivan', Validators.required],
    napomena: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.radnikId.set(Number(id));
      this.load(Number(id));
    }
  }

  private load(id: number): void {
    this.loading.set(true);
    this.radnikService.getRadnik(id).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: radnik => this.fillForm(radnik),
      error: (err: HttpErrorResponse) =>
        this.loadError.set(err.status === 404 ? 'Radnik nije pronađen.' : parseApiError(err))
    });
  }

  private fillForm(radnik: Radnik): void {
    const { id, dozvole, created_at, updated_at, ...podaci } = radnik;
    this.form.patchValue({
      ...podaci,
      datum_rodjenja: podaci.datum_rodjenja ?? '',
      datum_zaposlenja: podaci.datum_zaposlenja ?? ''
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = { ...raw } as unknown as RadnikCreatePayload;

    for (const field of this.DATE_FIELDS) {
      if (!raw[field]) {
        (payload as any)[field] = null;
      }
    }

    this.submitError.set(null);
    this.submitLoading.set(true);

    const id = this.radnikId();
    const request = id
      ? this.radnikService.updateRadnik(id, payload)
      : this.radnikService.createRadnik(payload);

    request.pipe(
      finalize(() => this.submitLoading.set(false))
    ).subscribe({
      next: radnik => this.router.navigate(['/radnici', radnik.id]),
      error: (err: HttpErrorResponse) => this.submitError.set(parseApiError(err))
    });
  }
}
