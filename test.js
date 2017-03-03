import path from 'path';
import test from 'ava';
import helpers from 'yeoman-test';
import assert from 'yeoman-assert';
import pify from 'pify';
// import naming from './app/naming';

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
    await pify(helpers.testDirectory)(path.join(__dirname, 'temp'));
    generator = helpers.createGenerator('seth:app', ['../app'], null, { skipInstall : true });
});

test.serial('generates expected files', async () => {
    mockPrompt();

    await pify(generator.run.bind(generator))();

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

    await pify(generator.run.bind(generator))();

    assert.file('cli.js');
    assert.fileContent('package.json', /"bin":/);
    assert.fileContent('package.json', /"bin": "cli.js"/);
    assert.fileContent('package.json', /"meow"/);
});

// test('parse scoped package names', (t) => {
//     t.is(naming.slugify('author/thing'), 'author-thing', 'slugify non-scoped packages');
//     t.is(naming.slugify('@author/thing'), '@author/thing', 'accept scoped packages');
//     t.is(naming.slugify('@author/hi/there'), 'author-hi-there', 'fall back to regular slugify if invalid scoped name');
// });

test.serial('prompts for description', async () => {
    mockPrompt({
        description : 'awesome description'
    });

    await pify(generator.run.bind(generator))();

    assert.fileContent('.git/description', 'awesome description\n');
    assert.fileContent('package.json', '"description": "awesome description",\n');
    assert.fileContent('README.md', '> awesome description\n');
});
