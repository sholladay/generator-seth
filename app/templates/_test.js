import test from 'ava';
import <%= jsPkgName %> from '.';

test('<%= jsPkgName %>()', (t) => {
    t.notThrows(<%= jsPkgName %>, 'Fix all module errors.');
});
