module.exports = function(grunt) {
    'use strict';

    var _       = require('lodash'),
        path    = require('path'),
        join    = path.join;

    grunt.registerMultiTask('compile', 'compile the html template', function() {
        var opts    = this.options(),
            dest    = opts.dest,
            js      = opts.js,
            template      = opts.template,
            staticPath    = grunt.config('staticPath'),
            optimized_css = opts.optimized_css,
            requirejs     = path.normalize(opts.requirejs),
            models        = null;

        // if we're embedding everything then we read the files to embed them directly
        // in the html rather than just setting the filename to be downloaded during runtime
        if (opts.embed) {
            optimized_css = grunt.file.read(join(staticPath, path.basename(optimized_css)), {
                encoding: null,
            });
            requirejs = grunt.file.read(requirejs, {
                encoding: null,
            });
        }

        // preload the admin user when not in production
        // this has been removed but I'm keeping it here as en example of how
        // to use this in the future if we decide to utilize this again.
        if (grunt.config('env') !== 'production') {
            models = _.extend({}, {
                // users: [{
                //     email: "user@gmail.com",
                //     id: "000000000-0000-0000-0000-000000000000",
                //     _current: true,
                //     name: "admin",
                // }],
            });
        }

        var app_config = grunt.config('app_config');
        if (!app_config) {
            grunt.fail.warn('app_config was not defined.\nIt should be in the top level Gruntfile.js.');
        }

        var index,
            requireConfig = grunt.config('requireConfig'),
            stringify = function(obj) {
                return JSON.stringify(obj, null, ' ');
            },
            options = {
                join: join,
                env: grunt.config('env'),
                app_config: stringify(app_config),
                meshconf: stringify(grunt.config('meshconf')),
                models: models ? stringify(models) : models,
                requirejs: requirejs,
                raw_require_config: requireConfig,
                require_config: stringify(requireConfig),
                optimized_css: optimized_css,
                // require wants the base name without the extension
                js: path.basename(js, path.extname(js)),
            };

        // console.log(options);
        index = _.template(template, options);
        grunt.file.write(dest, index);
    });

    return {
        options: {
            dest: join('<%= staticPath %>', 'index.html'),
            requireConfig: '<%= requireConfig %>',
            requirejs: join('<%= baseUrl %>', 'components/require-vendor/require.js'),
            template: grunt.file.read('./templates/index.mtpl', {
                encoding: null,
            }),
        },
        dev: {
            options: {
                js: 'index'
            }
        },
        minified: {
            options: {
                js: '<%= outputs.minified.js %>',
                optimized_css: '<%= outputs.minified.css %>'
            }
        },
        ebmed: {
            options: {
                embed: true,
                js: '<%= outputs.minified.js %>',
                optimized_css: '<%= outputs.minified.css %>',
                requirejs: join('<%= staticPath %>', 'components/require-vendor/require.js'),
                template: grunt.file.read('./templates/embed.mtpl', {
                    encoding: null,
                }),
            }
        },
    };
};
