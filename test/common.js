"use strict";

global.chai = require("chai");
global.expect = require("chai").expect;

var fs       = require("fs")
  , fixtures = {};

global.fixture = function(name) {
  if (!fixtures[name]) {
    fixtures[name] = fs.readFileSync(__dirname + "/fixture/" + name);
  }
  return JSON.parse(fixtures[name]);
};
