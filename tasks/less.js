module.exports = function(grunt) {
    'use strict';

    var join = require('path').join;

    return {
        all: {
            files: [
                {
                    expand: true,
                    cwd: '<%= staticPath %>',
                    src: ['**/*.less'],
                    dest: '<%= staticPath %>',
                    ext: '.css',
                }
            ]
        },
    };
};
