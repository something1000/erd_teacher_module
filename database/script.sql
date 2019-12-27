drop table IF EXISTS Draw;
drop table IF EXISTS Comment;
--drop table DiagramMap;
--drop table Document;

drop trigger IF EXISTS cancel_confirm_other_report on report;
drop table IF EXISTS Report;
--drop table Student;

drop table IF EXISTS Term;
drop table IF EXISTS Teacher;

drop table IF EXISTS Settings;

drop function IF EXISTS check_confirmed_reports();

ALTER DATABASE postgres SET timezone TO 'Europe/Warsaw';
SELECT pg_reload_conf();

CREATE TABLE Teacher(
	Login varchar(50) unique,
	Password varchar(255),
	FirstName varchar(30) not null,
	LastName varchar(30) not null
);


CREATE TABLE Term(
	id serial PRIMARY KEY,
	Code varchar(30) not null,
	Day varchar(30) not null,
	Hour varchar(30) not null,
	Year smallint not null,
	Active bool,
	Teacher varchar(50),
	Deadline varchar(30),
	FOREIGN KEY (Teacher) REFERENCES Teacher(Login) ON DELETE SET NULL
);

-- CREATE TABLE Student(
-- 	Index int PRIMARY KEY,
-- 	Email varchar(100) not null,
-- 	Term_id int,
-- 	FOREIGN KEY(Term_id) REFERENCES Term(id) ON DELETE SET NULL
-- );

CREATE TABLE Report(
	id uuid PRIMARY KEY default uuid_generate_v4(),
	SendDate timestamp(0) default CURRENT_TIMESTAMP,
	Confirmed bool default false,
	Notes varchar(255),
	Rating float,
	rate_done bool default false,
	Shared bool default false,
	Student_id int not null,
	Term_id int, -- not null, -- temporary - set to not null
	-- json_report text not null, /*usun Document i diagram map chyba */
	image_src varchar(25),
	json_report text,  -- zamienic na linijke wyzej
	version int,
	CONSTRAINT term_report_fk FOREIGN KEY(Term_id) REFERENCES Term(id) ON DELETE CASCADE
);

-- CREATE TABLE Document(
	-- id serial PRIMARY KEY,
	-- Paragraph varchar(50) not null,
	-- Text text,
	-- Report_id int not null,
	-- FOREIGN KEY(Report_id) REFERENCES Report(id) ON DELETE CASCADE
-- );

-- CREATE TABLE DiagramMap(
	-- id serial PRIMARY KEY,
	-- Position box not null, -- przechowuje pare punktów ((x1,y1), (x2,y2)) - w naszym przypadku para (start, wymiar)
	-- Paragraph varchar(100) not null,
	-- FOREIGN KEY(Paragraph_id) REFERENCES Document(id) ON DELETE CASCADE
-- );



CREATE TABLE Comment(
	id serial PRIMARY KEY,
	key int not null,
	Text text,
	Priority smallint,
	Position point not null, -- przechowuje pare punktów (x1,y1) - w naszym przypadku start
	Bounds point null, --przechowuje rozmiar ramki -- jesli puste znaczy zwykly komentarz
	Report_id uuid not null,
	Window_side smallint not null, -- 1-lewa strona (diagram), 2-prawa strona(dokument)
	FOREIGN KEY(Report_id) REFERENCES Report(id) ON DELETE CASCADE,
	UNIQUE(key, Report_id, Window_side)
);

CREATE TABLE Draw(
	id serial PRIMARY KEY,
	key int not null,
	Path path not null,
	Report_id uuid not null,
	Window_side smallint not null, -- 1-lewa strona (diagram), 2-prawa strona(dokument)
	FOREIGN KEY(Report_id) REFERENCES Report(id) ON DELETE CASCADE,
	UNIQUE(key, Report_id, Window_side)
);

CREATE FUNCTION check_confirmed_reports() RETURNS trigger AS $check_confirmed_reports$
    BEGIN
        IF (SELECT id from report where confirmed = true and (shared = false or rate_done = false) and student_id = NEW.student_id LIMIT 1) != NEW.id THEN
            RAISE EXCEPTION 'Other report already confirmed by this student' USING ERRCODE='09000';
        END IF;
		
        RETURN NEW;
    END;
$check_confirmed_reports$ LANGUAGE plpgsql;


CREATE TRIGGER cancel_confirm_other_report
    BEFORE UPDATE OF confirmed ON report
    FOR EACH ROW
    EXECUTE PROCEDURE check_confirmed_reports();

CREATE TABLE settings(
	settings json
);

INSERT INTO teacher VALUES ('admin', '$2b$10$mQhxJGzzhCe7pCR3CyNki.j17brHhRmAoyC/6PobF3iqe5MctTRf2', 'admin', 'admin');


INSERT INTO settings 
VALUES ('{"default_note":"/6   - Analysis of the task\n/14 - ERD diagram\n/4   - Description of entities\n/4   - Description of attributes\n/4   - Description of relationships\n/8   - Relational database schema","max_points":"40"}');