from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from kadrovska_zadar.models import Dokument, RadnaDozvola, Radnik


class DokumentacijaFilterTests(TestCase):
    URL = '/api/kadrovska-zadar/radnici/'

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(get_user_model().objects.create_user('test', password='x'))
        self.danas = timezone.localdate()

    def radnik(self, oib, broj_putovnice='P123'):
        return Radnik.objects.create(ime='Ime', prezime=oib, oib=oib, struka='Zidar', broj_putovnice=broj_putovnice)

    def dozvola(self, radnik, dana_do_isteka):
        return RadnaDozvola.objects.create(
            radnik=radnik, vrsta=RadnaDozvola.Vrsta.DOZVOLA_BORAVAK_RAD,
            datum_isteka=self.danas + timedelta(days=dana_do_isteka),
        )

    def dokument(self, radnik, vrsta, dozvola=None):
        # Samo putanja, bez stvarne datoteke: storage je vezan uz pravi PRIVATE_MEDIA_ROOT.
        return Dokument.objects.create(
            radnik=radnik, vrsta=vrsta, dozvola=dozvola, naziv=vrsta, izvorni_naziv=f'{vrsta}.pdf', velicina=5,
            datoteka=f'radnici/test/{vrsta}.pdf',
        )

    def potpun_radnik(self, oib):
        r = self.radnik(oib)
        d = self.dozvola(r, 365)
        self.dokument(r, Dokument.Vrsta.PUTOVNICA)
        self.dokument(r, Dokument.Vrsta.RADNA_DOZVOLA, dozvola=d)
        self.dokument(r, Dokument.Vrsta.UGOVOR)
        return r

    def oibi(self, dokumentacija):
        res = self.client.get(self.URL, {'dokumentacija': dokumentacija})
        self.assertEqual(res.status_code, 200)
        return {r['oib'] for r in res.data['results']}

    def test_potpuna_i_nepotpuna(self):
        self.potpun_radnik('00000000001')

        bez_ugovora = self.radnik('00000000002')
        d = self.dozvola(bez_ugovora, 365)
        self.dokument(bez_ugovora, Dokument.Vrsta.PUTOVNICA)
        self.dokument(bez_ugovora, Dokument.Vrsta.RADNA_DOZVOLA, dozvola=d)

        self.radnik('00000000003')  # bez ičega, ni dozvole

        self.assertEqual(self.oibi('potpuna'), {'00000000001'})
        self.assertEqual(self.oibi('nepotpuna'), {'00000000002', '00000000003'})

    def test_istekla_dozvola_je_nepotpuna(self):
        r = self.potpun_radnik('00000000001')
        r.dozvole.update(datum_isteka=self.danas - timedelta(days=1))
        self.assertEqual(self.oibi('nepotpuna'), {'00000000001'})

    def test_bez_broja_putovnice_je_nepotpuna(self):
        r = self.potpun_radnik('00000000001')
        Radnik.objects.filter(pk=r.pk).update(broj_putovnice='')
        self.assertEqual(self.oibi('nepotpuna'), {'00000000001'})

    def test_pdf_stare_dozvole_se_ne_racuna(self):
        r = self.potpun_radnik('00000000001')
        # Nova dozvola bez PDF-a; PDF postoji samo za staru.
        self.dozvola(r, 800)
        self.assertEqual(self.oibi('nepotpuna'), {'00000000001'})

    def test_nepovezani_pdf_dozvole_se_racuna(self):
        r = self.potpun_radnik('00000000001')
        r.dokumenti.filter(vrsta=Dokument.Vrsta.RADNA_DOZVOLA).update(dozvola=None)
        self.assertEqual(self.oibi('potpuna'), {'00000000001'})

    def test_kombinacija_sa_stanjem_dozvole(self):
        self.potpun_radnik('00000000001')
        res = self.client.get(self.URL, {'dokumentacija': 'potpuna', 'stanje_dozvole': 'vazeca'})
        self.assertEqual(res.data['count'], 1)
