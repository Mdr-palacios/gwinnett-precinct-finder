# Gwinnett County Election Day Precinct Finder

An interactive map and searchable directory of all **156 Election Day polling locations** in Gwinnett County, Georgia. Built for voters to quickly look up their assigned precinct, see it on a map, and get turn-by-turn directions.

🔗 **Live site:** https://mdr-palacios.github.io/gwinnett-precinct-finder/

![Gwinnett Precinct Finder](https://img.shields.io/badge/Precincts-156-c9a227?style=flat-square) ![Status](https://img.shields.io/badge/Status-Live-0b2545?style=flat-square)

## Features

- 🔍 **Search** by precinct number, precinct name, polling location, address, or city
- 🗺️ **Interactive map** with clustered markers (Leaflet + OpenStreetMap)
- 📍 **"Use my location"** sorts polling places by distance and highlights the closest
- 🏙️ **City filter** — narrow to Lawrenceville, Snellville, Lilburn, Duluth, etc.
- 🧭 **One-click directions** in Google Maps or Apple Maps
- 🔗 **Deep linking** — share `?precinct=017` to auto-open a specific precinct
- 📱 **Mobile-responsive** for voters checking on phones
- ♿ Accessible markup, semantic HTML, keyboard navigation

## Data source

All polling location data is parsed directly from the official Gwinnett County Voter Registrations & Elections PDF:

> [gwinnett-county-polling-locations.pdf](https://www.gwinnettcounty.com/static/departments/elections/pdf/gwinnett-county-polling-locations.pdf) — Revised 10.09.2025

Addresses are geocoded with the U.S. Census Bureau geocoder (with OpenStreetMap Nominatim as fallback) and stored in [`precincts.json`](./precincts.json).

> ⚠️ **This is an unofficial community tool.** Always verify your precinct assignment on the [Georgia My Voter Page](https://mvp.sos.ga.gov/s/) before heading to the polls.

## Election Day basics

- **Polls open:** 7:00 a.m. – 7:00 p.m. on Election Day
- **You must vote at your assigned precinct** on Election Day (unlike advance voting)
- **Bring photo ID:** GA driver's license, state ID, passport, military ID, etc.
- **Problems at the polls?** Call **866-OUR-VOTE** (English) or **888-VE-Y-VOTA** (Spanish)

## Local development

No build step. It's plain HTML, CSS, and vanilla JavaScript.

```bash
git clone https://github.com/Mdr-palacios/gwinnett-precinct-finder.git
cd gwinnett-precinct-finder
python3 -m http.server 8000
# open http://localhost:8000
```

## Updating the data

1. Download the latest [Gwinnett polling locations PDF](https://www.gwinnettcounty.com/static/departments/elections/pdf/gwinnett-county-polling-locations.pdf).
2. Re-run the parsing + geocoding script (see `scripts/` or rebuild from the PDF text).
3. Commit the updated `precincts.json` — GitHub Pages will redeploy automatically.

## Tech stack

- HTML/CSS (Georgia typeface) + vanilla JS — no framework
- [Leaflet](https://leafletjs.com/) for the map
- [Leaflet.markercluster](https://github.com/Leaflet/Leaflet.markercluster) for marker clustering
- OpenStreetMap tiles
- Hosted free on GitHub Pages

## Color palette

| Color | Hex | Role |
|---|---|---|
| Light Blue | `#e6f0fa` | Background |
| Sky | `#b8d8ec` | Borders, soft accents |
| Navy | `#0b2545` | Primary, text, header |
| Gold | `#c9a227` | Accents, CTAs, highlights |

## License

MIT — free to fork, reuse, and adapt for other counties. Attribution appreciated.

## Credits

Built by [Rosario Palacios](https://palacioscontigo.community) / **Palacios Contigo** to support Georgia voters.
Election protection work in coordination with [Common Cause Georgia](https://www.commoncause.org/georgia/) and the broader voter protection coalition.

For other Georgia counties, fork this repo and swap in your county's PDF — the structure is reusable.
