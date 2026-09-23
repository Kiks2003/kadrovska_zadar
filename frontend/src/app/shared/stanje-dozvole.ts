export const USKORO_ISTJECE_DANA = 60;

export type StanjeDozvole = 'istekla' | 'uskoro' | 'vazeca';

// Broj dana od danas do datuma (YYYY-MM-DD); negativan ako je prošao.
export function danaDo(datum: string): number {
  const danas = new Date();
  danas.setHours(0, 0, 0, 0);
  const [y, m, d] = datum.split('-').map(Number);
  return Math.round((new Date(y, m - 1, d).getTime() - danas.getTime()) / 86_400_000);
}

export function stanjeDozvole(datumIsteka: string | null): StanjeDozvole | null {
  if (!datumIsteka) {
    return null;
  }
  const dana = danaDo(datumIsteka);
  if (dana < 0) {
    return 'istekla';
  }
  return dana <= USKORO_ISTJECE_DANA ? 'uskoro' : 'vazeca';
}
