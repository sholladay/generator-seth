'use strict';

const { exec } = require('child_process');

const git = (command) => {
    return new Promise((resolve, reject) => {
        exec('git ' + command, (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
};

module.exports = git;
