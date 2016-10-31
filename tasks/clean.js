module.exports = function(grunt) {
    'use strict';

    var join = require('path').join;

    return {
        index: [
            // css build files
            '<%= concat_css.index.dest %>',
            '<%= cssmin.index.dest %>',
            join('<%= staticPath %>', 'index-*.css'),
            // js build files
            '<%= requirejs.index.options.out %>',
            '<%= uglify.index.dest %>',
            join('<%= staticPath %>', 'index-*.js'),
            // source maps
            join('<%= staticPath %>', 'index.*.map'),
        ],
        auxl: [
            // Since this is in the components dir it will usually be cleaned by
            // the clean:components
            '<%= concat_css.auxl.dest %>',
            '<%= cssmin.auxl.dest %>',
            join('<%= componentDir %>', 'auxl', 'index-*.css'),

            // auxl/login.js build files
            '<%= requirejs.auxl.options.out %>',
            '<%= uglify.auxl.dest %>',
            join('<%= componentDir %>', 'auxl', 'index-*.js'),
        ],
        html: [
            // ----- HTML ----------
            // static html build file
            '<%= compile.options.dest %>',
        ],
        components: [
            '<%= componentDir %>',
        ],
        test: [
            'testResult.*',
        ],
        production: [
            '<%= staticPath %>/*',
            // keep html
            '!<%= staticPath %>/*.html',
            // keep images
            '!<%= staticPath %>/img',
            // keep components
            '!<%= staticPath %>/components',
            // keep minified files
            '!<%= requirejs.index.options.out %>',
            '!<%= cssmin.index.dest %>',
            // keep source maps
            '!<%= requirejs.index.options.out %>.map',

            '<%= componentDir %>/*',
            // keep some components for more descrete deletions
            '!<%= componentDir %>/require-vendor',
            '!<%= componentDir %>/api',
            '!<%= componentDir %>/auxl',
            '!<%= componentDir %>/lookandfeel',
            '!<%= componentDir %>/dax',

            // keep images, fonts, and native language
            '<%= componentDir %>/lookandfeel/*',
            '!<%= componentDir %>/lookandfeel/img',
            '!<%= componentDir %>/lookandfeel/fonts',
            '!<%= componentDir %>/lookandfeel/nls',

            // keep the login page assets
            '<%= componentDir %>/auxl/*',
            '!<%= requirejs.auxl.options.out %>',
            '!<%= cssmin.auxl.dest %>',
            '!<%= componentDir %>/auxl/loginform',
            '<%= componentDir %>/auxl/loginform/*',
            '!<%= componentDir %>/auxl/loginform/*.png',
            '!<%= componentDir %>/auxl/data',
            '<%= componentDir %>/auxl/data/*',
            '!<%= componentDir %>/auxl/data/*.ico',
            // keep source maps
            '!<%= requirejs.auxl.options.out %>.map',

            // keep pageer widget images in dax objectlist
            '<%= componentDir %>/dax/*',
            '!<%= componentDir %>/dax/objectlist',
            '<%= componentDir %>/dax/objectlist/*',
            '!<%= componentDir %>/dax/objectlist/*.png',

            '<%= staticPath %>/**/*.less',
        ],
    };
};
