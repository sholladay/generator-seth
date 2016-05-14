'use strict';

const
    path = require('path'),
    Base = require('yeoman-generator').Base,
    chalk = require('chalk'),
    yosay = require('yosay'),
    // TODO: Consider using update-notifier
    // updateNotifier = require('update-notifier'),
    username = require('username'),
    fullname = require('fullname'),
    firstName = require('first-name'),
    gitRemote = require('./git-remote'),
    gitDescription = require('git-description'),
    normalizeUrl = require('normalize-url'),
    npmName = require('npm-name'),
    validatePkgName = require('validate-npm-package-name'),
    _s = require('underscore.string');

function sentencify(str) {
    if (str) {
        str = str[0].toUpperCase() + str.slice(1);
        if (!str.endsWith('.')) {
            str += '.';
        }
    }

    return str;
}

function nonEmpty(subject) {
    return function (input) {
        return (input.trim().length > 0) || `A ${subject} is required.`;
    };
}

module.exports = class extends Base {

    prompting() {

        const
            prompts = [
                {
                    name    : 'moduleName',
                    message : 'What shall we name your module?',
                    default : this.appname.replace(/\s/g, '-'),
                    filter  : (input) => {
                        return _s.slugify(input);
                    },
                    validate : function (input) {

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
                    validate : (input) => {
                        return input.trim().length > 5 && input.includes(' ')
                            ? true
                            : 'Oh come on, be creative.';
                    }
                },
                {
                    name    : 'username',
                    message : 'What is your username?',
                    store   : true,
                    default : username,
                    filter : (input) => {
                        return input.toLowerCase();
                    },
                    validate : nonEmpty('username')
                },
                {
                    name    : 'fullName',
                    message : 'What is your full name?',
                    store   : true,
                    default : fullname,
                    validate : nonEmpty('name')
                },
                {
                    name    : 'email',
                    message : 'What is your e-mail?',
                    store   : true,
                    default : this.user.git.email(),
                    validate : (input) => {
                        return input.trim().length > 0
                            ? input.includes('@') || 'You forgot the @ sign.'
                            : 'An e-mail address is required.';
                    }
                },
                {
                    name    : 'website',
                    message : 'What is your web URL?',
                    store   : true,
                    filter  : normalizeUrl,
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
                    when : (answers) => {
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

            return this.prompt(prompts).then((props) => {

                // If the user did not bother creating the working directory
                // just for us, then we should store everything in a new
                // subdirectory to avoid puking on their workspace.
                if (props.moduleName !== _s.slugify(this.appname)) {
                    this.log('Using new subdirectory for module.');
                    this.destinationRoot(props.moduleName);
                    this.customDir = this.destinationRoot();
                }

                props.year = new Date().getUTCFullYear();
                props.camelModuleName = _s.camelize(props.moduleName);
                props.githubUrl = 'https://github.com/' + path.posix.join(
                    props.username, props.moduleName
                );

                this.props = props;
            });
        });
    }

    git() {

        const
            props = this.props,
            done = this.async(),
            moduleName = props.moduleName,
            description = props.description;

        this.spawnCommand('git', ['init', '--quiet']).on('close', (code) => {

            if (code) {
                throw new Error(`Unable to init git repo. Exit code ${code}.`);
            }

            const promises = [
                gitRemote.setOrigin(
                    `git@github.com:${props.username}/${moduleName}.git`
                ),
                gitDescription.set(description)
            ];

            if (props.createRemote) {
                promises.push(
                    gitRemote.create(
                        moduleName,
                        props.accessToken,
                        {
                            description
                        }
                    )
                );
            }

            Promise.all(promises).then(() => {
                done();
            });
        });
    }

    writing() {

        const
            mv = (from, to) => {
                this.fs.move(this.destinationPath(from), this.destinationPath(to));
            },
            props = this.props;

        this.fs.copyTpl(
            this.sourceRoot(),
            this.destinationRoot(),
            props
        );

        mv('__editorconfig'  , '.editorconfig');
        mv('__gitattributes' , '.gitattributes');
        mv('__gitignore'     , '.gitignore');
        mv('_LICENSE'        , 'LICENSE');
        mv('_CONTRIBUTING.md', 'CONTRIBUTING.md');
        mv('_README.md'      , 'README.md');
        mv('_index.js'       , 'index.js');
        mv('_package.json'   , 'package.json');
    }

    install() {
        this.installDependencies({ bower : false });

        if (this.customDir) {
            const relativePath = path.relative(
                process.env.PWD || process.cwd(), this.customDir
            );
            this.log(`Go to your project: cd \'${relativePath}\'\n`);
        }
    }
};
