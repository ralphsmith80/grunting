module.exports = function(grunt) {
    'use strict';

    var _       = require('lodash'),
        jsonOut = 'testResult.json',
        xmlOut  = 'testResult.xml',
        reporterTemplate = _.template(grunt.file.read('templates/reporter.mtpl')),
        ignore = function() {
            var components = grunt.option('components');

            // components don't include the running component so we add it
            components.push({
                name: grunt.config('pkg').csi.name,
                csi: grunt.config('pkg').csi,
            });
            var testIgnores = _.chain(components)
                .map(function(component) {
                    var testIgnore = component.csi.testIgnore;
                    return component.csi.testIgnore;
                })
                .compact()
                .flatten()
                .value();
            return testIgnores;
        },
        isIgnored = function(suite, test, ignores) {
            var ignore = _.any(ignores, function(ignore) {
                    return  RegExp(ignore.path).test(suite.name) &&
                            RegExp(ignore.module).test(test.module) &&
                            RegExp(ignore.test).test(test.name);
                });
            if (ignore) {
                grunt.log.writeln('ignoring:', test.name);
            }
            return ignore;
        },
        logger  = function() {
            // we will build an object that looks like this to hold the qunit results
            //     testsuites: [{
            //         tests: null,
            //         failures: null,
            //         errors: null,
            //         time: null,
            //         name: null,
            //         // loop testcases `test.start`, `test.done`
            //         testcases: [{
            //             name: null,
            //             status: null,
            //             classname: null,
            //             time: null,
            //             // loop failures
            //             failure: [{}],
            //             // loop errors
            //             error: [{}],
            //         }]
            //     }];

            var fs = require('fs'),
                urlParse = require('url').parse,
                reportTmpl = reporterTemplate,
                testIgnores = ignore(),
                testsuites = [],
                context = {
                    issues: function(type, testcases) {
                        return testcases.reduce(function(count, testcase) {
                            return count + (testcase[type]? (testcase[type].length>0) : 0);
                        }, 0);
                    },
                    snake: function(name) {
                        return name.replace(/ /g, '_');
                    },
                    camel: function(name) {
                        return name[0].toUpperCase() +
                            name.replace(/ ([a-zA-Z])/g, function($1, $2) {
                                return $2.toUpperCase().replace('-','');
                            }).slice(1);
                    },
                    clean: function(name) {
                        return name.replace(/[^a-zA-Z0-9._]/g, '');
                    },
                    classname: function(testsuiteName, module) {
                        var dots = testsuiteName.replace(/\//g, '.');
                        return dots + (module? '.' + context.camel(module) : '');
                    },
                    testsuites: testsuites
                };
            // grunt.event.on('qunit.begin', function () {});
            grunt.event.on('qunit.spawn', function (url) {
                testsuites.push({
                    name: urlParse(url).pathname.replace(/^\//g, ''),
                    modules: [],
                    testcases: [],
                });
            });
            grunt.event.on('qunit.moduleStart', function (name) {
                _.last(testsuites).modules.push({
                    name: name,
                });
            });
            grunt.event.on('qunit.testStart', function (name) {
                var testSuite = _.last(testsuites),
                    module = _.last(testSuite.modules) || {};
                _.last(testsuites).testcases.push({
                    name: name,
                    failures: [],
                    errors: [],
                    module: module.name || 'n/a',
                });
            });
            grunt.event.on('qunit.testDone', function (name, failed, passed, total, runtime) {
                var testSuite = _.last(testsuites),
                    testCase = _.last(testSuite.testcases);
                testCase.failed = failed;
                testCase.passed = passed;
                testCase.assertions = total;
                testCase.duration = runtime;

                // remove last test case so it won't be reported in the log
                if (isIgnored(testSuite, testCase, testIgnores)) {
                    testSuite.testcases.pop();
                }
            });
            grunt.event.on('qunit.moduleDone', function (name, failed, passed, total) {
                var testSuite = _.last(testsuites),
                    module = _.last(testSuite.modules);
                module.failed = failed;
                module.passed = passed;
                module.assertions = total;
            });
            grunt.event.on('qunit.log', function (result, actual, expected, message, source) {
                var testSuite = _.last(testsuites),
                    testCase = _.last(testSuite.testcases);
                testCase.status = result;
                if (!result) {
                    testCase.failures.push({
                        message: message,
                        actual: actual,
                        expected: expected
                    });
                }
            });
            grunt.event.on('qunit.fail.load', function (url) {
                _.last(testsuites).testcases.push({
                    failures: [{
                        message: 'Failed to load ' + url
                    }],
                    errors: []
                });
            });
            grunt.event.on('qunit.fail.timeout', function () {
                var testSuite = _.last(testsuites),
                    testCase = _.last(testSuite.testcases);
                testCase.errors.push({message: 'timeout\n' + arguments.toString()});
            });
            grunt.event.on('qunit.error.onError', function (message, stacktrace) {
                var testSuite = _.last(testsuites),
                    testCase = _.last(testSuite.testcases);
                testCase.errors.push({message: message});
            });
            grunt.event.on('qunit.done', function (failed, passed, total, runtime) {
                var testSuite = _.last(testsuites);
                // console.log('#####qunit done', testSuite.name);
                testSuite.failures = failed;
                testSuite.passed = passed;
                testSuite.total = total;
                testSuite.duration = runtime;
                fs.writeFileSync(jsonOut, JSON.stringify(testsuites, null, '  '));
                if (reportTmpl) {
                    fs.writeFileSync(xmlOut, reportTmpl(context));
                } else {
                    console.warn('no template to write xml output');
                }
            });
        };

    grunt.registerTask('qunit_logger', 'Log Qunit tests test results', function() {
        grunt.task.requires('components');
        console.log('started qunit logging');
        logger();
    });
};
