'use strict';

const childProcess = require('child_process');
const { promisify } = require('util');

const exec = promisify(childProcess.exec);

const git = (command) => {
    return exec('git ' + command);
};

module.exports = git;
