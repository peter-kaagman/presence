Create Table If Not Exists locaties(
    naam Text Not Null Primary Key,
    aktief Integer Default 0,
    group_staf Text,
    group_lln Text,
    leerlingen_toegang Integer Default 0
);
Create Table If Not Exists medewerkers(
    upn Text Not Null,
    timestamp_aanwezig  Integer Default 0,
    opmerking Text,
    opmerking_uit_agenda Integer Default 0,
    agenda_prefix Text
);

Insert Into locaties ('naam','aktief','group_staf') values ('presence.test.writer',1,'presence-test');
Insert Into locaties ('naam','aktief','group_staf') values ('presence.test.reader',1,'presence-test');
Insert Into locaties ('naam','aktief','group_staf') values ('presence.test2.writer',1,'presence-test2');
Insert Into medewerkers ('upn','timestamp_aanwezig','opmerking') values ('t.staf@atlascollege.nl','2023-11-13 08:11','ben er');
Insert Into medewerkers ('upn','timestamp_aanwezig','opmerking') values ('p.kaagman@atlascollege.nl','2023-11-21 08:11','ben er');
