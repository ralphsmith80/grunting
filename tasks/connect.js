/**
    Options for running connect
*/
module.exports = function(grunt) {
    'use strict';

    var username = grunt.option('username') || 'username@gmail.com',
        password = grunt.option('password') || 'admin',
        proxyHeaders = {
            'X-SPIRE-CREDENTIAL-TYPE': 'password',
            'X-SPIRE-CREDENTIAL-TENANT-ID': 'appstack',
            'X-SPIRE-CREDENTIAL-USERNAME': username,
            'X-SPIRE-CREDENTIAL-PASSWORD': password,
        };

    var defaultHeaders = {
        'Content-Type': 'text/plain',
        'Cache-Control': 'must-revalidate, no-cache'
    };
    var contentType = {
        'html': 'text/html',
        'css': 'text/css',
        'js': 'application/javascript'
    };

    var _       = require('lodash'),
        fs      = require('fs'),
        path    = require('path'),
        join    = path.join,
        modRewrite      = require('connect-modrewrite'),
        port            = grunt.config('port'),
        requireConfig   = grunt.file.readJSON('./config/requirejs-config.json'),
        template        = grunt.file.read('./templates/qunitrunner.mtpl'),
        listTestsTemplate = grunt.file.read('./templates/listtests.mtpl'),

        getTemplate = function(file) {
            var app_config = grunt.config('app_config');
            if (!app_config) {
                grunt.fail.warn('app_config was not defined.\nIt should be in the top level Gruntfile.js.');
            }

            var tmpl,
                vendor      = 'components/test-vendor',
                baseUrl     = requireConfig.baseUrl,
                meshconf    = grunt.config('meshconf'),
                options     = {
                    qunitCss:   baseUrl + vendor + '/qunit.css',
                    qunitJs:    baseUrl + vendor + '/qunit.js',
                    requireJs:  baseUrl + vendor + '/require.js',
                    config:     JSON.stringify(requireConfig, null, ' '),
                    // remove leading '/' and ext i.e. ('.js')
                    jsPath:     file.replace(/^\/|\/$/g, '').replace(/\.[^/.]+$/, ''),
                    meshconf:   JSON.stringify(meshconf, null, ' '),
                    app_config: JSON.stringify(app_config, null, ' ')
                };

            // console.log('\n### DEBUG - baseUrl:', baseUrl, '\n');

            // template = grunt.option('testRunnerTmpl');
            // grunt.template chokes on the yaml strings so we use lodash.template
            // tmpl = grunt.template.process(template, {data: options});
            tmpl = _.template(template, options);
            return tmpl;
        },
        writeHead = function(filename, res, statusCode, data) {
            res.writeHead(statusCode, _.extend({}, defaultHeaders, {
                'Content-Type': contentType[path.extname(filename).slice(1)],
                'Content-Length': Buffer.byteLength(data)
            }));
        },
        isTest = function(pathname) {
            return /test/i.test(pathname.split('/').pop().split('?')[0]) && // basename/filename contains 'test'
                    !/\.[a-z0-9]+$/i.test(pathname) && //has extension
                    !/\/$/.test(pathname); // end in a '/'
        },
        isListTests = function(pathname) {
            return {
                component: /^[\/]$/.test(pathname), // at the root '/'
                all: /listalltests/i.test(pathname.split('/').pop().split('?')[0]) && // basename/filename contains 'listtests'
                    !/\.[a-z0-9]+$/i.test(pathname) && //has extension
                    !/\/$/.test(pathname)
            };
        },
        /**
         * Reusable middleware functions
         */
        //Matches everything that does not contain a '.' (period);
        routeToHtml = modRewrite(['^[^\\.]*$ /index.html [L]']),
        // serve test
        // INFO: We will allow the directories to be browsable where we are serving
        //  test files. However to make this work in the case were you have a file
        //  that matches our 'test' regex the trail '/' must be in the url to browse.
        // EXAMPLE:
        //  If we have a test.js file and a test directory at the same level we
        //  want to serve the test if no trailing '/' is provided and we want to
        //  serve the directory if the trailing '/' is present.
        //      Server test:
        //          http://localhost:1336/components/gloss/widgets/user_display/grid/test
        //      Server directory:
        //          http://localhost:1336/components/gloss/widgets/user_display/grid/test/
        //
        // INFO:
        //  Note that the extension is removed in the url if you want to serve a test file.
        //  Browse to the file when the server is running and remove the '.js' extension.
        serveTest = function(req, res, next) {
            var template,
                pathname = req.url;
            if (isTest(pathname)) {
                pathname = pathname.split("?")[0];
                template = getTemplate(pathname + '.js');
                writeHead(pathname+'.html', res, 200, template);
                res.write(template);
                return res.end();
            }
            next();
        },
        listTests = function(req, res, next) {
            var testsMarkup,
                listTestsRes = isListTests(req.url);
            if(listTestsRes.component || listTestsRes.all){
                testsMarkup = _.template(listTestsTemplate,{
                    tests:          grunt.config('qunit.options.urls'),
                    listAllTests:   listTestsRes.all,
                    componentName:  grunt.config('pkg').csi.name,
                    components:     ['gloss','auxl','bedrock','mesh-client']
                });
                writeHead('tests.html', res, 200, testsMarkup);
                res.write(testsMarkup);
                return res.end();
            }
            next();
        };

    return {
        server: {
            options: {
                hostname: grunt.config('host'),
                port: port,
                base: '<%= staticPath %>',
                keepalive: true,
                open: true,
                middleware: function(connect, options, middlewares) {
                    middlewares.unshift(routeToHtml);
                    return middlewares;
                },
            },
        },
        test: {
            options: {
                hostname: grunt.config('host'),
                port: port,
                base: '<%= staticPath %>',
                middleware: function(connect, options, middlewares) {
                    middlewares.unshift(serveTest);
                    return middlewares;
                },
            },
        },
        listtest: {
            options: {
                hostname: grunt.config('host'),
                port: port,
                base: '<%= staticPath %>',
                keepalive: true,
                open: true,
                middleware: function(connect, options, middlewares) {
                    middlewares.unshift(listTests, serveTest);
                    return middlewares;
                }
            }
        },
        exploreapi: {
            options: {
                hostname: grunt.config('host'),
                port: port,
                base: '<%= staticPath %>',
                keepalive: true,
                open: true,
                middleware: function(connect, options, middlewares) {
                    var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;
                    middlewares.unshift(proxySnippet);
                    return middlewares;
                }
            },
            proxies: [
                {
                    context: '/proxy',
                    host: grunt.config('proxy-host'),
                    port: grunt.config('proxy-port'),
                    https: grunt.config('proxy-https'),
                    headers: proxyHeaders,
                },
                {
                    context: '/api',
                    host: grunt.config('proxy-host'),
                    port: grunt.config('proxy-port'),
                    https: grunt.config('proxy-https'),
                    headers: proxyHeaders,
                },
                {
                    context: '/uapi',
                    host: grunt.config('proxy-host'),
                    port: grunt.config('proxy-port'),
                    https: grunt.config('proxy-https'),
                    headers: proxyHeaders,
                },
            ]
        },
        proxy: {
            options: {
                hostname: grunt.config('host'),
                port: port,
                base: '<%= staticPath %>',
                keepalive: true,
                open: true,
                middleware: function(connect, options, middlewares) {
                    var proxySnippet = require('grunt-connect-proxy/lib/utils').proxyRequest;
                    middlewares.unshift(proxySnippet, routeToHtml);
                    return middlewares;
                },
            },
            proxies: [
                {
                    context: '/proxy',
                    host: grunt.config('proxy-host'),
                    port: grunt.config('proxy-port'),
                    https: grunt.config('proxy-https'),
                    headers: proxyHeaders,
                },
                {
                    context: '/api',
                    host: grunt.config('proxy-host'),
                    port: grunt.config('proxy-port'),
                    https: grunt.config('proxy-https'),
                    headers: proxyHeaders,
                },
                {
                    context: '/uapi',
                    host: grunt.config('proxy-host'),
                    port: grunt.config('proxy-port'),
                    https: grunt.config('proxy-https'),
                    headers: proxyHeaders,
                },
                {
                    context: '/clientdownload',
                    host: grunt.config('proxy-host'),
                    port: grunt.config('proxy-port'),
                    https: grunt.config('proxy-https'),
                    headers: proxyHeaders,
                },
                {
                    context: '/upload',
                    host: grunt.config('proxy-host'),
                    port: grunt.config('proxy-port'),
                    https: grunt.config('proxy-https'),
                    headers: proxyHeaders,
                },
                {
                    context: '/socket.io',
                    host: grunt.config('proxy-host'),
                    port: grunt.config('proxy-port'),
                    https: grunt.config('proxy-https'),
                    headers: proxyHeaders,
                },
            ],
            /**
             * DYNAMIC PROXY SETTING:
             * We could use the below code to dynamically set our proxies based on what's
             * defined in our meshconf. However, that is less obvious and less readable so
             * I'm leaving it as declared above. If we start need a bunch of differnet proxies
             * then we should switch to using this dynamic method.
             */
            // proxies: _.chain(grunt.config('meshconf').bundles)
            //     .map(function(bundle) {return bundle;})
            //     .uniq()
            //     .map(function(proxy) {
            //         return {
            //             context: proxy.toString(),
            //             host: grunt.config('proxy-host'),
            //             port: grunt.config('proxy-port'),
            //             https: grunt.config('proxy-https'),
            //             headers: proxyHeaders,
            //         };
            //     })
            //     .value(),
        },
    };
};
