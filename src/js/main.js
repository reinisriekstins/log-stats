'use strict';
require('../css/style.scss');
require('../css/c3.css');

window.onload = () => {
  'use strict';

  const _  = require('lodash');
  const d3 = require('d3'); // ask about these not 100% necessary dependencies in stack overflow
  const c3 = require('c3');

  const logsArr = require('./data');

  logsArr.sort((a, b) => {
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
