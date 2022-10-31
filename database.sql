CREATE TABLE Player (
    id int NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id),
);

CREATE TABLE PlayerAttributes (
    player_id int NOT NULL,
    position VARCHAR(255) NOT NULL,
    height_feet in NOT NULL,
    height_inches int NOT NULL,
    weight_pounds float NOT NULL,
    team_id int NOT NULL,

    PRIMARY KEY (player_id),
    FOREIGN KEY (player_id) REFERENCES Player(id)
);

CREATE TABLE Team (
    team_id int NOT NULL,
    abbr VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    conference VARCHAR(255) NOT NULL,
    divison VARCHAR(255)  NOT NULL,
    team_name VARCHAR(255) NOT NULL,

    PRIMARY KEY (team_id),
);

CREATE TABLE GameStats (
    game_id int NOT NULL,
    game_date VARCHAR(255) NOT NULL,
    home_score int NOT NULL,
    away_score int NOT NULL,
    season int NOT NULL,
    home_id int NOT NULL,
    away_id int NOT NULL

    PRIMARY KEY (game_id),
    FOREIGN KEY (home_id) REFERENCES Team(team_id),
    FOREIGN KEY (away_id) REFERENCES Team(team_id),
);
-- Player(id, first_name, last_name)
-- PlayerAttributes(id, position, height_feet, height_inches, weight_pounds, team_id)
-- Team(team_id, abbr, city, conference, division, team_name)
-- GameStats(game_id, date, home_score, away_score, season, home_id,  away_id)
-- PlayerStats(player_id, game_id, points, rebounds,  assists, blocks, steals, turnovers, fg_pct, fg3_pct, ft_pct) 
-- TeamComparisons(team1_id, team2_id)