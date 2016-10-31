module.exports = function(grunt) {
    'use strict';

    // -- We have two tasks happening here
    // 1. find component dirs (find task)
    //      At the same time we build an array of these compenents as we find them
    //      so we can use for (2).
    // 2. copy all files from the `src` directory of each compenent
    //      We use the compenent array that we built in (1) while finding each component.
    //      The copy config is completely build in (1) so we just need to provide that to `files` array.
    return {
        // find all component an populate the components array
        // find: {
        //     src: ['./', 'node_modules/*'],
        //     dest: copyDest,
        //     expand: true,
        //     flatten: true,
        //     filter: function(path) {
        //         var pkg = {},
        //             isComponent = false,
        //             sourceDirectory;
        //         try {
        //             pkg = grunt.file.readJSON(path + '/package.json');
        //             // does the package.json file have a csi.name object?
        //             isComponent = !!((pkg.csi || {}).name || null);
        //             sourceDirectory = (pkg.csi || {}).sourceDirectory || 'src';
        //         } catch(e) {
        //         }
        //         if (isComponent) {
        //             console.log('[grunt - install]', pkg.csi.name);
        //             // components to copy

        //             components.push({
        //                 // cwd: path + '/src',
        //                 cwd: join(path, sourceDirectory),
        //                 src: '**',
        //                 dest: copyDest + pkg.csi.name,
        //                 expand: true
        //             });
        //             console.log(components);
        //         }
        //         // don't copy any anything yet that's the `install` option
        //         return false;
        //     }
        // },

        // copy the components to the `copyDest` directory
        install: {
            // files: components
            files: '<%= components %>'
            // files: '<%= find.copy.files %>'
        },
        // copy requirejs and requirejs plugins
        require: {
            src: [
                './node_modules/grunting/vendor/require.js',
                './node_modules/grunting/vendor/text.js',
                './node_modules/grunting/vendor/css.js',
                './node_modules/grunting/vendor/i18n.js',
            ],
            dest: '<%= componentDir %>require-vendor',
            expand: true,
            flatten: true
        },
        testDependencies: {
            src: ['./node_modules/grunting/vendor/*'],
            dest: '<%= componentDir %>test-vendor',
            expand: true,
            flatten: true
        },
        'lookandfeel-strings': {
            expand: true,
            cwd: '<%= componentDir %>',
            src: ['lookandfeel/nls/**/*.yaml'],
            dest: '<%= componentDir %>',
            ext: '.js',
            options: {
                process: function (content, srcpath) {
                    var _       = require('lodash'),
                        yaml    = grunt.file.readYAML(srcpath),
                        strings = JSON.stringify(yaml, null, "    ").replace(/\n/g, "\n      ");
                    grunt.log.writeln(srcpath, typeof(yaml));
                    return _.template("define(<%=strings%>);")({strings: strings});
                },
            },
        },
        strings: {
            expand: true,
            cwd: '<%= componentDir %>',
            src: ['*/nls/**/*.yaml'],
            dest: '<%= componentDir %>',
            ext: '.js',
            options: {
                process: function (content, srcpath) {
                    var _       = require('lodash'),
                        yaml    = grunt.file.readYAML(srcpath),
                        strings = JSON.stringify(yaml, null, "    ").replace(/\n/g, "\n      ");
                    grunt.log.writeln(srcpath);
                    return _.template("define(<%=strings%>);")({strings: strings});
                },
            },
        },
    };
};
