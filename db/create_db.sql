Create Table If Not Exists locaties(
    naam Text Not Null Primary Key,
    aktief Integer Default 1,
    group_staf Text,
    group_lln Text,
    leerlingen_toegang Integer Default 0
);
Create Table If Not Exists medewerkers(
    upn Text Not Null,
    timestamp_aanwezig  Integer Default 0,
    opmerking Text Default " ",
    opmerking_uit_agenda Integer Default 0,
    agenda_prefix Text Default " "
);


