import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { LoginService } from '../services/login.service';
import { RadnikService } from '../services/radnik.service';
import { USKORO_ISTJECE_DANA } from '../shared/stanje-dozvole';

interface Upozorenje {
  tekst: string;
  ikona: string;
  razina: 'danger' | 'warning';
  filter: Record<string, string>;
  broj: number;
}

// Filtri popisa radnika čiji se broj prikazuje kao upozorenje (samo aktivni radnici).
const UPOZORENJA: Omit<Upozorenje, 'broj'>[] = [
  {
    tekst: 'ima nepotpunu dokumentaciju',
    ikona: 'fa fa-folder-open-o',
    razina: 'danger',
    filter: { status: 'aktivan', dokumentacija: 'nepotpuna' }
  },
  {
    tekst: 'ima isteklu radnu dozvolu',
    ikona: 'fa fa-exclamation-circle',
    razina: 'danger',
    filter: { status: 'aktivan', stanje_dozvole: 'istekla' }
  },
  {
    tekst: `ima radnu dozvolu koja istječe u sljedećih ${USKORO_ISTJECE_DANA} dana`,
    ikona: 'fa fa-clock-o',
    razina: 'warning',
    filter: { status: 'aktivan', stanje_dozvole: 'uskoro' }
  },
  {
    tekst: 'nema unesenu radnu dozvolu',
    ikona: 'fa fa-exclamation-triangle',
    razina: 'danger',
    filter: { status: 'aktivan', stanje_dozvole: 'bez' }
  }
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  loginService = inject(LoginService);
  private radnikService = inject(RadnikService);

  upozorenja = signal<Upozorenje[] | null>(null);
  error = signal(false);

  // 1 aktivni radnik, 2 aktivna radnika, 5 aktivnih radnika
  radnika(broj: number): string {
    const d = broj % 10, s = broj % 100;
    if (d === 1 && s !== 11) {
      return 'aktivni radnik';
    }
    return d >= 2 && d <= 4 && (s < 12 || s > 14) ? 'aktivna radnika' : 'aktivnih radnika';
  }

  ngOnInit(): void {
    forkJoin(UPOZORENJA.map(u =>
      this.radnikService.getRadnici(u.filter).pipe(map(res => ({ ...u, broj: res.count })))
    )).pipe(
      catchError(() => {
        this.error.set(true);
        return of([]);
      })
    ).subscribe(upozorenja => this.upozorenja.set(upozorenja.filter(u => u.broj > 0)));
  }
}
