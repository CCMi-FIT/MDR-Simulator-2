// @flow

const chalk = require('chalk');

export function error(msg: string): void {
  console.error(chalk.bold.red(msg));
}

