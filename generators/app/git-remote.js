'use strict';

const
    exec = require('child_process').exec,
    ghGot = require('gh-got');

function initRepo() {
    return new Promise((resolve) => {
            exec('git init --quiet', (err) => {
                if (err) {
                    throw err;
                }
                resolve();
            });
        });
}

function setOrigin(url) {
    return new Promise((resolve) => {
        exec(`git remote add origin ${url}`, (err) => {
            if (!err) {
                resolve();
                return;
            }
            // Error code 128 is experienced when the remote is already set.
            if (err.code === 128) {
                exec(`git remote set-url origin ${url}`, (err) => {
                    if (err) {
                        throw err;
                    }
                    resolve();
                });
                return;
            }

            throw err;
        });
    });
}

function create(name, token, option) {

    return ghGot.post('user/repos', {
            token,
            body : JSON.stringify({
                name,
                description : option.description,
                homepage    : option.homepage,
                has_wiki    : false
            })
        }).catch((err) => {
            // Error code 422 is experienced when the repository already exists.
            if (err.statusCode === 422) {
                throw new Error(
                    `A repository named \"${name}\" already exists.`
                );
            }

            throw err;
        });
}

module.exports = {
    setOrigin,
    create
};
