Create Table If Not Exists locaties(
    id Int Not Null AUTO_INCREMENT Primary Key,
    naam varchar(255) Not Null,
    aktief Int Default 1,
    group_staf varchar(255),
    group_lln varchar(255),
    leerlingen_toegang Int Default 0
);
Create Table If Not Exists medewerkers(
    id Int Not Null AUTO_INCREMENT Primary Key,
    upn varchar(255) Not Null,
    timestamp_aanwezig datetime Default '0000-00-00 00:00',
    opmerking varchar(255) Default "",
    sticky_opmerking Int Default 0,
    timestamp_opmerking datetime Default '0000-00-00 00:00',
    opmerking_uit_agenda Int Default 0,
    agenda_prefix varchar(255) Default ""
);
/*
DELIMITER $$
Create Trigger UpdateTsOpmerking
    After UPDATE
    On medewerkers
    For Each row
Begin 
    If Old.opmerking <> New.opmerking Then
        Update medewerkers Set timestamp_opmerking=CURRENT_TIMESTAMP Where upn=OLD.upn;
    END IF;
END$$
DELIMITER ;
*/
/*
Create Trigger [InsertTsOpmerking]
    After INSERT
    On medewerkers
    For Each row
    When length(NEW.opmerking) > 1
Begin 
    Update medewerkers Set timestamp_opmerking=CURRENT_TIMESTAMP Where upn=NEW.upn;
END;
*/

INSERT INTO locaties (`naam`,`aktief`,`group_staf`) VALUES('presence.test2.writer',1,'presence-test2');
INSERT INTO locaties (`naam`,`aktief`,`group_staf`)  VALUES('presence.ict.writer',1,'ASC Systeembeheer');



