module.exports = require('gruntfile')(function(grunt, parentCWD) {
    var _       = require('lodash'),
        join    = require('path').join,
        roleAppMap = {
            'appstack:data-user': {daft: '/'},
            'appstack:discovery-user': {diq: '/discoveryiq'},
            'appstack:policy-user': {piq: '/policyiq'},
            'appstack:admin-user': {glad: '/glad', daft: '/', diq: '/discoveryiq'},
            undefined: {glad: '/glad', daft: '/', diq: '/discoveryiq', piq: '/policyiq'},
        };

    require('time-grunt')(grunt);

    // ----------- Environment settings -----------------------
    //   set by calling grunt with option flags
    //   `grunt build|serve --env=production`
    grunt.config('env', grunt.option('env') || process.env.GRUNT_ENV || 'development');
    grunt.config('build_version', grunt.option('build_version') || '<%= app_config.version %>' || 'Unknown');
    grunt.config('roleAppMap', grunt.option('roleAppMap') || '<%= app_config.roleAppMap %>');
    grunt.config('templatePath', grunt.option('templatePath') || '<%= component %>/templates');
    grunt.config('host', grunt.option('host') || 'localhost');
    grunt.config('port', grunt.option('port') || 1335);
    grunt.config('proxy-host', grunt.option('proxy-host') || 'localhost');
    grunt.config('proxy-port', grunt.option('proxy-port') || 15080);
    grunt.config('proxy-https', grunt.option('proxy-https') || false);

    grunt.config('meshconf', grunt.file.readJSON('./config/meshconf.json'));

    // merge version into app_config
    // this is redundant if it's been set in the top level grunt file and not overridden
    if (grunt.config('app_config')) {
        grunt.config('app_config', _.extend(grunt.config('app_config'), {
            roleAppMap: grunt.config('roleAppMap') || roleAppMap,
            version: grunt.config('build_version'),
        }));
    }

    var baseUrl,
        urlArgs;
    switch (grunt.config('env')) {
        case 'production':
            baseUrl = '/<%= component %>';
            urlArgs = 'version=' + (new Date()).getTime();
            break;
        // local uwsgi env i.e. `butler serve`
        case 'uwsgi':
            baseUrl = '/static';
            break;
        default:
            baseUrl = '/';
    }
    // ----------- END - Environment settings -----------------

    var config = require('load-grunt-config')(grunt, {
        configPath: join(process.cwd(), 'tasks'),
        // init: false,
        // jitGrunt: true,
        jitGrunt: {
            // customTasksDir: join(process.cwd(), 'tasks'),
            staticMappings: {
                configureProxies: 'grunt-connect-proxy'
            }
        },
        // data: {},
        config: {
            baseUrl:        baseUrl,
            staticPath:     'static',
            componentDir:   'static/components/',
            outputs: {
                minified: {
                    css: 'index-'+(new Date()).getTime()+'.mini.css',
                    js: 'index.mini.js'
                }
            },
            // This is the running require config the build config is in the requirejs task
            requireConfig:  _.merge(_.clone(grunt.file.readJSON('./config/requirejs-config.json'), true), {
                baseUrl: '<%= baseUrl %>',
                // this will bust scripts we still need to bust the minified css
                urlArgs: urlArgs || undefined,
            }),
        }
    });

    grunt.registerTask('environment', function() {
        console.log(
            '\nEnvironment:', grunt.config('env'),
            '\nbaseUrl: ', grunt.config('baseUrl'),
            '\nstaticPath: ', grunt.config('staticPath'),
            '\ncomponenet: ', grunt.config('component'),
            '\ncomponenetDir: ', grunt.config('componentDir'),
            '\napp_conifg:', grunt.config('app_config'));
    });
    grunt.registerTask('print-matches', 'a debugging task for glob matches', function() {
        grunt.file.expand({
            expand: true,
            cwd: 'static/components',
        }, ['**/*.less']).forEach(function (file) {
            console.log(file);
        });
    });

    // Other tasks are defined in 'tasks/aliases.yaml' file
});
