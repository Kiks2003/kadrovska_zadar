export type RadnikStatus = 'aktivan' | 'neaktivan';
export type VrstaDozvole = 'dozvola_boravak_rad' | 'potvrda_prijava_rada' | 'plava_karta_eu' | 'ostalo';

export interface Radnik {
  id: number;
  ime: string;
  prezime: string;
  oib: string;
  struka: string;
  datum_rodjenja: string | null;
  drzavljanstvo: string;
  adresa: string;
  telefon: string;
  email: string;
  poslodavac: string;
  datum_zaposlenja: string | null;
  status: RadnikStatus;
  broj_putovnice: string;
  napomena: string;
  dozvole: RadnaDozvola[];
  dokumenti: Dokument[];
  created_at: string;
  updated_at: string;
}

export type RadnikCreatePayload = Omit<Radnik, 'id' | 'dozvole' | 'dokumenti' | 'created_at' | 'updated_at'>;

export interface RadnaDozvola {
  id: number;
  radnik: number;
  vrsta: VrstaDozvole;
  broj_dozvole: string;
  izdao: string;
  datum_izdavanja: string | null;
  datum_isteka: string;
  napomena: string;
  created_at: string;
  updated_at: string;
}

export type RadnaDozvolaPayload = Omit<RadnaDozvola, 'id' | 'created_at' | 'updated_at'>;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const STATUS_LABELS: Record<RadnikStatus, string> = {
  aktivan: 'Aktivan',
  neaktivan: 'Neaktivan',
};

export const VRSTA_DOZVOLE_LABELS: Record<VrstaDozvole, string> = {
  dozvola_boravak_rad: 'Dozvola za boravak i rad',
  potvrda_prijava_rada: 'Potvrda o prijavi rada',
  plava_karta_eu: 'EU plava karta',
  ostalo: 'Ostalo',
};

export type VrstaDokumenta = 'radna_dozvola' | 'putovnica' | 'ugovor' | 'ostalo';

export interface Dokument {
  id: number;
  radnik: number;
  dozvola: number | null;
  vrsta: VrstaDokumenta;
  naziv: string;
  izvorni_naziv: string;
  velicina: number;
  created_at: string;
  updated_at: string;
}

export const VRSTA_DOKUMENTA_LABELS: Record<VrstaDokumenta, string> = {
  radna_dozvola: 'Radna dozvola',
  putovnica: 'Putovnica',
  ugovor: 'Ugovor o radu',
  ostalo: 'Ostalo',
};
