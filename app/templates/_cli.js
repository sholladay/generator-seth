#!/usr/bin/env node

import meow from 'meow';
import <%= jsPkgName %> from './index.js';

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
