var express = require('express');
var router = express.Router();
var fetch = require("node-fetch");
const db = require("../database");

/* GET players page. */
router.get('/', async (req, res, next) => {
    // var options = {
    //   uri: "https://www.balldontlie.io/api/v1/players/237",
    //   method: "GET",
    //   json: true
    // };
    // const apiRes = await fetch("https://www.balldontlie.io/api/v1/players/237");
    // const apiResJson = await apiRes.json();
    const result = await db.promise().query("SELECT * FROM Player");
    const rows = result[0];
    console.log(rows);
    res.render('selectPlayers', { players: rows });
});

router.get("/viewcomparisons", async (req, res, next) => {
    // var options = {
    //   uri: "https://www.balldontlie.io/api/v1/players/237",
    //   method: "GET",
    //   json: true
    // };
    // const apiRes = await fetch("https://www.balldontlie.io/api/v1/players/237");
    // const apiResJson = await apiRes.json();
    const result = await db.promise().query(`SELECT pc.player1_points p1points, pc.winner,
    pc.player2_points p2points, p1.first_name p1first_name, p1.last_name p1last_name, p2.first_name p2first_name, p2.last_name p2last_name 
    FROM PlayerComparisons pc 
    JOIN Player p1 ON pc.player1_id = p1.id 
    JOIN Player p2 ON pc.player2_id = p2.id`);
    const rows = result[0];
    console.log(rows);
    res.render("viewcomparisons", { comparisons: rows });
  });
  

/* GET compare players page. */
router.post('/compare', async (req, res, next) => {
    const player1_name = req.body.player1;
    const player1_firstName = player1_name.split(' ')[0];
    const player1_lastName = player1_name.split(' ')[1];
    const player2_name = req.body.player2;
    const player2_firstName = player2_name.split(' ')[0];
    const player2_lastName = player2_name.split(' ')[1];

    // get players from DB
    const player1sql = await db.promise().query("SELECT * FROM Player p WHERE p.first_name = '" + player1_firstName + "' and p.last_name = '" + player1_lastName + "'");
    const player2sql = await db.promise().query("SELECT * FROM Player p WHERE p.first_name = '" + player2_firstName + "' and p.last_name = '" + player2_lastName + "'");

    const player1id = player1sql[0][0].id;
    const player2id = player2sql[0][0].id;

    const player1pts = await db.promise().query("SELECT AVG(points) avgpts FROM PlayerStats ps WHERE ps.player_id = " + player1id);
    const player2pts = await db.promise().query("SELECT AVG(points) avgpts FROM PlayerStats ps WHERE ps.player_id = " + player2id);

    console.log(player1sql[0][0].first_name + " " + player1sql[0][0].last_name);
    console.log(player2sql[0][0].first_name + " " + player2sql[0][0].last_name);

    const player1avgpts = player1pts[0][0].avgpts;
    const player2avgpts = player2pts[0][0].avgpts;

    const winner = player1avgpts > player2avgpts ? player1sql[0][0].first_name + " " + player1sql[0][0].last_name : player2sql[0][0].first_name + " " + player2sql[0][0].last_name;
    /*TODO: check if comparison already added */
    const totalres = await db.promise().query(`INSERT INTO PlayerComparisons VALUES(${player1id}, ${player2id}, ${player1avgpts}, ${player2avgpts}, "${winner}")`);


    res.redirect('/viewcomparisons');
});

/*View favorites page */
router.get('/viewTeamComparisons', async (req, res, next) => {
    const result = await db.promise().query(`
            SELECT t1.team_name team1name, t2.team_name team2name, tc.team1_win_pct team1pct, tc.team2_win_pct team2pct, tc.winner winner FROM TeamComparisons tc 
            JOIN Team t1 ON t1.team_id = tc.team1_id 
            JOIN Team t2 ON t2.team_id = tc.team2_id
    `);
    const rows = result[0];
    console.log(rows);
    res.render('viewTeams', { teams: rows });
});
  
/*View favorites page */
router.get('/viewFavorites', async (req, res, next) => {
    const result = await db.promise().query("SELECT * FROM Player");
    const rows = result[0];
    console.log(rows);
    res.render('selectFavorites', { players: rows });
});

/*Select favorite player */
router.post('/favorites', async (req, res, next) => {
    const player1_name = req.body.player1;
    const player1_firstName = player1_name.split(' ')[0];
    const player1_lastName = player1_name.split(' ')[1];

    const player1sql = await db.promise().query("SELECT * FROM Player p WHERE p.first_name = '" + player1_firstName + "' and p.last_name = '" + player1_lastName + "'");
    const player1id = player1sql[0][0].id;
    const player1team = player1sql[0][0].team_id;
    //console.log()


    const totalres = await db.promise().query(`INSERT INTO FavoritePlayer VALUES(${player1id}, "${player1_firstName}", "${player1_lastName}", "${player1team}")`);

    res.redirect('/viewFavorites');
});

/*Get all favorites player */
router.get('/viewFavoritesToDelete', async (req, res, next) => {
    const result = await db.promise().query("SELECT * FROM FavoritePlayer");
    const rows = result[0];
    console.log(rows);
    res.render('deleteFavorites', { players: rows });
});

router.post('/deleteFavorites', async (req, res, next) => {
    const player1_name = req.body.player1;
    const player1_firstName = player1_name.split(' ')[0];
    const player1_lastName = player1_name.split(' ')[1];

    const player1sql = await db.promise().query("DELETE FROM FavoritePlayer p WHERE p.first_name = '" + player1_firstName + "' and p.last_name = '" + player1_lastName + "'");

    res.redirect('/viewFavoritesToDelete');
});



module.exports = router;
