'use strict';

var express = require('express');
var router = express.Router();

const request = require("request");
const _       = require("lodash");

/* GET home page. */
router.get('/', (req, res, next) => {

  var requestArray = [
    "http://logs.tf/json/1467290",
    "http://logs.tf/json/1467270",
    "http://logs.tf/json/1470116",
    "http://logs.tf/json/1470090",
    "http://logs.tf/json/1472397",
    "http://logs.tf/json/1474249",
    "http://logs.tf/json/1474288",
    "http://logs.tf/json/1475194",
    "http://logs.tf/json/1477260",
    "http://logs.tf/json/1477309",
    "http://logs.tf/json/1479187",
    "http://logs.tf/json/1479222",
    "http://logs.tf/json/1481895",
    "http://logs.tf/json/1481929",
    "http://logs.tf/json/1483724",
    "http://logs.tf/json/1483759",
    "http://logs.tf/json/1484569",
    "http://logs.tf/json/1507118",
    "http://logs.tf/json/1507152",
    "http://logs.tf/json/1508969",
    "http://logs.tf/json/1508994",
    "http://logs.tf/json/1514335",
    "http://logs.tf/json/1514379",
    "http://logs.tf/json/1516345",
    "http://logs.tf/json/1516372",
    "http://logs.tf/json/1517294",
    "http://logs.tf/json/1517330",
    "http://logs.tf/json/1517362",
    "http://logs.tf/json/1519074",
    "http://logs.tf/json/1519102",
    "http://logs.tf/json/1520298",
    "http://logs.tf/json/1521573",
    "http://logs.tf/json/1521619",
    "http://logs.tf/json/1523536",
    "http://logs.tf/json/1523567",
    "http://logs.tf/json/1526363",
    "http://logs.tf/json/1526422",
    "http://logs.tf/json/1527040",
    "http://logs.tf/json/1527069",
    "http://logs.tf/json/1532687",
    "http://logs.tf/json/1537423",
    "http://logs.tf/json/1537459"
  ];

  // extract the JSON strings from all the logs.tf links
  var responseArray = _.map(requestArray, eachRequest => {

    var eachResponse = new Promise((resolve, reject) => {

      request(eachRequest, (error, response, body) => { error ? reject(error) : resolve(body) });

    });

    return eachResponse;

  });

  // when all log JSON strings have been extracted
  Promise
    .all(responseArray)
    .then(logsArray => {
      // convert all the JSON strings to javascript objects
      logsArray = _.map(logsArray, log => JSON.parse(log));

      var players = {};

      // for each log
      logsArray.forEach(log => {

        if (Object.keys(players).length === 0) {
          _.assign(players, log.players);

          //Object.keys(players).forEach(player => players[player].matches_played = 1);
          for(var player in players) {
            players[player].matches_played = 1;
            players[player].time_played = log.length;

            for (var name in log.names) {
              if (player === name) players[player].name = log.names[name];
            }
          }
        }
        else {
          for (var newPlayer in log.players) {

            var playerAlreadyThere = false;

            for (var addedPlayer in players) {
              if (newPlayer === addedPlayer) playerAlreadyThere = true;
            }

            if (!playerAlreadyThere) {
              //players[newplayer] = log.players[newPlayer];
              //_.assign(players[newPlayer], log.players[newPlayer]);
              players[newPlayer] = log.players[newPlayer];
              players[newPlayer].matches_played = 1;
              players[newPlayer].time_played = log.length;

              for(var name in log.names) {
                if (newPlayer === name) players[newPlayer].name = log.names[name];
              }

            }
            else {
              let player = players[newPlayer];
              let logPlayer = log.players[newPlayer];

              player.kills         += logPlayer.kills;
              player.deaths        += logPlayer.deaths;
              player.assists       += logPlayer.assists;
              player.suicides      += logPlayer.suicides;
              player.dmg           += logPlayer.dmg;
              player.dmg_real      += logPlayer.dmg_real;
              player.dt            += logPlayer.dt;
              player.dt_real       += logPlayer.dt_real;
              player.hr            += logPlayer.hr;
              player.lks           += logPlayer.lks;
              player.as            += logPlayer.as;
              player.dapd          += logPlayer.dapd;
              player.dapm          += logPlayer.dapm;
              player.ubers         += logPlayer.ubers;
              player.drops         += logPlayer.drops;
              player.medkits       += logPlayer.medkits;
              player.medkits_hp    += logPlayer.medkits_hp;
              player.backstabs     += logPlayer.backstabs;
              player.headshots     += logPlayer.headshots;
              player.headshots_hit += logPlayer.headshots_hit;
              player.sentries      += logPlayer.sentries;
              player.heal          += logPlayer.heal;
              player.cpc           += logPlayer.cpc;
              player.ic            += logPlayer.ic;
              player.time_played   += log.length;
              
              player.kpd  = (player.deaths === 0) ? 0 : (player.kills / player.deaths);
              player.kpad = (player.deaths === 0) ? 0 : ((player.kills + player.assists) / player.deaths);

              player.matches_played++;
            }
          }
        }
      });

      res.render('index', {players: JSON.stringify(players)});
  }, error => console.error(error));

});

module.exports = router;
