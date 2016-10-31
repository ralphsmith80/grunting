module.exports = function(grunt) {
    'use strict';

    var _ = require('lodash'),
        path = require('path'),
        join = path.join,
        dirname = path.dirname,
        requireConfig = grunt.file.readJSON('./config/requirejs-config.json');

    var onBuildWrite = function(moduleName, path, contents) {
            var cssModule,
                dir,
                cssPaths = grunt.config('indexCssPaths') || [];
            if (moduleName.slice(0, 4) === "css!") {
                cssModule = moduleName.replace(/^css!(\d+:)?/, "");
                dir = (dirname(cssModule) === '.') ?
                    grunt.config('staticPath') : grunt.config('componentDir');
                cssPaths.push(join(dir, cssModule));
                grunt.config('indexCssPaths', cssPaths);
                // console.log(cssModule);
            }
            return contents;
        },
        out = function(text) {
            var path = join(grunt.config('staticPath'), 'index-opt.js');
            grunt.file.write(path, text);
            cssPaths = _.map(cssPaths, function(path) {
                return join(grunt.config('componentDir'), path);
            });
            grunt.config('cssPaths', cssPaths);
            console.log(cssPaths);
        };

    return {
       index: {
            // use the base require config and override to provide build require config
            options: _.merge(_.clone(requireConfig, true), {
                baseUrl:        '<%= staticPath %>',
                insertRequire:  ['index'],
                name:           'index',
                out:            join('<%= staticPath %>', '<%= outputs.minified.js %>'),
                // optimize:       'none',
                optimize:       'uglify2',
                generateSourceMaps: true,
                preserveLicenseComments: false,
                keepBuildDir: true,
                paths: {
                    api:        'empty:',
                    app_config: 'empty:',
                    meshconf:   'empty:',
                },
                // make sure we include these so we do make extra XHR requests for them
                include: [
                    'i18n',
                    'text',
                ],
                onBuildWrite: onBuildWrite,
                // out: out,
            })
        },
        auxl: {
            // use the base require config and override to provide build require config
            options: _.merge(_.clone(requireConfig, true), {
                baseUrl:        '<%= staticPath %>',
                // urlArgs:        'bust=' + (new Date()).getTime(),
                insertRequire:  ['auxl/login'],
                name:           'auxl/login',
                out:            join('<%= componentDir %>', 'auxl', '<%= outputs.minified.js %>'),
                // optimize:       'none',
                optimize:       'uglify2',
                generateSourceMaps: true,
                preserveLicenseComments: false,
                keepBuildDir: true,
                paths: {
                    api:        'empty:',
                    app_config: 'empty:',
                    meshconf:   'empty:',
                },
                // make sure we include these so we do make extra XHR requests for them
                include: [
                    'i18n',
                    'text',
                ],
                onBuildWrite: onBuildWrite,
            })
        },
        embed: {
            // use the base require config and override to provide build require config
            options: _.merge(_.clone(requireConfig, true), {
                baseUrl:        '<%= staticPath %>',
                insertRequire:  ['index'],
                name:           'index',
                out:            join('<%= staticPath %>', '<%= outputs.minified.js %>'),
                optimize:       'uglify2',
                generateSourceMaps: true,
                preserveLicenseComments: false,
                keepBuildDir: true,
                paths: {
                    app_config: 'empty:',
                    meshconf:   'empty:',
                },
                // make sure we include these so we do make extra XHR requests for them
                include: [
                    'i18n',
                    'text',
                ],
                onBuildWrite: onBuildWrite,
            })
        },
    };
};
