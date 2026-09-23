import { Component, computed, HostListener, inject, input, output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Prozor za pregled PDF-a unutar aplikacije (preglednikov ugrađeni PDF preglednik).
@Component({
  selector: 'app-pdf-pregled',
  standalone: true,
  templateUrl: './pdf-pregled.component.html',
  styleUrl: './pdf-pregled.component.scss'
})
export class PdfPregledComponent {
  private sanitizer = inject(DomSanitizer);

  // blob: URL koji je napravila ova aplikacija (URL.createObjectURL).
  url = input.required<string>();
  naslov = input('');

  preuzmi = output<void>();
  zatvori = output<void>();

  sigurniUrl = computed<SafeResourceUrl>(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(this.url())
  );

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.zatvori.emit();
  }
}
