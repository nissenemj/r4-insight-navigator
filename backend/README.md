
# R4 Insight Navigator Backend

Backend API palvelu R4 Insight Navigator -sovellukselle.

## Asennus ja käynnistys

```bash
cd backend
npm install
npm run dev  # Kehitystila
npm start    # Tuotanto
```

## API-päätepisteet

### Terveyden tarkistus
- `GET /api/health` - Palvelimen tilan tarkistus

### KPI-mittarit
- `GET /api/kpi/overview?region=all` - Yleiskatsaus mittareista
- `GET /api/kpi/:area?region=kuopio` - Mittarit osa-alueelle
- `GET /api/kpi/comparison?areas=emergency&period=6months` - Vertailutiedot
- `GET /api/kpi/trends/:area?region=kuopio&period=12months` - Trenditiedot
- `GET /api/kpi/costs?region=all&period=12months` - Kustannustiedot

### Hälytykset
- `GET /api/alerts?region=kuopio&severity=high` - Aktiiviset hälytykset
- `POST /api/alerts` - Uuden hälytyksen luonti

### Toimipisteet
- `GET /api/regions` - Saatavilla olevat toimipisteet

## Ominaisuudet

- Sotkanet API integraatio
- Älykkäät analyysit ja suositukset
- Hälytykset automaattisesti generoiduilla toimenpide-ehdotuksilla
- CORS-tuki frontend-integraatiolle
- Virheenkäsittely ja fallback-data

## Tekniset tiedot

- Node.js + Express
- Sotkanet API integraatio
- Automaattinen data-analytiikka
- RESTful API suunnittelu
