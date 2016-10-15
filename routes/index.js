'use strict';

const express = require('express');
const router  = express.Router();
const request = require('request');
const _       = require('lodash');
const cheerio = require('cheerio');
const url     = require('url');

const requestArray = require('../logs');

function tryParseJSON(jsonString) {
  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

  try {
    var o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === "object") {
      return o;
    }
  } catch (e) {
    console.log('ERROR: ' + e);
    return false;
  }

  return jsonString;
}

/* GET home page. */
router.get('/', (req, res, next) => {

  // extract the JSON strings from all the logs.tf links
  var responseArray = _.map(requestArray, (eachRequest) => {
    return new Promise((resolve, reject) => {

      // check if the link has "http://" in it's beginning, if it doesn't,
      // add it, because otherwise the url parser can't parse it properly
      if ( !eachRequest.startsWith('http://') ) eachRequest = 'http://' + eachRequest;

      let requestUrl = url.parse(eachRequest);
      let urlHost = requestUrl.host,
          urlPath = requestUrl.path;

      // url validation
      if (( urlHost === 'logs.tf' || urlHost === 'www.logs.tf' ) &&
            urlPath.match(/^\/\d{5,}$/g) ) {

        // makes the actual HTTP request
        request('http://logs.tf/json' + urlPath, (error, response, body) => {

          // checks for errors and invalid data
          if (error) {
            reject(error);
          }
          else if ( !tryParseJSON(body) ) {
            reject('http://logs.tf/json${urlPath} doesn\'t seem to be a JSON.');
          }
          else {
            /// perhaps parse the JSON data and scrape the map and date here
            /// and send the complete javascript object to Promise.all()?
            resolve(body);
          }
        });
      }
      else reject('http://logs.tf/json${urlPath} didn\'t validate.');
    });
  });

  // when all log JSON strings have been extracted
  Promise
    .all(responseArray)
    .then(logsArray => {

      // convert all the JSON strings to javascript objects
      logsArray = _.map(logsArray, log => tryParseJSON(log));
      /// make the http request to scrape the date and map of the log around here
      /// perhaps inside the lodash map function.
      /// problem with that is that the id in log.tf/<id> is lost


      var players = {};

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
