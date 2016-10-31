module.exports = function(grunt) {
    'use strict';

    return {
        options: {
            maxImageSize: 0,
            baseDir: '<%= staticPath %>',
        },
        embed: {
            src: '<%= cssmin.index.dest %>',
            dest: '<%= cssmin.index.dest %>',
        },
    };
};
