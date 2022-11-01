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

    const player1 = player1sql[0];
    const player2 = player2sql[0];
    console.log(player1);
    console.log(player2)
    res.render('comparePlayers', { player1: player1, player2: player2 });
});

module.exports = router;
