'use strict';

const path = require('path');
const { Base } = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const username = require('username');
const fullname = require('fullname');
const firstName = require('first-name');
const gitDescription = require('git-description');
const normalizeUrl = require('normalize-url');
const npmName = require('npm-name');
const validatePkgName = require('validate-npm-package-name');
const { slugify, camelize } = require('underscore.string');
const pkg = require('../../package.json');
const gitRemote = require('./git-remote');

require('update-notifier')({ pkg }).notify();

const sentencify = (input) => {
    if (!input) {
        return input;
    }

    const sentence = input[0].toUpperCase() + input.slice(1);

    return sentence.endsWith('.') ? sentence : sentence + '.';
};

const titleize = (input) => {
    return input[0].toUpperCase() + input.slice(1).replace(/-(.)/g, (match, letter) => {
        return ' ' + letter.toUpperCase();
    });
};

const nonEmpty = (subject) => {
    return (input) => {
        return (input.trim().length > 0) || `A ${subject} is required.`;
    };
};

module.exports = class extends Base {
    prompting() {
        const prompts = [
            {
                name    : 'pkgName',
                message : 'What shall we name your module?',
                default : this.appname.replace(/\s/g, '-'),
                filter  : slugify,
                validate(input) {
                    const validity = validatePkgName(input);

                    if (!validity.validForNewPackages) {
                        return validity.errors[0];
                    }

                    return npmName(input).then(
                        (isAvailable) => {
                            return isAvailable || 'Name is already taken on npm.';
                        },
                        // Ignore errors because most likely it means
                        // we are simply offline.
                        () => {
                            return true;
                        }
                    );
                }
            },
            {
                name    : 'description',
                message : 'How would you describe it?',
                filter  : sentencify,
                validate(input) {
                    return input.trim().length > 5 && input.includes(' ') ?
                        true :
                        'Oh come on, be creative.';
                }
            },
            {
                name    : 'username',
                message : 'What is your username?',
                store   : true,
                default : username,
                filter(input) {
                    return input.toLowerCase();
                },
                validate : nonEmpty('username')
            },
            {
                name     : 'fullName',
                message  : 'What is your full name?',
                store    : true,
                default  : fullname,
                validate : nonEmpty('name')
            },
            {
                name    : 'email',
                message : 'What is your e-mail?',
                store   : true,
                default : this.user.git.email(),
                validate(input) {
                    return input.trim().length > 0 ?
                        (input.includes('@') || 'You forgot the @ sign.') :
                        'An e-mail address is required.';
                }
            },
            {
                name     : 'website',
                message  : 'What is your web URL?',
                store    : true,
                filter   : normalizeUrl,
                validate : nonEmpty('website')
            },
            {
                name    : 'createRemote',
                message : 'Create remote repository?',
                type    : 'confirm',
                default : false
            },
            {
                name     : 'accessToken',
                message  : 'Enter your access token:',
                // TODO: Report to Inquirer, this ought to be encrypted.
                store    : true,
                validate : nonEmpty('access token'),
                when(answers) {
                    return answers.createRemote;
                }
            }
        ];

        return firstName().then((casualName) => {
            // Say hello to the user.
            this.log(yosay(
                'Hey ' + chalk.bold.blue(casualName) +
                '. Let\'s write some code.'
            ));

            return this.prompt(prompts).then((answer) => {
                // If the user did not bother creating the working directory
                // just for us, then we should store everything in a new
                // subdirectory to avoid puking on their workspace.
                if (answer.pkgName !== slugify(this.appname)) {
                    this.log('Using new subdirectory for module.');
                    this.destinationRoot(answer.pkgName);
                    this.customDir = this.destinationRoot();
                }

                this.props = Object.assign({}, answer, {
                    year      : new Date().getUTCFullYear(),
                    jsPkgName : camelize(answer.pkgName),
                    repoUrl   : 'https://github.com/' + path.posix.join(
                        answer.username, answer.pkgName
                    ),
                    pkgTitle  : titleize(answer.pkgName)
                });
            });
        });
    }

    git() {
        const props = this.props;
        const done = this.async();
        const { pkgName, description } = props;

        this.spawnCommand('git', ['init', '--quiet']).on('close', (code) => {
            if (code) {
                throw new Error(`Unable to init git repo. Exit code ${code}.`);
            }

            const promises = [
                gitRemote.setOrigin(
                    `git@github.com:${props.username}/${pkgName}.git`
                ),
                gitDescription.set(description)
            ];

            if (props.createRemote) {
                promises.push(
                    gitRemote.create(pkgName, props.accessToken, {
                        description
                    })
                );
            }

            Promise.all(promises).then(() => {
                done();
            });
        });
    }

    writing() {
        const mv = (from, to) => {
            this.fs.move(this.destinationPath(from), this.destinationPath(to));
        };

        this.fs.copyTpl(
            this.sourceRoot(),
            this.destinationRoot(),
            this.props
        );

        mv('__editorconfig', '.editorconfig');
        mv('__gitattributes', '.gitattributes');
        mv('__gitignore', '.gitignore');
        mv('_LICENSE', 'LICENSE');
        mv('_CONTRIBUTING.md', 'CONTRIBUTING.md');
        mv('_README.md', 'README.md');
        mv('_index.js', 'index.js');
        mv('_package.json', 'package.json');
    }

    install() {
        this.installDependencies({ bower : false });

        if (this.customDir) {
            const relativePath = path.relative(
                process.env.PWD || process.cwd(), this.customDir
            );
            this.log(`Go to your project: cd '${relativePath}'\n`);
        }
    }
};
