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
  $('#content').append('<h3>Players found in the log:</h3>');
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

  // generate a chart with the selected players
  $('#generate').click(() => {

    // create an array of the selected players
    let steamIds = [];
    $('input:checked').each(function () { steamIds.push($(this).val()) });

    // log out selected player data
    if (steamIds.length === 1 ) steamIds = steamIds[0];
    console.log(logs.collectPlayerData(steamIds));
  });

  const chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: [
        ['data1', 100, 200, 150, 300, 200],
        ['data2', 400, 500, 250, 700, 300]
      ]
    }
  });
}
