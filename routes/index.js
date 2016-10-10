'use strict';

var express = require('express');
var router = express.Router();

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
  var responseArray = _.map(requestArray, eachRequest => {

    var eachResponse = new Promise((resolve, reject) => {

      // check if the link has "http://" in it's beginning, if it doesn't,
      // add it, because otherwise the url parser can't parse it properly
      !/^http:\/\//gi.test(eachRequest) ? eachRequest = 'http://' + eachRequest : '';
      
      var requestUrl = url.parse(eachRequest);
      var host = requestUrl.host,
          path = requestUrl.path;

      // url validation
      if (requestUrl.host     === 'logs.tf' || 'www.logs.tf' &&
          requestUrl.protocol ===  null     || 'http:'       &&
          requestUrl.path.match(/^\d{5,}$/g)) {

        // makes the actual HTTP request
        request('http://' + host + '/json' + path, (error, response, body) => {

          // checks for errors and invalid data, just in case
          if (error) {
            reject(error);
          }
          else if ( !tryParseJSON(body) ) {
            reject(requestUrl.href + ' doesn\'t seem to be a valid log. \n');
          }
          else {
            /// perhaps parse the JSON data and scrape the map and date here
            /// and send the complete javascript object to Promise.all()?
            resolve(body);
          }
        });
      }
      else reject(requestUrl.host + ' didn\'t validate');
    });

    return eachResponse;
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
