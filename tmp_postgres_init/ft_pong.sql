-- https://stackoverflow.com/questions/22256124/cannot-create-a-database-table-named-user-in-postgresql
-- string types: https://www.depesz.com/2010/03/02/charx-vs-varcharx-vs-varchar-vs-text/
-- date time types: https://www.postgresql.org/docs/9.2/datatype-datetime.html
-- time zones: https://www.postgresql.org/docs/7.2/timezones.html
-- https://stackoverflow.com/questions/7577389/how-to-elegantly-deal-with-timezones
-- https://stackoverflow.com/questions/16609724/using-current-time-in-utc-as-default-value-in-postgresql
-- https://stackoverflow.com/questions/27299234/how-do-i-tell-postgres-a-timestamp-within-a-column-is-utc?rq=1


---- first time
-- docker-compose exec postgres bash
-- createdb -U postgres ft_pong && psql -U postgres -v ON_ERROR_STOP=1 ft_pong < /docker-entrypoint-initdb.d/ft_pong.sql

---- delete and recreate db
-- dropdb -U postgres ft_pong && createdb -U postgres ft_pong && psql -U postgres -v ON_ERROR_STOP=1 ft_pong < /docker-entrypoint-initdb.d/ft_pong.sql

-- CREATE DATABASE test_pong
-- 	WITH
-- 	OWNER = postgres;

-- Show existing databases
-- SELECT * FROM pg_database;

-- enfer -> mots reserves (doivent etre double quote, sauf si value -> simple quote): user, password, role, message, name, description, type...

-- generate entities from database :
-- 		npm i -g typeorm-model-generator
--		typeorm-model-generator -h postgres -p 5432 -d ft_pong -u postgres -x qwerty -e postgres -o . -s public


-- database: ft_pong

-- DROP TYPE IF EXISTS user_role;
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'user');

-- DROP TABLE IF EXISTS "user";
CREATE TABLE IF NOT EXISTS "user"(
	id				INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	email			TEXT NOT NULL UNIQUE,
	username		TEXT NOT NULL UNIQUE,
	"password"		TEXT NOT NULL,
	"role"			user_role NOT NULL DEFAULT 'user',
	end_ban			TIMESTAMP WITH TIME ZONE DEFAULT NULL,
	created_at		TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	two_fa_enabled	BOOLEAN NOT NULL DEFAULT FALSE,
	two_fa_secret	TEXT DEFAULT NULL,
	oauth_token_ft	TEXT DEFAULT NULL
);

-- DROP TABLE IF EXISTS user_stat;
CREATE TABLE IF NOT EXISTS user_stat (
   user_id			INTEGER PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
   level			INTEGER NOT NULL DEFAULT 0 CHECK( level >= 0 AND level <= 100),
   victories		INTEGER NOT NULL DEFAULT 0 CHECK( victories >= 0),
   losses			INTEGER NOT NULL DEFAULT 0 CHECK( losses >= 0)
);

-- DROP TYPE IF EXISTS friendship_type;
CREATE TYPE friendship_type AS ENUM ('accepted', 'pending');

-- check for dupplicates A B <-> B A
-- https://stackoverflow.com/questions/10997043/postgres-table-find-duplicates-in-two-columns-regardless-of-order
-- DROP TABLE IF EXISTS friendship;
CREATE TABLE IF NOT EXISTS friendship (
	applicant_id	INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
	recipient_id	INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
	"status"		friendship_type NOT NULL DEFAULT 'pending',
	created_at		TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(applicant_id, recipient_id)
);

ALTER TABLE friendship
ADD CONSTRAINT no_itself_relation
CHECK (applicant_id != recipient_id);

-- DROP TABLE IF EXISTS blocked;
CREATE TABLE IF NOT EXISTS blocked (
	applicant_id	INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
	recipient_id	INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
	created_at		TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY(applicant_id, recipient_id)
);

ALTER TABLE blocked
ADD CONSTRAINT no_itself_relation
CHECK (applicant_id != recipient_id);

-- DROP TABLE IF EXISTS channel;
CREATE TABLE IF NOT EXISTS channel(
	id				INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   	owner_id		INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
	is_dm			BOOLEAN NOT NULL,
	title			TEXT,
	"password"		TEXT DEFAULT NULL,
	created_at		TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
	is_destroyed	BOOLEAN NOT NULL DEFAULT FALSE
);

-- DROP TYPE IF EXISTS user_channel_role;
CREATE TYPE user_channel_role AS ENUM ('admin', 'user');

-- DROP TABLE IF EXISTS user_channel;
CREATE TABLE IF NOT EXISTS user_channel(
  	user_id			INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
	channel_id		INTEGER REFERENCES channel(id) ON DELETE CASCADE,
	"role"			user_channel_role NOT NULL DEFAULT 'user',
	end_ban			TIMESTAMP WITH TIME ZONE DEFAULT NULL,
	end_mute		TIMESTAMP WITH TIME ZONE DEFAULT NULL,
	PRIMARY KEY(user_id, channel_id)
);

