'use strict';
require('../css/style.scss');
require('../css/c3.css');

window.onload = () => {
  'use strict';

  //const $ = require('jquery');
  //const _ = require('lodash');
  //const c3 = require('c3');
  const data = require('./data');
  const Logs = require('./logs');

  let logs = new Logs(data);

  console.log(logs.data);
  console.log(logs.getMapsPlayed());
  console.log(logs.getPlayersArr());

  $('#content').append('<button class="button" id="generate">Generate!</button>');

  // generate a table containing the players found in the logs
  // sorted by the amount of times they have appeared in them
  $('#content').append('<h3>Players found in the logs:</h3>');
  logs.getPlayersArr().forEach(player => {
    let otherNames = (function (player) {
      let otherNames = '';
      for (let i = 1; i < player.names.length; i++) {
        otherNames += '\n' + player.names[i].name;
      }
      return otherNames;
    }(player));

    $('#content').append(
      `<tr>
        <td><input type="checkbox" id="${ player.steamId }" value="${ player.steamId }"/></td>
        <td><label for="${ player.steamId }" class="player">${ player.steamId }</label></td>
        <td><label title="Other nicknames:${ otherNames }" for="${ player.steamId }" class="player">${ player.names[0].name }</label></td>
        <td>${ player.mapsPlayed }</td>
      </tr>`
    );
  });

  //$('td :checkbox').dragCheck();

  // generate a chart with the selected players
  $('#generate').click(() => {

    // create an array of the selected players
    let steamIds = [];
    $('input:checked').each(function () { steamIds.push($(this).val()) });

    // log out selected player data
    if (steamIds.length === 1 ) steamIds = steamIds[0];
    let playerLogs = logs.collectPlayerData(steamIds);

    console.log(playerLogs);

    if ( _.isObject(playerLogs) ) {

      let dpmArr = playerLogs.data.map(v => v.stats.dapm);
      dpmArr.unshift(playerLogs.steamId);

      const chart = c3.generate({
        bindto: '#chart',
        data: {
          type: 'bar',
          columns: [dpmArr]
        },
        axis: {
          x: {
            label: 'Date',
            position: 'outer-middle'
          },
          y: {
            label: 'Damage per minute',
            position: 'outer-middle'
          }
        }
      });
    }
    else if ( _.isArray(playerLogs) ) {
      _.each(playerLogs, playerLog => {
        _.each(playerLog.data, val => dpmArr.push(val.stats.dapm))
      });

      const chart = c3.generate({
        bindto: '#chart',
        type: 'bar',
        data: {
          columns: [dpmArr]
        },
        axis: {
          x: {
            label: 'Date',
            position: 'outer-middle'
          },
          y: {
            label: 'Damage per minute',
            position: 'outer-middle'
          }
        }
      });
    }



    //console.log(dpmArr);
  });


}
