module.exports = function(grunt) {
    'use strict';

    var _       = require('lodash'),
        join    = require('path').join;

    var components = [],
        filter = function(path, src) {
            var pkg = {},
                isComponent = false,
                sourceDirectory;
            try {
                pkg = grunt.file.readJSON(path + '/package.json');
                // does the package.json file have a csi.name object?
                isComponent = !!((pkg.csi || {}).name || null);
                sourceDirectory = (pkg.csi || {}).sourceDirectory || 'src';
            } catch(e) {
            }
            if (isComponent) {
                console.log('[grunt - found]', pkg.csi.name);
                // components to copy
                components.push({
                    // cwd: path + '/src',
                    cwd: join(path, sourceDirectory),
                    // src: '**',
                    src: src,
                    dest: '<%= componentDir %>' + pkg.csi.name,
                    expand: true
                });
                // console.log(components);
                return true;
            }
            // don't copy any anything yet that's the `install` option
            return false;
        };
    grunt.registerMultiTask('find', 'find components for copy or symlink', function() {
        var src;
        switch (this.target) {
            case 'symlink':
                src = ['.'];
                break;
            case 'copy':
                src = '**';
                break;
            default:
                src = '**';
        }
        _.each(this.files, function(file) {
            // file.src.filter(filter);
            file.src.filter(function(path) {
                filter(path, src);
            });
        });
        grunt.config('components', components);
        // console.log(grunt.config('components'));
        this.files = components;
    });

    return {
        copy: {
            src: ['./', 'node_modules/*'],
            dest: '<%= componentDir %>',
            expand: true,
            flatten: true,
            files: []
        },
        symlink: {
            src: ['./', 'node_modules/*'],
            dest: '<%= componentDir %>',
            expand: true,
            flatten: true,
        }
    };
};
