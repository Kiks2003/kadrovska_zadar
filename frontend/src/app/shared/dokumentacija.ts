import { RadnaDozvola, Radnik, VrstaDokumenta } from '../models/radnik';
import { stanjeDozvole } from './stanje-dozvole';

export type KljucStavke = 'broj_putovnice' | 'putovnica' | 'dozvola' | 'dozvola_pdf' | 'ugovor';

export interface StavkaDokumentacije {
  kljuc: KljucStavke;
  naziv: string;
  ispunjeno: boolean;
  // Što nedostaje, prikazuje se samo kad stavka nije ispunjena.
  napomena?: string;
  // Vrsta PDF-a koji treba učitati da se stavka ispuni.
  vrstaDokumenta?: VrstaDokumenta;
}

// Aktualna dozvola je ona s najkasnijim datumom isteka.
export function aktualnaDozvola(radnik: Radnik): RadnaDozvola | null {
  return radnik.dozvole.reduce<RadnaDozvola | null>(
    (najnovija, d) => d.datum_isteka && (!najnovija || d.datum_isteka > najnovija.datum_isteka) ? d : najnovija,
    null
  );
}

// Pravila moraju odgovarati s_potpunom_dokumentacijom() na backendu (kadrovska_zadar/filters.py).
export function provjeriDokumentaciju(radnik: Radnik): StavkaDokumentacije[] {
  const imaDokument = (vrsta: VrstaDokumenta) => radnik.dokumenti.some(d => d.vrsta === vrsta);
  const dozvola = aktualnaDozvola(radnik);
  const istekla = stanjeDozvole(dozvola?.datum_isteka ?? null) === 'istekla';
  // PDF stare, zamijenjene dozvole se ne računa. Nepovezani PDF se računa, kao i onaj
  // čija je dozvola obrisana (backend mu tada postavlja dozvola = NULL).
  const vrijediZaAktualnu = (id: number | null) =>
    id === null || id === dozvola?.id || !radnik.dozvole.some(d => d.id === id);

  return [
    {
      kljuc: 'broj_putovnice',
      naziv: 'Broj putovnice',
      ispunjeno: !!radnik.broj_putovnice.trim(),
      napomena: 'Nije upisan u podatke radnika.'
    },
    {
      kljuc: 'putovnica',
      naziv: 'Putovnica (PDF)',
      ispunjeno: imaDokument('putovnica'),
      napomena: 'Nije učitana.',
      vrstaDokumenta: 'putovnica'
    },
    {
      kljuc: 'dozvola',
      naziv: 'Važeća radna dozvola',
      ispunjeno: !!dozvola && !istekla,
      napomena: dozvola ? 'Dozvola je istekla.' : 'Nije unesena.'
    },
    {
      kljuc: 'dozvola_pdf',
      naziv: 'Radna dozvola (PDF)',
      ispunjeno: radnik.dokumenti.some(d => d.vrsta === 'radna_dozvola' && vrijediZaAktualnu(d.dozvola)),
      napomena: dozvola ? 'Nije učitana za aktualnu dozvolu.' : 'Nije učitana.',
      vrstaDokumenta: 'radna_dozvola'
    },
    {
      kljuc: 'ugovor',
      naziv: 'Ugovor o radu (PDF)',
      ispunjeno: imaDokument('ugovor'),
      napomena: 'Nije učitan.',
      vrstaDokumenta: 'ugovor'
    }
  ];
}

export function nedostaje(radnik: Radnik): StavkaDokumentacije[] {
  return provjeriDokumentaciju(radnik).filter(s => !s.ispunjeno);
}
