from datetime import date

from django.core.management.base import BaseCommand

from kadrovska_zadar.models import RadnaDozvola, Radnik

S = Radnik.Status
D = RadnaDozvola.Vrsta

RADNICI = [
    dict(ime='Ramesh', prezime='Thapa', oib='10000000001', struka='Zidar',
         datum_rodjenja=date(1988, 3, 14), drzavljanstvo='Nepal',
         adresa='Put Bokanjca 12, Zadar', telefon='+385 91 111 0001', email='ramesh.thapa@example.com',
         poslodavac='Zadar Gradnja d.o.o.', datum_zaposlenja=date(2024, 4, 1), status=S.AKTIVAN,
         broj_putovnice='PA1234567', vrsta_dozvole=D.DOZVOLA_BORAVAK_RAD,
         datum_izdavanja_dozvole=date(2024, 3, 20), datum_isteka_dozvole=date(2025, 3, 20)),
    dict(ime='Sanjay', prezime='Gurung', oib='10000000002', struka='Tesar',
         datum_rodjenja=date(1991, 7, 2), drzavljanstvo='Nepal',
         adresa='Ulica Stjepana Radića 5, Zadar', telefon='+385 91 111 0002', email='sanjay.gurung@example.com',
         poslodavac='Zadar Gradnja d.o.o.', datum_zaposlenja=date(2025, 2, 15), status=S.AKTIVAN,
         broj_putovnice='PA2345678', vrsta_dozvole=D.DOZVOLA_BORAVAK_RAD,
         datum_izdavanja_dozvole=date(2025, 2, 1), datum_isteka_dozvole=date(2026, 10, 15)),
    dict(ime='Maria', prezime='Santos', oib='10000000003', struka='Sobarica',
         datum_rodjenja=date(1994, 11, 23), drzavljanstvo='Filipini',
         adresa='Obala kneza Branimira 8, Zadar', telefon='+385 92 222 0003', email='maria.santos@example.com',
         poslodavac='Hotel Adriatic Zadar', datum_zaposlenja=date(2025, 5, 1), status=S.AKTIVAN,
         broj_putovnice='P4567890A', vrsta_dozvole=D.DOZVOLA_BORAVAK_RAD,
         datum_izdavanja_dozvole=date(2025, 4, 10), datum_isteka_dozvole=date(2026, 4, 10)),
    dict(ime='Jose', prezime='Reyes', oib='10000000004', struka='Kuhar',
         datum_rodjenja=date(1986, 1, 9), drzavljanstvo='Filipini',
         adresa='Ulica Ivana Mažuranića 3, Zadar', telefon='+385 92 222 0004', email='jose.reyes@example.com',
         poslodavac='Hotel Adriatic Zadar', datum_zaposlenja=date(2024, 6, 1), status=S.AKTIVAN,
         broj_putovnice='P5678901B', vrsta_dozvole=D.DOZVOLA_BORAVAK_RAD,
         datum_izdavanja_dozvole=date(2025, 5, 20), datum_isteka_dozvole=date(2027, 5, 20)),
    dict(ime='Nemanja', prezime='Petrović', oib='10000000005', struka='Vozač C kategorije',
         datum_rodjenja=date(1983, 5, 30), drzavljanstvo='Srbija',
         adresa='Put Murvice 21, Zadar', telefon='+385 95 333 0005', email='nemanja.petrovic@example.com',
         poslodavac='Transport Jadran d.o.o.', datum_zaposlenja=date(2023, 9, 1), status=S.AKTIVAN,
         broj_putovnice='012345678', vrsta_dozvole=D.POTVRDA_PRIJAVA_RADA,
         datum_izdavanja_dozvole=date(2025, 8, 25), datum_isteka_dozvole=date(2026, 8, 25)),
    dict(ime='Adnan', prezime='Hodžić', oib='10000000006', struka='Električar',
         datum_rodjenja=date(1990, 9, 17), drzavljanstvo='Bosna i Hercegovina',
         adresa='Ulica Domovinskog rata 44, Zadar', telefon='+385 95 333 0006', email='adnan.hodzic@example.com',
         poslodavac='Elektro Zadar d.o.o.', datum_zaposlenja=date(2025, 3, 10), status=S.AKTIVAN,
         broj_putovnice='A1234567', vrsta_dozvole=D.DOZVOLA_BORAVAK_RAD,
         datum_izdavanja_dozvole=date(2025, 3, 1), datum_isteka_dozvole=date(2026, 11, 1)),
    dict(ime='Rahul', prezime='Sharma', oib='10000000007', struka='Softverski inženjer',
         datum_rodjenja=date(1992, 12, 5), drzavljanstvo='Indija',
         adresa='Ulica Hrvatskog sabora 2, Zadar', telefon='+385 98 444 0007', email='rahul.sharma@example.com',
         poslodavac='Dalmacija Tech d.o.o.', datum_zaposlenja=date(2025, 1, 7), status=S.AKTIVAN,
         broj_putovnice='Z9876543', vrsta_dozvole=D.PLAVA_KARTA_EU,
         datum_izdavanja_dozvole=date(2024, 12, 15), datum_isteka_dozvole=date(2027, 12, 15)),
    dict(ime='Aziz', prezime='Karimov', oib='10000000008', struka='Konobar',
         datum_rodjenja=date(1997, 4, 18), drzavljanstvo='Uzbekistan',
         adresa='Kalelarga 10, Zadar', telefon='+385 98 444 0008', email='aziz.karimov@example.com',
         poslodavac='Restoran Foša', datum_zaposlenja=date(2024, 5, 15), status=S.NEAKTIVAN,
         broj_putovnice='FA7654321', vrsta_dozvole=D.DOZVOLA_BORAVAK_RAD,
         datum_izdavanja_dozvole=date(2024, 5, 1), datum_isteka_dozvole=date(2024, 11, 1),
         napomena='Sezonski ugovor završen.'),
    dict(ime='Tran', prezime='Van Minh', oib='10000000009', struka='Zavarivač',
         datum_rodjenja=date(1989, 8, 11), drzavljanstvo='Vijetnam',
         adresa='Ulica Put Dikla 7, Zadar', telefon='+385 99 555 0009', email='tran.vanminh@example.com',
         poslodavac='Brodogradilište Zadar d.o.o.', datum_zaposlenja=date(2025, 6, 2), status=S.AKTIVAN,
         broj_putovnice='C1234567', vrsta_dozvole=D.DOZVOLA_BORAVAK_RAD,
         datum_izdavanja_dozvole=date(2025, 5, 15), datum_isteka_dozvole=date(2026, 10, 5)),
    dict(ime='Olena', prezime='Kovalenko', oib='10000000010', struka='Medicinska sestra',
         datum_rodjenja=date(1985, 2, 27), drzavljanstvo='Ukrajina',
         adresa='Ulica Bože Peričića 15, Zadar', telefon='+385 99 555 0010', email='olena.kovalenko@example.com',
         poslodavac='Opća bolnica Zadar', datum_zaposlenja=date(2023, 3, 1), status=S.AKTIVAN,
         broj_putovnice='FF123456', vrsta_dozvole=D.OSTALO,
         datum_izdavanja_dozvole=date(2025, 3, 4), datum_isteka_dozvole=date(2027, 3, 4),
         napomena='Privremena zaštita.'),
]

