const process = require('child_process');
const parser = require('./parser');
const readline = require('readline');
const { BehaviorSubject, map } = require('rxjs');

module.exports = function(command) {
  let summary = '';
  let progress = 0;

  const subject = new BehaviorSubject('');
  const observable = subject.asObservable().pipe(
    map(msg => msg.toString('utf8')),
    map(msg => {
      if (msg.match(/\d+(?:\.\d+)?%$/)) {
        // message contains progress status
        progress = parseFloat(msg);
      } else {
        // message contains part of the summary
        summary += `${msg}\r\n`;
      }

      return { summary, progress };
    }),
  );

  const robocopy = process.spawn(command.path, command.args, { windowsVerbatimArguments: true });

  const readlines = (input, listener) => {
    readline.createInterface({ input }).on('line', listener);
  };

  readlines(robocopy.stdout, (line) => subject.next(line));
  readlines(robocopy.stderr, (line) => subject.next(line));

  robocopy.on('exit', (code) => {
    if (code > 8) {
      const errors = parser(summary);
      const message = `Robocopy failed (${code}) ${errors ? `: ${errors}` : ''}`;
      subject.error(new Error(message));
    } else {
      subject.complete();
    }
  });

  return observable;
};
