(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.trkl = factory();
	}
}(this, function() {
    var computedTracker = [];

	function trkl(initValue) {
		var value = initValue;
		var subscribers = [];

		var self = function (writeValue) {
			if (arguments.length > 0) {
				write(writeValue);
			} else {
				return read();
			}
		};

		self.subscribe = subscribe;

		// declaring as a private function means the minifier can scrub its name on internal references
		function subscribe(subscriber) {
			if (absent(subscribers, subscriber)) {
				subscribers.push(subscriber);
			}
		}

		self.unsubscribe = function (subscriber) {
			remove(subscribers, subscriber);
		};

		self.history = function (limit) {
			limit = limit || 10;
			var changes = trkl([value]);

			subscribe(function (newValue) {
				var changesRaw = copy(changes());
				changesRaw.push(newValue);
				changesRaw = changesRaw.slice(-limit);
				changes(changesRaw);
			});

			return changes;
		};

		function write (newValue) {
			var oldValue = value;		
			value = newValue;
			subscribers.forEach(function (subscriber) {
				subscriber(value, oldValue);
			});
		}

		function read () {
			var runningComputation = computedTracker[computedTracker.length - 1];
			if (runningComputation) {
				subscribe(runningComputation.subscriber);
			}
			return value;
		}

		return self;
	}

	trkl.computed = function (fn) {
		var self = trkl();
		var computationToken = {
			subscriber : runComputed
		};

		runComputed();
		return self;

		function runComputed() {
			detectCircularity(computationToken);
			computedTracker.push(computationToken);
			var errors, result;
			try {
				result = fn();
			} catch (e) {
				errors = e;
			}
			computedTracker.pop();
			if (errors) {
				throw errors;
			}
			self(result);
		}
	};

	function detectCircularity(token) {
		if (computedTracker.indexOf(token) !== -1) {
			throw Error('Circular computation detected');
		}
	}

	function absent(array, item) {
		return array.indexOf(item) === -1;
	}

	function remove(array, item) {
		var position = array.indexOf(item);
		if (position !== -1) {
			array.splice(position, 1);
		}	
	}

	function copy(array) {
		return array.slice(0);
	}

	return trkl;
}));