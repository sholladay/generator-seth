import { promisify } from 'util';
import path from 'path';
import test from 'ava';
import helpers from 'yeoman-test';
import assert from 'yeoman-assert';

let generator;

const mockPrompt = (answer) => {
    return helpers.mockPrompt(generator, Object.assign(
        {
            pkgName     : 'my-pkg',
            description : 'my description',
            username    : 'meee',
            website     : 'example.com',
            cli         : false
        },
        answer
    ));
};

test.beforeEach(async () => {
    await promisify(helpers.testDirectory)(path.join(__dirname, 'temp'));
    generator = helpers.createGenerator('seth:app', ['../app'], null, { skipInstall : true });
});

test.serial('generates expected files', async () => {
    mockPrompt();

    await promisify(generator.run.bind(generator))();

    assert.file([
        '.editorconfig',
        '.git',
        '.gitattributes',
        '.gitignore',
        'CONTRIBUTING.md',
        'LICENSE',
        'README.md',
        'circle.yml',
        'index.js',
        'package.json',
        'test.js'
    ]);

    assert.noFile('cli.js');
});

test.serial('CLI option', async () => {
    mockPrompt({ cli : true });

    await promisify(generator.run.bind(generator))();

    assert.file('cli.js');
    assert.fileContent('package.json', /"bin":/);
    assert.fileContent('package.json', /"bin": "cli.js"/);
    assert.fileContent('package.json', /"meow"/);
});

test.serial('prompts for description', async () => {
    mockPrompt({
        description : 'awesome description'
    });

    await promisify(generator.run.bind(generator))();

    assert.fileContent('.git/description', 'awesome description\n');
    assert.fileContent('package.json', '"description": "awesome description",\n');
    assert.fileContent('README.md', '> awesome description\n');
});
