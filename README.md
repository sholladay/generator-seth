# generator-seth [![Build status for generator-seth](https://img.shields.io/circleci/project/sholladay/generator-seth/master.svg "Build Status")](https://circleci.com/gh/sholladay/generator-seth "Builds")

> Set up your projects

## Why?

 - Repeatable, dependable project set up.
 - Carefully validates input without being annoying.
 - Checks whether the project name is available on npm.
 - Creates a repository on GitHub.
 - Configures CI and runs tests on every commit.
 - Sets a description on the repository, locally and remotely.
 - Auto-detects whether files should be put in a new directory.

## Install

```sh
npm install yo generator-seth --global
```

## Usage

Create your new project with [yo](https://github.com/yeoman/yo).

```sh
yo seth
```

You can tweak the behavior with command line options.

```sh
$ yo seth --help

  Usage:
    yo seth [options]

  Options:
    --help          # Print the generator's options and usage
    --skip-cache    # Do not remember prompt answers             Default: false
    --skip-install  # Do not automatically install dependencies  Default: false
```

You will be prompted for any required info not passed on the command line.

## Option

### cli

Type: `boolean`<br>
Default: `false`

Whether to generate a `cli.js` and configure `package.json` as appropriate for a command line app.

### username

Type: `string`<br>
Example: `sholladay`

The author's handle / account name.

### fullName

Type: `string`<br>
Example: `Seth Holladay`

The author's full legal name.

### email

Type: `string`

An email address to contact the author.

### website

Type: `string`

A URL for the author. Used in `package.json` and `README.md`.

### createRemote

Type: `boolean`<br>
Default: `false`

Whether to create a remote repository on GitHub. The remote is automatically configured as `origin`, its wiki is turned off, and its description is set for you.

### accessToken

Type: `string`

A [personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) used to communicate with the GitHub API for creating a repository when `createRemote` is `true`.

## Don't Repeat Yourself

To reduce typing to a minimum, you should set up an alias in your dotfiles that provides common values for you on the command line.

```bash
alias seth='yo seth --username="$(id -un)" --full-name="$(id -F)" --email='\''me@seth-holladay.com'\'' --website='\''https://seth-holladay.com'\'' --access-token='\''<my-access-token>'\';
```

Now instead of invoking the generator as `yo seth`, you can use just `seth` and your favorite options will be applied.

## Contributing

See our [contributing guidelines](https://github.com/sholladay/generator-seth/blob/master/CONTRIBUTING.md "Guidelines for participating in this project") for more details.

1. [Fork it](https://github.com/sholladay/generator-seth/fork).
2. Make a feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. [Submit a pull request](https://github.com/sholladay/generator-seth/compare "Submit code to this project for review").

## License

[MPL-2.0](https://github.com/sholladay/generator-seth/blob/master/LICENSE "License for generator-seth") © [Seth Holladay](https://seth-holladay.com "Author of generator-seth")

Go make something, dang it.
