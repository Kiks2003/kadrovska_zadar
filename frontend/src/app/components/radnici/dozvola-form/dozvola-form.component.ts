import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { RadnikService } from '../../../services/radnik.service';
import { RadnaDozvola, RadnaDozvolaPayload, VRSTA_DOZVOLE_LABELS, VrstaDozvole } from '../../../models/radnik';
import { parseApiError } from '../../../shared/parse-api-error';

function istekNakonIzdavanja(group: AbstractControl): ValidationErrors | null {
  const izdavanje = group.get('datum_izdavanja')?.value;
  const istek = group.get('datum_isteka')?.value;
  return izdavanje && istek && istek < izdavanje ? { istekPrijeIzdavanja: true } : null;
}

@Component({
  selector: 'app-dozvola-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './dozvola-form.component.html',
  styleUrl: './dozvola-form.component.scss'
})
export class DozvolaFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private radnikService = inject(RadnikService);

  radnikId = input.required<number>();
  // Ako je zadana, forma uređuje postojeću dozvolu; inače dodaje novu.
  dozvola = input<RadnaDozvola | null>(null);

  saved = output<RadnaDozvola>();
  cancelled = output<void>();

  submitLoading = signal(false);
  submitError = signal<string | null>(null);

  readonly VRSTE = Object.entries(VRSTA_DOZVOLE_LABELS) as [VrstaDozvole, string][];

  form = this.fb.group({
    vrsta: ['dozvola_boravak_rad', Validators.required],
    broj_dozvole: [''],
    izdao: [''],
    datum_izdavanja: [''],
    datum_isteka: ['', Validators.required],
    napomena: ['']
  }, { validators: istekNakonIzdavanja });

  ngOnInit(): void {
    const d = this.dozvola();
    if (d) {
      this.form.patchValue({ ...d, datum_izdavanja: d.datum_izdavanja ?? '' });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      radnik: this.radnikId(),
      datum_izdavanja: raw.datum_izdavanja || null
    } as RadnaDozvolaPayload;

    this.submitError.set(null);
    this.submitLoading.set(true);

    const postojeca = this.dozvola();
    const request = postojeca
      ? this.radnikService.updateDozvola(postojeca.id, payload)
      : this.radnikService.createDozvola(payload);

    request.pipe(
      finalize(() => this.submitLoading.set(false))
    ).subscribe({
      next: dozvola => this.saved.emit(dozvola),
      error: (err: HttpErrorResponse) => this.submitError.set(parseApiError(err))
    });
  }
}
