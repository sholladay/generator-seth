'use strict';

const ghGot = require('gh-got');
const git = require('./git');

const setOrigin = (url) => {
    return git(`remote add origin "${url}"`)
        .catch((error) => {
            // Error code 128 is experienced when the remote is already set.
            if (error.code === 128) {
                return git(`remote set-url origin "${url}"`);
            }

            throw error;
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
        .catch((error) => {
            // Make validation errors more friendly.
            if (error.response && error.response.body && error.response.body.errors) {
                const alreadyExists = error.response.body.errors.some((x) => {
                    return x.resource === 'Repository' &&
                        x.field === 'name' &&
                        x.message === 'name already exists on this account';
                });

                if (alreadyExists) {
                    throw new Error(`A repository named "${name}" already exists.`);
                }
            }

            throw error;
        });
};

module.exports = {
    setOrigin,
    create
};
