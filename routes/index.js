'use strict';

const express = require('express');
const router  = express.Router();
const request = require('request'); /// maybe use axios?
const _       = require('lodash');
const cheerio = require('cheerio');
const url     = require('url');

const requestArray = require('../logs');

/// NOTE: I BELIEVE THAT ALL OF THE OPERATIONS HERE CAN BE DONE IN THE BROWSER

// not sure what's happenning in this copy pasta function, but it works 100%
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

function requestLogJson(urlPath) {
  return new Promise ((resolve, reject) => {
    request(`http://logs.tf/json${urlPath}`, (error, response, body) => {

      // checks for errors and invalid data
      if (error) {
        reject(error);
      }
      else if ( !tryParseJSON(body) ) {
        let $ = cheerio.load(body);

        if ( $('.log-section > h3').html() === 'Something went wrong' ) {
          // recursively call requestLogHtml every 50 ms
          /////// careful about infinite looop
          setTimeout(() => {
            requestLogJson(urlPath)
              .then(obj => resolve(obj));
          }, 50);
        }
        else reject(`http://logs.tf/json${urlPath} doesn\'t seem to be a JSON.`);
      }
      else {
        resolve(body);
      }
    });
  });
}

function requestLogHtml(urlPath) {
  return new Promise ((resolve, reject) => {
    request(`http://logs.tf${urlPath}`, (error, response, body) => {

      // checks for errors
      if (error) {
        reject(error);
      }
      else {
        let $ = cheerio.load(body);

        var map  = $('#log-map').html() || '';
        var time = $('.datefield').attr('data-timestamp');

        // check for invalid log html
        // all logs have an upload date
        if (time === undefined) {
          if ( $('.log-section > h3').html() === 'Something went wrong' ) {
            // recursively call requestLogHtml every 50 ms
            /////// careful about infinite looop?
            setTimeout(() => {
              requestLogHtml(urlPath)
                .then(obj => resolve(obj));
            }, 50);
          }
          else reject(`Couldn't find the date field in http://logs.tf${urlPath}`);
        }
        else resolve({ id: urlPath, time: time, map: map });
      }
    });
  });
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

        let jsonPromise = requestLogJson(urlPath);
        let htmlPromise = requestLogHtml(urlPath);

        Promise
          .all([htmlPromise, jsonPromise])
          .then(promiseArr => {
            // concatenate 3 zeroes to unix timestamp,
            // because logs.tf omits them
            promiseArr[0].time += '000';

            resolve({ data: promiseArr[0], log: promiseArr[1] });
          });

      }
      else reject(`http://logs.tf/json${urlPath} didn\'t validate.`);
    });
  });

  // when all log JSON strings have been extracted
  Promise
    .all(responseArray)
    .then(logsArr => {
      res.render('index', { logsArr: JSON.stringify(logsArr) });
    })
    .catch(error => console.error(error));
});

module.exports = router;
