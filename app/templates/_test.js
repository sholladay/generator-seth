import test from 'ava';
import <%= jsPkgName %> from './index.js';

test('<%= jsPkgName %>()', (t) => {
    t.notThrows(<%= jsPkgName %>, 'Fix all module errors.');
});
