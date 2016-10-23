'use strict';

const _ = require('lodash');

module.exports = class Logs {
  constructor(data) {
    // sort the data by time
    this.data = data.sort((a, b) => {
      if (a.meta.time > b.meta.time) return 1;
      else if (a.meta.time < b.meta.time) return -1;
      else return 0;
    });
  }

  getMapsPlayed() {
    let maps = {};

    this.data.forEach(log => {
      if (maps[log.meta.map] === undefined) maps[log.meta.map] = 1;
      else maps[log.meta.map]++;
    });

    return maps;
  }

  getPlayersObj() {
    let players = {};

    _.each(this.data, log => {
      _.each(log.log.players, (stats, playerId) => {

        if (players[playerId] === undefined) {
          players[playerId] = {};
          players[playerId].names = [];
          players[playerId].mapsPlayed = 1;
        }
        else {
          players[playerId].mapsPlayed++;
        }
        _.each(log.log.names, (name, steamId) => {
          if (playerId === steamId) players[playerId].names.push(name);
        })

      })
    });

    // remove duplicate names for each player
    _.each(players, player => {
      player.names = _.uniq(player.names);
    });

    return players;
  }

  getPlayersArr() {
    let players = {};

    _.each(this.data, log => {
      _.each(log.log.players, (stats, playerId) => {

        if (players[playerId] === undefined) {
          players[playerId] = {};
          players[playerId].names = [];
          players[playerId].mapsPlayed = 1;
        }
        else {
          players[playerId].mapsPlayed++;
        }
        _.each(log.log.names, (name, steamId) => {
          if (playerId === steamId) players[playerId].names.push(name);
        })

      })
    });

    // turn the object into an array
    players = _
    .map(players, (stats, playerId) => {

      // counts in how many games a player has used a certain names
      // by counting duplicate names, and then creates a new array
      // containing objects: [{name: <name1>, amount: <amount1>}, ...etc]
      stats.names.sort();
      let names = [];
      let amount = 0;
      let prev = stats.names[0];

      _.each(stats.names, name => {

        if (name === prev) amount++;
        else {
          let obj = {};
          obj.name = prev;
          obj.amount = amount;
          amount = 1;
          names.push(obj);
        }
        prev = name;
      });
      let obj = {};
      obj.name = prev;
      obj.amount = amount;
      names.push(obj);
      names.sort((a, b) => { 
        if (a.amount > b.amount) return -1;
        else if (a.amount < b.amount) return 1;
        else return 0;
      });
      stats.names = names;

      // copy players steamId into the object
      stats.steamId = playerId;

      return stats;
    })
    .sort((a, b) => {
      // sort array by moving players that have played
      // more maps to the front of array
      if (a.mapsPlayed < b.mapsPlayed) return 1;
      else if (a.mapsPlayed > b.mapsPlayed) return -1;
      else return 0;
    });

    return players;
  }

  collectPlayerData (steamIds) {
    // if nothing is passed in it generates
    // the data for every player found in the logs
    if ( !steamIds ) {
      steamIds = _.map(this.getPlayersArr(), player => player.steamId);
    }

    const self = this;

    function collect(steamId) {
      let playerData = [];

      _.each(self.data, obj => {
        _.each(obj.log.players, (val, key) => {
          if (key === steamId) {
            let newObj = {};
            
            //// refactor to use _.extend instead of copying references
            newObj.meta = obj.meta;
            newObj.stats = val;
            newObj.classkills = obj.log.classkills[key];
            newObj.classkillassists = obj.log.classkillassists[key];
            newObj.classdeaths = obj.log.classdeaths[key];

            _.each(obj.log.healspread, (val, key) => {
              if (key === steamId) newObj.healspread = val;
            });
            
            playerData.push(newObj);
          }
        });
      });
      return playerData;
    }

    if ( _.isString(steamIds) ) {
      let steamId = steamIds;
      return { steamId: steamId, data: collect(steamId) };
    }
    else if ( _.isArray(steamIds) ) {
      let playerData = [];

      _.each(steamIds, steamId => {
        playerData.push({ steamId: steamId, data: collect(steamId) });
      });

      return playerData;
    }
    else throw 'Incorrect value passed into Logs.prototype.generatePlayerData(steamIds)';
  }
  /*
  generatePlayerData (steamIds) {
    // if nothing is passed in it generates
    // the data for every player found in the logs
    if ( !steamIds ) {
      steamIds = _.map(this.getPlayersArr(), player => player.steamId);
    }
    
    if ( _.isString(steamIds) ) {
      let player = {};
      let steamId = steamIds;

      player.steamId = steamId;
      player.kills = [];
      player.deaths = [];
      player.assists = [];
      player.suicides = [];
      player.dmg = [];
      player.dmg_real = [];
      player.dt = [];
      player.dt_real = [];
      player.hr = [];
      player.lks = [];
      player.as = [];
      player.dapd = [];
      player.dapm = [];
      player.ubers = [];
      player.drops = [];
      player.medkits = [];
      player.medkits_hp = [];
      player.backstabs = [];
      player.headshots = [];
      player.headshots_hit = [];
      player.sentries = [];
      player.heal = [];
      player.cpc = [];
      player.ic = [];
      
      player.ubertypes = {};

      this.data.forEach(data => {
        if (data.log.players[steamId]) {
          
          _.each(data.log.players[steamId], (val, key) => {
            // assign object properties whose values are numbers
            if ( _.isNumber(val) ) {
              if ( !player[key] ) player[key] = [];
              player[key].push( val );
            }
            else if (key === 'ubertypes') {
              let ubertypes = val;
              if ( !player.uberypes ) player.uberypes = {};

              _.each(ubertypes, (val, ubertype) => {
                // assign object properties whose values are numbers
                if ( _.isNumber(val) ) {
                  if ( !player.ubertypes[key] ) player.ubertypes[key] = [];
                  player.ubertypes[key].push( val );
                }
              })
            }
            ///// asign class stats
            else if (key === 'class_stats') {
              let classStats = key;
              if ( !player.class_stats ) player.class_stats = [];

              _.each(classStats, (obj) => {

                // if there isn't an object in player.class_stats array 
                // whose type is the same as currently selected object's
                // type in classStats array, e.g. is there an object of type
                // "demoman" or "scout", etc. in player.class_stats array
                if ( !player.class_stats.find((elem, index, arr) => { elem.type === obj.type }) ) {
                  let newObj = {};
                  newObj.type = obj.type;

                  _.each(obj, (val, key) => {
                    if ( _.isNumber(val) ) newObj[key] = val;
                    else if ( val === 'weapon') {

                    }
                  });

                  player.class_stats.push(newObj);
                }
                else {

                }
              });
            }
            // assign medic stats
            else if (key === 'medicstats') {
              let medicstats = val;
              if ( !player.medicstats ) player.medicstats = {};

              _.each(medicstats, (val, key) => {
                if ( _.isNumber(val) ) {
                  if (!player.medicstats[key]) player.medicstats[key] = [];
                  player.medicstats[key].push( val );
                }
              });
            }

          });


        }
      })
    }
    else if ( _.isArray(steamIds) ) {
      
    }
    else throw 'Incorrect value passed into Logs.generatePlayerData(steamIds)';
  }*/
}