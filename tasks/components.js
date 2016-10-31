module.exports = function(grunt) {
    'use strict';

    // gets all component and sets it in `grunt.option`
    grunt.registerTask('components', function() {
        var isComponent = function (pkg) {
                // pkg == package.json
                pkg = pkg || {};
                return !!((pkg.csi || {}).name || null);
            },
            allComponents = function() {
                var components = [];
                grunt.file.expand([
                    'node_modules/*'
                ]).filter(function(path) {
                    var pkg;
                    try {
                        pkg = grunt.file.readJSON(path + '/package.json');
                        if (isComponent(pkg)) {
                            components.push({
                                name: pkg.csi.name,
                                path: path,
                                sourceDirectory: pkg.csi.sourceDirectory || 'src',
                                csi: pkg.csi,
                            });
                        }
                    } catch(e) {
                        console.error(e);
                    }
                });
                return components;
            },
            components = allComponents();

        grunt.option('components', components);
        // console.log(components);
        return components;
    });
};
