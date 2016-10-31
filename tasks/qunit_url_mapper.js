module.exports = function(grunt) {
    'use strict';

    var _           = require('lodash'),
        join        = require('path').join,
        hostname    = grunt.config('host'),
        port        = grunt.config('port'),
        baseUrl     = 'http://'+hostname+':'+port+'/';

    var filterExcludedTests = function(tests) {
            // filter out any tests that match the testExclude regex in package.json
            var pkg = grunt.config('pkg'),
                exclude = (pkg.csi || {}).testExclude;
            if (!exclude) {
                return tests;
            }
            return _.filter(tests, function(test) {
                var isExcluded = RegExp(exclude).test(test);
                // if (isExcluded) console.log('excluding:', test);
                return !isExcluded;
            });
        },
        mapToUrl = function(glob) {
            var urls = _.map(grunt.file.expand({nocase: true}, glob), function (file) {
                // strip off staticPath if it's not '.'
                var staticPath = grunt.config('staticPath'),
                    regEx = new RegExp('^' + staticPath);
                if (staticPath !== '.') {
                    file = file.replace(regEx, '');
                }
                // remove leading '/'
                file = file.replace(/^\/|\/$/g, '');
                // remove extension
                file = file.replace(/\.[^/.]+$/, "");
                return baseUrl+file;
            });
            // console.log('### DEBUG - urls:\n', urls.join('\n '), '\nTotal:', urls.length);
            return urls;
        };


    grunt.registerMultiTask('qunit_url_mapper', 'Get Qunit urls for a single `component` or `all`', function() {
        var options = this.options(),
            glob    = options.glob,
            urls    = mapToUrl(glob);

        // we only exclude test when runing ci test to prevent redundant runs
        if (this.target === 'ci') {
            urls = filterExcludedTests(urls);
        }
        // grunt.log.writeln('testing urls:\n', urls.join('\n '));
        // set the urls in the qunit options so qunits knows what tests to run
        grunt.config.set('qunit.options.urls', urls);
    });

    return {
        component: {
            options: {
                glob: [join('<%= staticPath %>', '**', '<%= component %>', '**/*test*.js')],
            }
        },
        all: {
            options: {
                glob: [join('<%= staticPath %>', '**/*test*.js')],
            }
        },
        ci: {
            options: {
                glob: [join('<%= staticPath %>', '**/*test*.js')],
            }
        },
    };
};
