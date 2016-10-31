module.exports = function(grunt) {
    'use strict';

    var join = require('path').join;

    return {
        index: {
            src: '<%= requirejs.index.options.out %>',
            dest: join('<%= staticPath %>', '<%= outputs.minified.js %>'),
        },
        auxl: {
            src: '<%= requirejs.auxl.options.out %>',
            dest: join('<%= componentDir %>', 'auxl', '<%= outputs.minified.js %>'),
        },

        // IMPORTANT:
        // the following tasks overwrite copied files
        // unless you invoke them manually they will only be referenced by the production build task
        api: {
            files: [{
                    expand: true,
                    // cwd: '<%= staticPath %>',
                    cwd: '<%= componentDir %>',
                    src: ['api/**/*.js'],
                    dest: '<%= componentDir %>',
                    // ext: '.min.js',
                    // extDot: 'last',
            }]
        },
        nls: {
            files: [{
                    expand: true,
                    cwd: '<%= componentDir %>',
                    src: ['lookandfeel/nls/**/*.js'],
                    dest: '<%= componentDir %>',
            }]
        },
        require: {
            files: [{
                    expand: true,
                    cwd: '<%= componentDir %>',
                    src: ['require-vendor/*.js'],
                    dest: '<%= componentDir %>',
            }]
        },
    };
};
