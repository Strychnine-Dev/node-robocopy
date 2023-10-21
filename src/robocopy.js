const command = require('./command');
const process = require('./process');
const { merge, concat } = require('rxjs');

module.exports = function(options) {
  return (options.runSerial ? concat : merge)(...command(options).map((command) => process(command)));
};
