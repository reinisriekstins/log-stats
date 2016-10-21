'use strict';

const request = require('request'); /// maybe use axios?
const _       = require('lodash');
const cheerio = require('cheerio');
const url     = require('url');
const fs      = require('fs');

const requestArray = [
  "http://logs.tf/1467290",
  "http://logs.tf/1467270",
  "http://logs.tf/1470116",
  "http://logs.tf/1470090",
  "http://logs.tf/1472397",
  "http://logs.tf/1474249",
  "http://logs.tf/1474288",
  "http://logs.tf/1475194",
  "http://logs.tf/1477260",
  "http://logs.tf/1477309",
  "http://logs.tf/1479187",
  "http://logs.tf/1479222",
  "http://logs.tf/1481895",
  "http://logs.tf/1481929",
  "http://logs.tf/1483724",
  "http://logs.tf/1483759",
  "http://logs.tf/1484569",
  "http://logs.tf/1507118",
  "http://logs.tf/1507152",
  "http://logs.tf/1508969",
  "http://logs.tf/1508994",
  "http://logs.tf/1514335",
  "http://logs.tf/1514379",
  "http://logs.tf/1516345",
  "http://logs.tf/1516372",
  "http://logs.tf/1517294",
  "http://logs.tf/1517330",
  "http://logs.tf/1517362",
  "http://logs.tf/1519074",
  "http://logs.tf/1519102",
  "http://logs.tf/1520298",
  "http://logs.tf/1521573",
  "http://logs.tf/1521619",
  "http://logs.tf/1523536",
  "http://logs.tf/1523567",
  "http://logs.tf/1526363",
  "http://logs.tf/1526422",
  "http://logs.tf/1527040",
  "http://logs.tf/1527069",
  "http://logs.tf/1532687",
  "http://logs.tf/1537423",
  "http://logs.tf/1537459",
  "http://logs.tf/1538945",
  "http://logs.tf/1538979",
  "http://logs.tf/1541431",
  "http://logs.tf/1541448",
  "http://logs.tf/1541486",
  "http://logs.tf/1543411",
  "http://logs.tf/1543432",
  "http://logs.tf/1543458",
  "http://logs.tf/1546881",
  "http://logs.tf/1546865"
];

// not sure what's happenning in this copy pasta function, but it works 100%
function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);

    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    // so we must check for that, too. Thankfully, null is falsey, so this suffices:
    if (o && (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === "object") {
      return o;
    }
  } catch (e) {}

  return false;
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

function logs(callback) {

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
        /// logsArr.forEach(log => { log.log = JSON.parse(log.log) });
        /// fs.writeFile('./data.js', JSON.stringify(logsArr), console.log('done writing to file'));
        callback(null, logsArr);
      })
      .catch(error => callback(error, logsArr));
}

module.exports = logs;
