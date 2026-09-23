import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RadnikService } from '../../../services/radnik.service';
import { Radnik, STATUS_LABELS } from '../../../models/radnik';
import { parseApiError } from '../../../shared/parse-api-error';

@Component({
  selector: 'app-radnici-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './radnici-list.component.html',
  styleUrl: './radnici-list.component.scss'
})
export class RadniciListComponent implements OnInit {
  private radnikService = inject(RadnikService);

  radnici = signal<Radnik[]>([]);
  totalCount = signal(0);
  loading = signal(false);
  deleteError = signal<string | null>(null);

  readonly STATUS_LABELS = STATUS_LABELS;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.radnikService.getRadnici().subscribe({
      next: res => {
        this.radnici.set(res.results);
        this.totalCount.set(res.count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  remove(radnik: Radnik): void {
    if (!confirm(`Obrisati radnika ${radnik.ime} ${radnik.prezime}?`)) {
      return;
    }
    this.deleteError.set(null);
    this.radnikService.deleteRadnik(radnik.id).subscribe({
      next: () => {
        this.radnici.update(list => list.filter(r => r.id !== radnik.id));
        this.totalCount.update(count => count - 1);
      },
      error: (err: HttpErrorResponse) => this.deleteError.set(parseApiError(err))
    });
  }
}