# Ranije (istekle) dozvole, da profil prikaže povijest.
PRETHODNE_DOZVOLE = {
    '10000000002': dict(vrsta=D.DOZVOLA_BORAVAK_RAD, datum_izdavanja=date(2024, 2, 1), datum_isteka=date(2025, 1, 31)),
    '10000000004': dict(vrsta=D.DOZVOLA_BORAVAK_RAD, datum_izdavanja=date(2024, 5, 20), datum_isteka=date(2025, 5, 19)),
    '10000000005': dict(vrsta=D.POTVRDA_PRIJAVA_RADA, datum_izdavanja=date(2023, 8, 25), datum_isteka=date(2024, 8, 24)),
    '10000000010': dict(vrsta=D.OSTALO, datum_izdavanja=date(2023, 3, 4), datum_isteka=date(2025, 3, 3),
                        napomena='Privremena zaštita – prvo rješenje.'),
}


class Command(BaseCommand):
    help = 'Kreira ili ažurira 10 primjera radnika (po OIB-u).'

    def handle(self, *args, **options):
        created_count = 0
        for podaci in RADNICI:
            podaci = dict(podaci)
            oib = podaci.pop('oib')
            dozvole = [dict(
                vrsta=podaci.pop('vrsta_dozvole'),
                datum_izdavanja=podaci.pop('datum_izdavanja_dozvole'),
                datum_isteka=podaci.pop('datum_isteka_dozvole'),
            )]
            if oib in PRETHODNE_DOZVOLE:
                dozvole.append(PRETHODNE_DOZVOLE[oib])

            radnik, created = Radnik.objects.update_or_create(oib=oib, defaults=podaci)
            created_count += created

            for dozvola in dozvole:
                dozvola = dict(dozvola)
                RadnaDozvola.objects.update_or_create(
                    radnik=radnik,
                    datum_izdavanja=dozvola.pop('datum_izdavanja'),
                    defaults={'izdao': 'PU zadarska', **dozvola},
                )
        self.stdout.write(self.style.SUCCESS(
            f'Kreirano: {created_count}, ažurirano: {len(RADNICI) - created_count}.'
        ))
