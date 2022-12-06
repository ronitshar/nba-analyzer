import pymysql, os, json, requests, time

#connection to MySQL
con = pymysql.connect(host = '35.224.9.241',user = 'root',passwd = 'boonkgang',db = 'nbaanalyzer')
cursor = con.cursor()

# checks for strings
def validate_string(val):
   if val != None:
        if type(val) is int:
            #for x in val:
            #   print(x)
            return str(val).encode('utf-8')
        else:
            return val


# parse data

# team insert
teamInsertArr = []
teamFile = requests.get('https://www.balldontlie.io/api/v1/teams')
teamContent = teamFile.json()
for i, item in enumerate(teamContent['data']):
    team_id = item.get('id')
    city = validate_string(item.get('city'))
    conference = validate_string(item.get('conference'))
    team_name = validate_string(item.get('full_name'))

    teamInsert = "INSERT INTO Team (team_id, city, conference, team_name) VALUES (%s, %s, %s, %s)" 
    #print(teamInsert)
    teamInsertArr.append([team_id, city, conference, team_name])

cursor.executemany(teamInsert,teamInsertArr)


#player insert
playerInsertArr = []
playerFile = requests.get('https://www.balldontlie.io/api/v1/players?per_page=100')
playerContent = playerFile.json()
totalPlayerPages = playerContent['meta']['total_pages']

for page in range(1, totalPlayerPages + 1):
#for page in range(1, 2):
    requestPage = 'https://www.balldontlie.io/api/v1/players?per_page=100&page=%s' % page
    playerFile = requests.get(requestPage)
    playerContent = playerFile.json()
    for i, item in enumerate(playerContent['data']):
        
        id = item.get('id')
        first_name = validate_string(item.get('first_name'))
        last_name = validate_string(item.get('last_name'))
        team_id = item.get('team').get('id')

        playerInsert = "INSERT INTO Player (id, first_name, last_name, team_id) VALUES (%s, %s, %s, %s)"
        # print(playerInsert)
        playerInsertArr.append([id, first_name, last_name, team_id])

cursor.executemany(playerInsert, playerInsertArr)

time.sleep(60)

#game insert
gameStatsInsertArr = []
gameStatsFile = requests.get('https://www.balldontlie.io/api/v1/games?seasons[]=2021&postseason=false&per_page=100')
gameStatsContent = gameStatsFile.json()
totalGameStatsPages = gameStatsContent['meta']['total_pages']

for page in range(1, totalGameStatsPages + 1):
#for page in range(1, 2):
    print(page)
    requestPage = 'https://www.balldontlie.io/api/v1/games?seasons[]=2021&postseason=false&per_page=100&page=%s' % page
    gameStatsFile = requests.get(requestPage)
    gameStatsContent = gameStatsFile.json()

    for i, item in enumerate(gameStatsContent['data']):
        game_id = item.get('id')
        game_date = validate_string(item.get('date')[:10])
        home_score = item.get('home_team_score')
        away_score = item.get('visitor_team_score')
        season = item.get('season')
        home_id = item.get('home_team').get('id')
        away_id = item.get('visitor_team').get('id')
        
        gameStatsInsert = "INSERT INTO GameStats (game_id, game_date, home_score, away_score, season, home_id, away_id) VALUES (%s, %s, %s, %s, %s, %s, %s)"
        # print(gameStatsInsert)
        gameStatsInsertArr.append([game_id, game_date, home_score, away_score, season, home_id, away_id])
cursor.executemany(gameStatsInsert, gameStatsInsertArr)

time.sleep(60)

# player stats insert
playerStatsInsertArr = []
playerStatsFile = requests.get('https://www.balldontlie.io/api/v1/stats?seasons[]=2021&postseason=false&per_page=100')
playerStatsContent = playerStatsFile.json()
totalPlayerStatsPages = playerStatsContent['meta']['total_pages']

for page in range(1, totalPlayerStatsPages + 1):
#for page in range(1, 2):
    print(page)
    requestPage = 'https://www.balldontlie.io/api/v1/stats?seasons[]=2021&postseason=false&per_page=100&page=%s' % page
    playerStatsFile = requests.get(requestPage)
    playerStatsContent = playerStatsFile.json()

    for i, item in enumerate(playerStatsContent['data']):

        if item.get('player') is None or item.get('game') is None:
            continue
        player_id = item.get('player').get('id')
        game_id = item.get('game').get('id')
        points = item.get('pts')
        rebounds = item.get('reb')
        assists = item.get('ast')
        blocks = item.get('blk')
        steals = item.get('stl')
        turnovers = item.get('turnover')
        fg_pct = item.get('fg_pct')
        fg3_pct = item.get('fg3_pct')
        ft_pct = item.get('ft_pct')


        playerStatsInsert = "INSERT IGNORE INTO PlayerStats (player_id, game_id, points, rebounds, assists, blocks, steals, turnovers, fg_pct, fg3_pct, ft_pct) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"
        # print(playerStatsInsert)
        playerStatsInsertArr.append([player_id, game_id, points, rebounds, assists, blocks, steals, turnovers, fg_pct, fg3_pct, ft_pct])
    if page % 60 ==0:
        time.sleep(60)
cursor.executemany(playerStatsInsert, playerStatsInsertArr)

con.commit()
con.close()
