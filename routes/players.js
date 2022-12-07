var express = require("express");
const { registerHelper } = require("hbs");
var router = express.Router();
var fetch = require("node-fetch");
const db = require("../database");

/* GET players page. */
router.get("/", async (req, res, next) => {
  // var options = {
  //   uri: "https://www.balldontlie.io/api/v1/players/237",
  //   method: "GET",
  //   json: true
  // };
  // const apiRes = await fetch("https://www.balldontlie.io/api/v1/players/237");
  // const apiResJson = await apiRes.json();
  // const result = await db.promise().query("SELECT * FROM Player");
  const result = await db
    .promise()
    .query(
      "SELECT * FROM Player p WHERE EXISTS(SELECT * FROM PlayerStats ps WHERE p.id = ps.player_id)"
    );
  const rows = result[0];
  console.log(rows);

  const teamResult = await db.promise().query("SELECT * FROM Team");
  const rowsTeam = teamResult[0];
  console.log(rowsTeam);
  res.render("selectPlayers", { players: rows, teams: rowsTeam });
});

router.get("/viewcomparisons", async (req, res, next) => {
  // var options = {
  //   uri: "https://www.balldontlie.io/api/v1/players/237",
  //   method: "GET",
  //   json: true
  // };
  // const apiRes = await fetch("https://www.balldontlie.io/api/v1/players/237");
  // const apiResJson = await apiRes.json();
  const result = await db.promise()
    .query(`SELECT pc.player1_points p1points, pc.winner,
    pc.player2_points p2points, p1.first_name p1first_name, p1.last_name p1last_name, p2.first_name p2first_name, p2.last_name p2last_name 
    FROM PlayerComparisons pc 
    JOIN Player p1 ON pc.player1_id = p1.id 
    JOIN Player p2 ON pc.player2_id = p2.id`);
  const rows = result[0];
  console.log(rows);

  const favresult = await db.promise().query("SELECT * FROM FavoritePlayer");
  const favrows = favresult[0];
  console.log(favrows);

  res.render("viewcomparisons", { comparisons: rows, players: favrows });
});

router.post("/favPlayerComparisons", async (req, res, next) => {
  console.log(req.body.favPlayer);
  let favPlayer = req.body.favPlayer;
  const player_firstName = favPlayer.split(" ")[0];
  const player_lastName = favPlayer.split(" ")[1];
  const favplayersql = await db
    .promise()
    .query(
      "SELECT * FROM Player p WHERE p.first_name = '" +
        player_firstName +
        "' and p.last_name = '" +
        player_lastName +
        "'"
    );

  const favplayerid = favplayersql[0][0].id;

  const favPlayerComparisons = await db
    .promise()
    .query(
      "SELECT p1.first_name p1first_name, p1.last_name p1last_name, p2.first_name p2first_name, p2.last_name p2last_name, ps.player1_points p1points, ps.player2_points p2points, ps.winner  FROM PlayerComparisons ps JOIN Player p1 ON p1.id = ps.player1_id JOIN Player p2 ON p2.id = ps.player2_id WHERE ps.player1_id = " +
        favplayerid +
        " OR ps.player2_id = " +
        favplayerid
    );
  const rows = favPlayerComparisons[0];

  res.render("favPlayerComparisons", { comparisons: rows });
});

function propertiesToArray(obj) {
  const isObject = (val) =>
    val && typeof val === "object" && !Array.isArray(val);

  const addDelimiter = (a, b) => (a ? `${a}.${b}` : b);

  const paths = (obj = {}, head = "") => {
    return Object.entries(obj).reduce((product, [key, value]) => {
      let fullPath = addDelimiter(head, key);
      return isObject(value)
        ? product.concat(paths(value, fullPath))
        : product.concat(fullPath);
    }, []);
  };

  return paths(obj);
}

router.post("/compareTeams", async (req, res, next) => {
  const team1_name = req.body.team1;
  const team2_name = req.body.team2;

  // get players from DB
  const team1sql = await db
    .promise()
    .query(`SELECT * FROM Team t WHERE t.team_name = '${team1_name}';`);
  const team2sql = await db
    .promise()
    .query(`SELECT * FROM Team t WHERE t.team_name = '${team2_name}';`);

  console.log("path is" + propertiesToArray(team1sql));
  const team1id = team1sql[0][0].team_id;
  const team2id = team2sql[0][0].team_id;

  const team1Wins = await db
    .promise()
    .query(
      "SELECT COUNT(*) wins FROM GameStats gs WHERE gs.home_id = " +
        team1id +
        " AND gs.home_score > gs.away_score OR gs.away_id = " +
        team1id +
        " AND gs.away_score > gs.home_score"
    );
  const team2Wins = await db
    .promise()
    .query(
      "SELECT COUNT(*) wins FROM GameStats gs WHERE gs.home_id = " +
        team2id +
        " AND gs.home_score > gs.away_score OR gs.away_id = " +
        team2id +
        " AND gs.away_score > gs.home_score"
    );

  console.log(team1sql[0][0].team_name);
  console.log(team2sql[0][0].team_name);

  const team1TotalWins = team1Wins[0][0].wins;
  const team2TotalWins = team2Wins[0][0].wins;

  const winner =
    team1TotalWins > team2TotalWins
      ? team1sql[0][0].team_name
      : team2sql[0][0].team_name;

  /* sp for inserting team comparison */
  const sp_insert_team_comparison = `call sp_insert_team_comparison(${team1id}, ${team2id}, 
        ${((team1TotalWins * 100) / 82.0).toFixed(2)}, ${(
    (team2TotalWins * 100) /
    82.0
  ).toFixed(2)}, ${2021}, "${winner}")`;

  const totalres = await db
    .promise()
    .query(
      sp_insert_team_comparison
    ); /* ignore will avoid error for duplicate keys */

  res.redirect("/viewTeamComparisons");
});

