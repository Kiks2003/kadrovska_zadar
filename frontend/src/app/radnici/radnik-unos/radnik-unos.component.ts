import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { RadnikService } from '../../services/radnik.service';
import { RadnikCreatePayload } from '../../models/radnik';
import { parseApiError } from '../../shared/parse-api-error';

@Component({
  selector: 'app-radnik-unos',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './radnik-unos.component.html',
  styleUrl: './radnik-unos.component.scss'
})
export class RadnikUnosComponent {
  private fb = inject(FormBuilder);
  private radnikService = inject(RadnikService);
  private router = inject(Router);

  submitLoading = signal(false);
  submitError = signal<string | null>(null);

  private readonly DATE_FIELDS = [
    'datum_rodjenja',
    'datum_zaposlenja',
    'datum_izdavanja_dozvole',
    'datum_isteka_dozvole'
  ] as const;

  form = this.fb.group({
    ime: ['', Validators.required],
    prezime: ['', Validators.required],
    oib: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    struka: ['', Validators.required],
    datum_rodjenja: [''],
    drzavljanstvo: [''],
    adresa: [''],
    telefon: [''],
    email: ['', Validators.email],
    poslodavac: [''],
    datum_zaposlenja: [''],
    status: ['aktivan', Validators.required],
    broj_putovnice: [''],
    vrsta_dozvole: [''],
    datum_izdavanja_dozvole: [''],
    datum_isteka_dozvole: [''],
    napomena: ['']
  });

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

    this.radnikService.createRadnik(payload).pipe(
      finalize(() => this.submitLoading.set(false))
    ).subscribe({
      next: () => this.router.navigate(['/radnici']),
      error: (err: HttpErrorResponse) => this.submitError.set(parseApiError(err))
    });
  }
}