-- DROP TABLE IF EXISTS "message";
CREATE TABLE IF NOT EXISTS "message"(
	id			INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	channel_id	INTEGER REFERENCES channel(id) ON DELETE CASCADE,
	user_id		INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
	content 	TEXT NOT NULL,
	created_at	TIMESTAMP WITH TIME ZONE  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- DROP TABLE IF EXISTS achievement;
CREATE TABLE IF NOT EXISTS achievement(
	id				INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	title			TEXT NOT NULL UNIQUE,
	"description"	TEXT NOT NULL
);

-- DROP TABLE IF EXISTS user_achievement;
CREATE TABLE IF NOT EXISTS user_achievement(
  	user_id			INTEGER REFERENCES "user"(id),
	achievement_id	INTEGER REFERENCES achievement(id),
	PRIMARY KEY(user_id, achievement_id)
);

-- DROP TABLE IF EXISTS game;
CREATE TABLE IF NOT EXISTS game(
	id				INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  	winner_id		INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
  	looser_id		INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
  	winner_score	INTEGER NOT NULL,
  	looser_score	INTEGER NOT NULL,
	created_at		TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE game
ADD CONSTRAINT no_itself_relation
CHECK (winner_id != looser_id);

----------------------------------------------------------------------------
-- Insert dummy data
----------------------------------------------------------------------------

INSERT INTO "user" (username, email, "password", "role", end_ban) VALUES
	('bob', 'bob@bob.com', 'mypass', 'owner', NULL),
	('marie', 'marie@email.com', 'mypass', 'admin', NULL),
	('jacques', 'jacques@email.com', 'mypass', 'user', NULL),
	('stef', 'stef@mail.com', 'mypass', 'user', NULL),
	('alice', 'alice@mail.com', 'mypass', 'user', NULL),
	('pierre', 'pierre@mail.com', 'mypass', 'user', NULL),
	('jean', 'jeab@mail.com', 'mypass', 'user', '2026-12-08 01:45:32.883044+00');

INSERT INTO user_stat (user_id, level, victories, losses) VALUES
	(1, 42, 15,   7),
	(2, 54, 150, 97),
	(3,  9,  15, 90),
	(4,  1,   2,  2),
	(5,  8,   5,  5),
	(6,  12,   12,  5),
	(7,  14,   15,  5);

INSERT INTO achievement (title, "description") VALUES
	('Tyson Fury', 'Win 30 games in a row.'),
	('Pilier de bar', 'Play 15 games each day for one month'),
	('Bienvenu', 'Create an account');

INSERT INTO user_achievement (user_id, achievement_id) VALUES
	(1, 3),
	(2, 3),
	(3, 3),
	(4, 3),
	(5, 3),

	(1, 2),
	(2, 2),
	(3, 2),

	(1, 1),
	(2, 1);

INSERT INTO friendship (applicant_id, recipient_id, "status") VALUES
	(1, 2, 'accepted'),
	(1, 3, 'accepted'),
	(1, 4, 'pending'),

	(2, 3, 'pending'),
	(2, 5, 'accepted'),

	(3, 4, 'accepted'),
	(3, 5, 'pending'),

	(4, 5, 'accepted'),

	(6, 1, 'accepted'),
	(6, 3, 'pending');

INSERT INTO blocked (applicant_id, recipient_id) VALUES
	(1, 5),
	(2, 4),
	(7, 1);

INSERT INTO channel (owner_id, is_dm, title, "password") VALUES
	(1, FALSE, 'L equipe', NULL ),
	(2, FALSE, 'L equipe 2', NULL ),
	(2, TRUE, NULL, NULL);

INSERT INTO user_channel (user_id, channel_id, "role", end_ban, end_mute) VALUES
	(1, 1, 'admin', NULL, NULL), -- owner
	(2, 1, 'admin', NULL, NULL),
	(3, 1, 'user', NULL, '2022-12-08 01:45:32.883044+00'),

	(2, 2, 'admin', NULL, NULL), -- owner
	(4, 2, 'user', NULL, NULL),
	(5, 2, 'user', '3021-12-08 01:45:32.883044+00', NULL),

	(2, 3, 'admin', NULL, NULL),
	(3, 3, 'user', NULL, NULL);

INSERT INTO "message" (channel_id, user_id, content, created_at) VALUES
	(1, 1, 'bob: hello l equipe ! premier message', '2021-12-08 01:45:32.883044+00'),
	(1, 2, 'marie: hola, second message', 			'2021-12-08 01:45:35.883044+00'),
	(1, 3, 'jacques: Hi !, third one', 				'2021-12-08 01:46:01.883044+00'),
	(1, 1, 'bob: 4',								'2021-12-08 01:47:42.883044+00'),
	(1, 2, 'marie: 5',								'2021-12-08 01:49:32.883044+00'),
	(1, 1, 'bob: 6',								'2021-12-08 01:51:29.883044+00'),
	(1, 1, 'bob: 7',								'2021-12-08 01:53:11.883044+00'),
	(1, 1, 'bob: 8',								'2021-12-08 01:54:02.883044+00'),

	(2, 2, 'marie: hello l equipe 2 ! premier message', '2021-12-08 01:45:32.883044+00'),
	(2, 4, 'stef: hola, second message',				'2021-12-08 01:49:32.883044+00'),
	(2, 5, 'alice: Hi !, third one',					'2021-12-08 01:50:32.883044+00'),
	(2, 2, 'bob: 4',									'2021-12-08 01:52:32.883044+00'),
	(2, 4, 'marie: 5',									'2021-12-08 01:55:32.883044+00'),
	(2, 2, 'marie: 6',									'2021-12-08 01:56:32.883044+00'),
	(2, 2, 'marie: 7',									'2021-12-08 01:56:35.883044+00'),
	(2, 2, 'marie: 8',									'2021-12-08 01:57:40.883044+00'),

	(2, 2, 'marie: Hi first dm message 1',	'2021-12-08 01:57:40.883044+00'),
	(2, 3, 'jacques: Hi 2',					'2021-12-08 11:57:40.883044+00'),
	(2, 3, 'jacques: How are u 3',			'2021-12-08 11:58:20.883044+00');

INSERT INTO game (winner_id, looser_id, winner_score, looser_score) VALUES
	(1, 2, 3, 0),
	(2, 1, 3, 2),
	(4, 2, 3, 2),
	(5, 4, 3, 1);
