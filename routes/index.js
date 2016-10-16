'use strict';

const express = require('express');
const router  = express.Router();

const logs    = require('../logs');

/* GET home page. */
/*
router.get('/', (req, res, next) => {
  logs((error, response) => {
    if (error) console.log(error);
    else res.render('index', { logsArr: JSON.stringify(response) });
  });
});
*/

router.get('/', (req, res, next) => {
  res.render('index');
  //res.render('index', {});
});

module.exports = router;
