var express = require('express');
var router = express.Router();
var fetch = require("node-fetch");
const db = require("../database");

/* GET teams. */
router.get('/', async (req, res, next) => {
  // var options = {
  //   uri: "https://www.balldontlie.io/api/v1/players/237",
  //   method: "GET",
  //   json: true
  // };
  // const apiRes = await fetch("https://www.balldontlie.io/api/v1/players/237");
  // const apiResJson = await apiRes.json();
  const result = await db.promise().query("SELECT * FROM teams");
  const rows = result[0];
  console.log(rows);
  res.render('selectTeams', { teams: rows });
});

module.exports = router;
