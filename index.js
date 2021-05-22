var instance_skel = require('../../instance_skel');
var debug;
var log;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions

	// Example: When this script was committed, a fix needed to be made
	// this will only be run if you had an instance of an older "version" before.
	// "version" is calculated out from how many upgradescripts your intance config has run.
	// So just add a addUpgradeScript when you commit a breaking change to the config, that fixes
	// the config.

	self.addUpgradeScript(function () {
		// just an example
		if (self.config.host !== undefined) {
			self.config.old_host = self.config.host;
		}
	});

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;

	self.config = config;
};
instance.prototype.init = function() {
	var self = this;

	self.status(self.STATE_OK);

	debug = self.debug;
	log = self.log;
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			width: 4,
			default: 9009,
			regex: self.REGEX_PORT
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;
	debug('destroy');
};

instance.prototype.actions = function(system) {
	var self = this;
	self.system.emit('instance_actions', self.id, {
		'gonext': {
			label: 'Next Subtitle',
			options: []
		},
		'goprevious': {
			label: 'Previous Subtitle',
			options: []
		},
		'goblacknext': {
			label: 'Go to Black Then Next Subtitle',
			options: []
		},
		'goto': {
			label: 'Go to specified Subtitl ',
			options: [
				{
					 type: 'textinput',
					 label: 'Value',
					 id: 'float',
					 default: 1,
					 regex: self.REGEX_SIGNED_FLOAT
				}
			]
		},
	});
}

instance.prototype.action = function(action) {
	var self = this;

	var args = null;

	debug('action: ', action);

	switch(action.action) {
		case 'gonext':
			oscPath = '/goNext';
			args = [];
			break;
		case 'goprevious':
			oscPath = '/goPrevious';
			args = [];
			break;
		case 'goblacknext':
			oscPath = '/goBlackAndNext';
			args = [];
			break;
		case 'goto':
			oscPath = '/goTo '
			args = [{
				type: 'f',
				value: parseFloat(action.options.float)
			}];
			break;
		default:
			break;
	}

	if (args !== null) {
		debug('Sending OSC',self.config.host, self.config.port, action.options.path);
		console.log('sending osc');
		console.log(args);
		self.system.emit('osc_send', self.config.host, self.config.port, action.options.path, args);
	}


};

instance_skel.extendedBy(instance);
exports = module.exports = instance;
