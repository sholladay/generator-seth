#!/usr/bin/env node

'use strict';

const meow = require('meow');
const <%= jsPkgName %> = require('.');

const cli = meow(`
    Usage
      $ <%= pkgName %> [input]

    Option
      --foo  Lorem ipsum [Default: false]

    Example
      $ <%= pkgName %>
      llamas & rainbows
      $ <%= pkgName %> ducks
      ducks & rainbows
`);

console.log(<%= jsPkgName %>(cli.input[0] || 'llamas'));
