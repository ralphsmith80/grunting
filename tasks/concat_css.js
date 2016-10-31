module.exports = function(grunt) {
    'use strict';

    var join = require('path').join;

    return {
        options: {
            assetBaseUrl: '<%= baseUrl %>',
            baseDir: '<%= staticPath %>'
        },
        index: {
            // cssPaths is built dynamically during the requirejs optimization task
            src: '<%= indexCssPaths %>',
            dest: join('<%= staticPath %>', '<%= outputs.minified.css %>')
        },
        auxl: {
            src: '<%= auxlCssPaths %>',
            dest: join('<%= componentDir %>', 'auxl', '<%= outputs.minified.css %>')
        },
        embed: {
            options: {
                assetBaseUrl: '<%= baseDir %>',
            },
            src: '<%= indexCssPaths %>',
            dest: join('<%= staticPath %>', '<%= outputs.minified.css %>')
        },
    };
};
