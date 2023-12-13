Create Table If Not Exists locaties(
    naam Text Not Null Primary Key,
    aktief Integer Default 1,
    group_staf Text,
    group_lln Text,
    leerlingen_toegang Integer Default 0
);
Create Table If Not Exists medewerkers(
    upn Text Not Null,
    timestamp_aanwezig Text Default "2023-11-28T09:47:46.129Z",
    opmerking Text Default "",
    sticky_opmerking Integer Default 0,
    timestamp_opmerking Text Default "2023-11-28T09:47:46.129Z",
    opmerking_uit_agenda Integer Default 0,
    agenda_prefix Text Default ""
);

Create Trigger [UpdateTsOpmerking]
    After UPDATE
    On medewerkers
    For Each row
    When NEW.opmerking <> Old.opmerking
Begin 
    Update medewerkers Set timestamp_opmerking=CURRENT_TIMESTAMP Where upn=OLD.upn;
END;

Create Trigger [InsertTsOpmerking]
    After INSERT
    On medewerkers
    For Each row
    When length(NEW.opmerking) > 1
Begin 
    Update medewerkers Set timestamp_opmerking=CURRENT_TIMESTAMP Where upn=NEW.upn;
END;

INSERT INTO locaties VALUES('presence.test2.writer',1,'presence-test2',NULL,0);
INSERT INTO locaties VALUES('presence.ict.writer',1,'ASC Systeembeheer',NULL,0);