/* GET compare players page. */
router.post("/compare", async (req, res, next) => {
  const player1_name = req.body.player1;
  const player1_firstName = player1_name.split(" ")[0];
  const player1_lastName = player1_name.split(" ")[1];
  const player2_name = req.body.player2;
  const player2_firstName = player2_name.split(" ")[0];
  const player2_lastName = player2_name.split(" ")[1];

  // get players from DB
  const player1sql = await db
    .promise()
    .query(
      "SELECT * FROM Player p WHERE p.first_name = '" +
        player1_firstName +
        "' and p.last_name = '" +
        player1_lastName +
        "'"
    );
  const player2sql = await db
    .promise()
    .query(
      "SELECT * FROM Player p WHERE p.first_name = '" +
        player2_firstName +
        "' and p.last_name = '" +
        player2_lastName +
        "'"
    );

  const player1id = player1sql[0][0].id;
  const player2id = player2sql[0][0].id;

  const player1pts = await db
    .promise()
    .query(
      "SELECT AVG(points) avgpts FROM PlayerStats ps WHERE ps.player_id = " +
        player1id
    );
  const player2pts = await db
    .promise()
    .query(
      "SELECT AVG(points) avgpts FROM PlayerStats ps WHERE ps.player_id = " +
        player2id
    );

  console.log(player1sql[0][0].first_name + " " + player1sql[0][0].last_name);
  console.log(player2sql[0][0].first_name + " " + player2sql[0][0].last_name);

  const player1avgpts = player1pts[0][0].avgpts;
  const player2avgpts = player2pts[0][0].avgpts;

  const winner =
    player1avgpts > player2avgpts
      ? player1sql[0][0].first_name + " " + player1sql[0][0].last_name
      : player2sql[0][0].first_name + " " + player2sql[0][0].last_name;

  const sp_insert_player_comparison = `call sp_insert_player_comparison(${player1id}, ${player2id}, ${player1avgpts}, ${player2avgpts}, "${winner}");`;
  const totalres = await db
    .promise()
    .query(
      sp_insert_player_comparison
    ); /* ignore will avoid error for duplicate keys */

  res.redirect("/viewcomparisons");
});

/*View favorites page */
router.get("/viewTeamComparisons", async (req, res, next) => {
  const result = await db.promise().query(`
            SELECT t1.team_name team1name, t2.team_name team2name, tc.team1_win_pct team1pct, tc.team2_win_pct team2pct, tc.winner winner FROM TeamComparisons tc 
            JOIN Team t1 ON t1.team_id = tc.team1_id 
            JOIN Team t2 ON t2.team_id = tc.team2_id
    `);
  const rows = result[0];
  console.log(rows);
  res.render("viewTeams", { teams: rows });
});

/*View favorites page */
router.get("/viewFavorites", async (req, res, next) => {
  const result = await db.promise().query("SELECT * FROM Player");
  const rows = result[0];
  console.log(rows);
  res.render("selectFavorites", { players: rows });
});

/*Select favorite player */
router.post("/favorites", async (req, res, next) => {
  const player1_name = req.body.player1;
  const player1_firstName = player1_name.split(" ")[0];
  const player1_lastName = player1_name.split(" ")[1];

  const player1sql = await db
    .promise()
    .query(
      "SELECT * FROM Player p WHERE p.first_name = '" +
        player1_firstName +
        "' and p.last_name = '" +
        player1_lastName +
        "'"
    );
  const player1id = player1sql[0][0].id;
  const player1team = player1sql[0][0].team_id;
  //console.log()

  const totalres = await db
    .promise()
    .query(
      `INSERT INTO FavoritePlayer VALUES(${player1id}, "${player1_firstName}", "${player1_lastName}", "${player1team}")`
    );

  res.redirect("/viewFavorites");
});

/*Get all favorites player */
router.get("/viewFavoritesToDelete", async (req, res, next) => {
  const result = await db.promise().query("SELECT * FROM FavoritePlayer");
  const rows = result[0];
  console.log(rows);
  res.render("deleteFavorites", { players: rows });
});

router.post("/deleteFavorites", async (req, res, next) => {
  const player1_name = req.body.player1;
  const player1_firstName = player1_name.split(" ")[0];
  const player1_lastName = player1_name.split(" ")[1];

  const player1sql = await db
    .promise()
    .query(
      "DELETE FROM FavoritePlayer p WHERE p.first_name = '" +
        player1_firstName +
        "' and p.last_name = '" +
        player1_lastName +
        "'"
    );

  res.redirect("/viewFavoritesToDelete");
});

module.exports = router;
