CREATE TABLE Player (
    id int NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    team_id int NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (team_id) REFERENCES Team(team_id)
);

CREATE TABLE Team (
    team_id int NOT NULL,
    city VARCHAR(255) NOT NULL,
    conference VARCHAR(255) NOT NULL,
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


    PRIMARY KEY (player_id),
    FOREIGN KEY (player_id) REFERENCES Player(id),
    FOREIGN KEY (game_id) REFERENCES GameStats(game_id),
);

CREATE TABLE TeamComparisons (
    team1_id int NOT NULL,
    team2_id int NOT NULL,
    team1_win_pct float NOT NULL,
    team2_win_pct float NOT NULL,
    season_num int NOT NULL,


    PRIMARY KEY (team1_id, team2_id),
    FOREIGN KEY (team1_id) REFERENCES Team(team_id),
    FOREIGN KEY (team2_id) REFERENCES Team(team_id),
);

CREATE TABLE PlayerComparisons (
    player1_id int NOT NULL,
    player2_id int NOT NULL,
    player1_points int NOT NULL,
    player2_points int NOT NULL,
    season_num int NOT NULL,



    PRIMARY KEY (player1_id, player2_id),
    FOREIGN KEY (player1_id) REFERENCES Player(id),
    FOREIGN KEY (player2_id) REFERENCES Player(id),
);
-- Player(id, first_name, last_name)
-- PlayerAttributes(id, position, height_feet, height_inches, weight_pounds, team_id)
-- Team(team_id, abbr, city, conference, division, team_name)
-- GameStats(game_id, date, home_score, away_score, season, home_id,  away_id)
-- PlayerStats(player_id, game_id, points, rebounds,  assists, blocks, steals, turnovers, fg_pct, fg3_pct, ft_pct) 
-- TeamComparisons(team1_id, team2_id)