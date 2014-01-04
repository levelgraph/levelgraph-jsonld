var fs       = require('fs'),
    level    = require('level-test')(),
    graph    = require('levelgraph'),
    jsonld   = require('../'),
    _        = require('lodash'),
    fixtures = {};

var getFixture = function(name) {
  if (!fixtures[name]) {
    fixtures[name] = fs.readFileSync(__dirname + '/fixture/' + name);
  }
  return JSON.parse(fixtures[name]);
};

var getDB = function(opts) {
  opts = _.assign({ jsonld: {} }, opts);
  return jsonld(graph(level()), opts.jsonld);
};

module.exports.getFixture = getFixture;
module.exports.getDB = getDB;
