'use strict';

const { exec } = require('child_process');
const ghGot = require('gh-got');

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

const setOrigin = (url) => {
    return git(`remote add origin "${url}"`)
        .catch((err) => {
            // Error code 128 is experienced when the remote is already set.
            if (err.code === 128) {
                return git(`remote set-url origin "${url}"`);
            }

            throw err;
        });
};

const create = (name, token, option) => {
    return ghGot.post('user/repos', {
        token,
        body : {
            name,
            description : option.description,
            homepage    : option.homepage,
            // eslint-disable-next-line camelcase
            has_wiki    : false
        }
    })
        .catch((err) => {
            // Make validation errors more friendly.
            if (err.response && err.response.body && err.response.body.errors) {
                const alreadyExists = err.response.body.errors.some((x) => {
                    return x.resource === 'Repository' && x.field === 'name' &&
                        x.message === 'name already exists on this account';
                });

                if (alreadyExists) {
                    throw new Error(`A repository named "${name}" already exists.`);
                }
            }

            throw err;
        });
};

module.exports = {
    setOrigin,
    create
};
