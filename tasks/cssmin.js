module.exports = function(grunt) {
    'use strict';

    var join = require('path').join;

    return {
        index: {
            src: '<%= concat_css.index.dest %>',
            dest: join('<%= staticPath %>', '<%= outputs.minified.css %>')
        },
        auxl: {
            src: '<%= concat_css.auxl.dest %>',
            dest: join('<%= componentDir %>', 'auxl', '<%= outputs.minified.css %>')
        }
    };
};
