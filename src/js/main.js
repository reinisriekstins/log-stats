'use strict';
require('../css/style.scss');
require('../css/c3.css');

window.onload = () => {
  'use strict';

  const _ = require('lodash');
  const c3 = require('c3');
  const data = require('./data');

  class Logs {
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
        // containing objects: [{name: <amount of maps played with this name>}, ...]
        ///// not content with this
        ///// it should definitely be {name: name, amount: amount}, not {name: amount}
        ///// or at least {name1: amount1, name2: amount2, name3: amount3}
        stats.names.sort();
        let names = [];
        let amount = 0;
        let prev = stats.names[0];

        _.each(stats.names, name => {

          if (name === prev) amount++;
          else {
            let obj = {};
            obj[prev] = amount;
            amount = 1;
            names.push(obj);
          }
          prev = name;
        });
        let obj = {};
        obj[prev] = amount;
        names.push(obj);
        stats.names = names;
        //////

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
  }

  let logs = new Logs(data);

  console.log(logs.data);
  console.log(logs.getMapsPlayed());
  console.log(logs.getPlayersArr());

  const chart = c3.generate({
    bindto: '#content',
    data: {
      columns: [
        ['data1', 100, 200, 150, 300, 200],
        ['data2', 400, 500, 250, 700, 300]
      ]
    }
  });
}
