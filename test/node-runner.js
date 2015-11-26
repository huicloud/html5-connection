var Mocha = require('mocha');
var chai = require('chai');
global.connection = require('../index.js');

global.expect = chai.expect;

var mocha = new Mocha({
  ui: 'bdd'
});

mocha.files = [
  './common.js',
  './spec/base.js'
];

mocha.run(process.exit);