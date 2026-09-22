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
  vrsta_dozvole: VrstaDozvole | '';
  datum_izdavanja_dozvole: string | null;
  datum_isteka_dozvole: string | null;
  napomena: string;
  created_at: string;
  updated_at: string;
}

export type RadnikCreatePayload = Omit<Radnik, 'id' | 'created_at' | 'updated_at'>;

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
