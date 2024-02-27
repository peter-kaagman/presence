# presence
Aan- en afwezigheid registratie voor locaties, NIET op basis van agenda.
_NB_
Deze readme moet niet gezien worden als een handleiding. Het is meer een plan wat wil doen. Het kan zomaar dat de feitelijke implentatie anders is gegaan dan vooraf bedacht is.

## Features

### Must have
- Aan- en afwezigheid registratie voor alle medewerkers van een locatie
- Opmerking bij medewerker door medewerker zelf, voor thuiswerken oid.
- Auto afwezig op ingestelde tijd

### Should have  
- Opmerking vanuit medewerker agenda
- Zoeken naar medewerker
- Werkbaar voor meerdere locaties

### Could have
- Aanwezigheid vanuit Cloudpath oid aan de hand van gekozen device
- Subset gegevens zichtbaar voor leerlingen van de locatie
- App voor mobiel
- App voor teams

## Tools
 - Azure voor medewerkerlijst en authenticatie
 - Dancer2 voor website en api
 - Bootstrap voor layout/css
 - ~~SQLite database voor personal settings en aanwezigheid~~
 - MySQL Database *)

*) Bij een test met 5 gebruikers bleek SQLite niet bestand tegen gelijktijdige updates => locked database bestand.

## Data model

### Locaties
Tabel met daarin de actieve locaties
- Naam (zoals bekend in Azure)
- Aktief ja/nee
- Leerlingen zien data ja/nee

### Medewerkers
Tabel met daarin de medewerkers die zich ooit aanwezig hebben gemeld met hun opmerking
- UPN van medewerker
- Volledige naam
- Aan- afwezig
- Timestamp aanwezigheid
- Opmerking
- Opmerking uit agenda ja/nee
- Agenda prefix
