const chalk = require('chalk');

export function error(msg: string): void {
  console.error(new Error(chalk.bold.red(msg)));
}

