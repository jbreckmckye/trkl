(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define("trkl", [], factory);
    } else {
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

		self.map = function (transform) {
			return trkl.computed(function() {
				return transform(self());
			});
		};

		self.history = function (limit) {
			var changes = trkl([value]);

			subscribe(function (newValue) {
				var changesRaw = copy(changes());
				changesRaw.push(newValue);
				if (limit) {
					changesRaw = changesRaw.slice(-limit)
				}
				changes(changesRaw);
			});

			return changes;
		};

		function write (newValue) {
			var oldValue = value;		
			value = newValue;
			if (oldValue !== newValue) {
				subscribers.forEach(function (subscriber) {
					subscriber(value, oldValue);
				});
			}
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