CREATE TABLE Team (
    team_id int NOT NULL,
    city VARCHAR(255) NOT NULL,
    conference VARCHAR(255) NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (team_id)
);

CREATE TABLE Player (
    id int NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    team_id int NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE GameStats (
    game_id int NOT NULL,
    game_date VARCHAR(255) NOT NULL,
    home_score int NOT NULL,
    away_score int NOT NULL,
    season int NOT NULL,
    home_id int NOT NULL,
    away_id int NOT NULL,
    PRIMARY KEY (game_id),
    FOREIGN KEY (home_id) REFERENCES Team(team_id),
    FOREIGN KEY (away_id) REFERENCES Team(team_id)
);

CREATE TABLE PlayerStats (
    player_id int NOT NULL,
    game_id int NOT NULL,
    points int NOT NULL,
    rebounds int NOT NULL,
    assists int NOT NULL,
    blocks int NOT NULL,
    steals int NOT NULL,
    turnovers int NOT NULL,
    fg_pct float NOT NULL,
    fg3_pct float NOT NULL,
    ft_pct float NOT NULL,
    PRIMARY KEY (player_id, game_id),
    FOREIGN KEY (player_id) REFERENCES Player(id),
    FOREIGN KEY (game_id) REFERENCES GameStats(game_id)
);

CREATE TABLE TeamComparisons (
    team1_id int NOT NULL,
    team2_id int NOT NULL,
    team1_win_pct float NOT NULL,
    team2_win_pct float NOT NULL,
    season_num int NOT NULL,
    winner VARCHAR(255) NOT NULL,
    PRIMARY KEY (team1_id, team2_id),
    FOREIGN KEY (team1_id) REFERENCES Team(team_id),
    FOREIGN KEY (team2_id) REFERENCES Team(team_id)
);

CREATE TABLE PlayerComparisons (
    player1_id int NOT NULL,
    player2_id int NOT NULL,
    player1_points int NOT NULL,
    player2_points int NOT NULL,
    winner VARCHAR(255) NOT NULL,
    PRIMARY KEY (player1_id, player2_id),
    FOREIGN KEY (player1_id) REFERENCES Player(id),
    FOREIGN KEY (player2_id) REFERENCES Player(id)
);

CREATE TABLE FavoritePlayer (
    id int NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    team_id int NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);
-- Player(id, first_name, last_name)
-- PlayerAttributes(id, position, height_feet, height_inches, weight_pounds, team_id)
-- Team(team_id, abbr, city, conference, division, team_name)
-- GameStats(game_id, date, home_score, away_score, season, home_id,  away_id)
-- PlayerStats(player_id, game_id, points, rebounds,  assists, blocks, steals, turnovers, fg_pct, fg3_pct, ft_pct) 
-- TeamComparisons(team1_id, team2_id)

-- SP to find a team matching the name input
-- DROP PROCEDURE IF EXISTS sp_find_team; -- if stored procedure already exists, overwrite it
-- DELIMITER //
-- CREATE PROCEDURE sp_find_team (IN team_name varchar(100))
--     BEGIN
--         -- INSERT INTO result (select * from temp where platform_name = curr_platform_name and -- get first entry
--         --             genre = curr_genre and game_publisher = curr_game_publisher limit 1);
--         SELECT * FROM Team t WHERE t.team_name = team_name;
--     END //
-- DELIMITER ; 

-- SP to insert into team comparisons table 
DROP PROCEDURE IF EXISTS sp_insert_team_comparison; -- if stored procedure already exists, overwrite it
DELIMITER //
CREATE PROCEDURE sp_insert_team_comparison (IN team1_id int, IN team2_id int, IN team1_win_pct float, IN team2_win_pct float, IN season_num int, IN winner VARCHAR(255))
    BEGIN
        INSERT IGNORE INTO TeamComparisons VALUES(team1_id, team2_id, team1_win_pct, team2_win_pct, season_num, winner);
    END //
DELIMITER ; 

-- SP to insert into player comparisons table 
DROP PROCEDURE IF EXISTS sp_insert_player_comparison; -- if stored procedure already exists, overwrite it
DELIMITER //
CREATE PROCEDURE sp_insert_player_comparison (IN player1_id int, IN player2_id int, IN player1_points int, IN player2_points int, IN winner VARCHAR(255))
    BEGIN
        INSERT IGNORE INTO PlayerComparisons VALUES(player1_id, player2_id, player1_points, player2_points, winner);
    END //
DELIMITER ; 

CREATE TABLE PlayerComparisons (
    player1_id int NOT NULL,
    player2_id int NOT NULL,
    player1_points int NOT NULL,
    player2_points int NOT NULL,
    winner VARCHAR(255) NOT NULL,
    PRIMARY KEY (player1_id, player2_id),
    FOREIGN KEY (player1_id) REFERENCES Player(id),
    FOREIGN KEY (player2_id) REFERENCES Player(id)
);
