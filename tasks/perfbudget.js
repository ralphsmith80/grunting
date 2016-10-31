/**
    Options for running connect
*/
module.exports = function(grunt) {
	'use strict';
	var WPT_CONFIG = {
		'wptInstance': 'http://192.168.228.248/',
		'location': 'Ohio_wptdriver'
	};

	var taskTimeout = 300;
	var URL = [
		'logData   0',
		'navigate  192.168.225.191',
		'setActivityTimeout	1500',
		'setValue name=email superadmin',
		'setValue name=password admin',
		'clickAndWait name=log-in',
		'logData 1',
		'navigate 192.168.225.191'
	];
	return {
		daft: {
			options: {
				'timeout': taskTimeout,
				'url': URL.join('\n'),
				'wptInstance': WPT_CONFIG.wptInstance,
				'location': WPT_CONFIG.location
			}
		}
	}
};