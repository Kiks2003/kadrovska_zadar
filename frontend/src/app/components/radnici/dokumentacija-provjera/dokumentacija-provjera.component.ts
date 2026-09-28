import { Component, computed, input, output } from '@angular/core';
import { Radnik } from '../../../models/radnik';
import { provjeriDokumentaciju, StavkaDokumentacije } from '../../../shared/dokumentacija';

@Component({
  selector: 'app-dokumentacija-provjera',
  standalone: true,
  templateUrl: './dokumentacija-provjera.component.html',
  styleUrl: './dokumentacija-provjera.component.scss'
})
export class DokumentacijaProvjeraComponent {
  radnik = input.required<Radnik>();
  // Korisnik želi popuniti stavku koja nedostaje.
  popuni = output<StavkaDokumentacije>();

  stavke = computed(() => provjeriDokumentaciju(this.radnik()));
  brojNedostaje = computed(() => this.stavke().filter(s => !s.ispunjeno).length);
}
