'use strict';

const request = require("request");
const _       = require("lodash");

var x = "prop1";

var object = {};
var other = {prop2: 2};

object[x] = {innerProp: "val1"};

other[x] = object[x];

object[x].innerProp = 'yo';

console.log(other);
console.log(object);
