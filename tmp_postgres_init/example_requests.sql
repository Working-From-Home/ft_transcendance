-- get users
SELECT * FROM "user";

-- get marie
SELECT * FROM "user" WHERE username = 'marie';


-- get users stats
  -- the old way using where do join tables
	SELECT *
		FROM "user", user_stat
		WHERE "user".id = user_stat.user_id
	;
  -- using join directive
	SELECT *
		FROM "user"	INNER JOIN user_stat ON ("user".id = user_stat.user_id)
	;


-- GET stats for marie 
SELECT *
	FROM "user" INNER JOIN user_stat ON ("user".id = user_stat.user_id)
	WHERE username = 'marie'
;

-- GET only stats for marie 
SELECT user_stat.*
	FROM "user" INNER JOIN user_stat ON ("user".id = user_stat.user_id)
	WHERE username = 'marie'
;

-- GET all achievements owned by bob (many to many jointure)
SELECT *
	FROM "user"
		INNER JOIN user_achievement AS ua ON ("user".id = ua.user_id)
		INNER JOIN achievement ON (ua.achievement_id = achievement.id)
	WHERE "user".username = 'bob'
;

-- filter colums from previous query, to only get achievement.*
SELECT achievement.*
	FROM "user"
		INNER JOIN user_achievement AS ua ON ("user".id = ua.user_id)
		INNER JOIN achievement ON (ua.achievement_id = achievement.id)
	WHERE "user".username = 'bob'
;

-- get all bob's friend (marie, jacques, pierre) (and bob is id 1)
SELECT u.id, u.username, u.email
	FROM "user" AS u
  LEFT JOIN relationship AS r
  ON u.id = r.requester_id
  WHERE r.recipient_id = 1 AND r."type" = 'friend'
UNION
SELECT u.id, u.username, u.email
	FROM "user" AS u
  LEFT JOIN relationship AS r
  ON u.id = r.recipient_id
  WHERE r.requester_id = 1 AND r."type" = 'friend'
;

-- get jacques's pendings (marie and pierre) (jacques is id 3)
SELECT u.id, u.username, u.email
	FROM "user" AS u
  LEFT JOIN relationship AS r
  ON u.id = r.requester_id
  WHERE r.recipient_id = 3 AND r."type" = 'pending'
;

-- get bob's blocked (only alice) (bob is id 1)
SELECT u.id, u.username, u.email
	FROM "user" AS u
  LEFT JOIN relationship AS r
  ON u.id = r.recipient_id
  WHERE r.requester_id = 1 AND r."type" = 'blocked'
;

-- get all messages of a channel orded by desc creation date

-- get all messages of a channel orded by asc creation date

-- get all messages of a channel of a specific user


-- get muted user