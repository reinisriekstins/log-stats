'use strict';
require('../css/style.scss');

const _  = require('lodash');
var data = require('./data');

window.onload = () => {
  var logsArr = data;

  logsArr
    .sort((a, b) => {
      if (a.data.time > b.data.time) return 1;
      else if (a.data.time < b.data.time) return -1;
      else return 0;
    });

  console.log(logsArr);

  var x = {};
  logsArr.forEach(log => {
    if (x[log.data.map] === undefined) x[log.data.map] = 1;
    else x[log.data.map]++;
  });
  console.log(x);
}
