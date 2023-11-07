Create Table If Not Exists locaties(
    naam Text Not Null Primary Key,
    aktief Integer Default 0,
    au_staf Text,
    au_lln Text,
    leerlingen_toegang Integer Default 0
);
Create Table If Not Exists medeInsetwerkers(
    upn Text Not Null,
    naam Text Not Null,
    aanwezig Integer Default 0,
    timestamp_aanwezig  Integer Default 0,
    opmerking Text,
    opmerking_uit_agenda Integer Default 0,
    agenda_prefix Text
);
