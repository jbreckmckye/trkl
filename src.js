(function(){
	var computedTracker = [];

	function trkl(init) {
		return new Stream(init);
	}

	trkl.computed = function (read) {
		var dependencies = [];
		var stream = new Stream();
		var computedToken = {}; // unique pointer per computed
		computedToken.onStreamRead = notifyDependent;

		runComputed();

		return stream;	

		function runComputed() {
			detectCircularity(computedToken);
			computedTracker.push(computedToken);
			var errors, result;
			try {
				result = read();
			} catch (e) {
				errors = e;
			}
			computedTracker.pop();
			if (errors) {
				throw errors;
			}
			stream(result);
		}

		function notifyDependent(dependency) {
			if (absent(dependencies, dependency)) {
				dependency.subscribe(runComputed);
				dependencies.push(dependency);
			}
		}

		function destroy() {
			dependencies.forEach(function (dependency) {
				dependency.unsubscribe(runComputed);
			});
		}
	};

	trkl.merge = function(sources) {
		sources = Array.prototype.slice.call(arguments, 0);
		var mergedStream = new Stream();
		sources.forEach(function (source) {
			source.subscribe(mergedStream);
		});
		return mergedStream;
	};

	trkl.reduce = function(source, reducer, init) {
		var stream = new Stream();
		var init = init || source();
		source.subscribe(function (newValue) {
			stream(reducer(init, newValue));
		});
		return stream;
	}

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
		if (position) {
			array.splice(position, 1);
		}	
	}

	function Stream(init, writer) {
		var value = init;
		var subscribers = [];

		var stream = function (writeValue) {
			if (arguments.length > 0) {
				write(writeValue);
			} else {
				return read();
			}
		}

		stream.subscribe = function (subscriber) {
			if (absent(subscribers, subscriber)) {
				subscribers.push(subscriber);
			}
		};

		stream.unsubscribe = function (subscriber) {
			remove(subscribers, subscriber);
		};

		stream.map = function (mapper) {
			var mappedStream = new Stream();
			stream.subscribe(function (newValue) {
				mappedStream(mapper(newValue));
			});
			return mappedStream;
		}

		function write (newValue) {
			var oldValue = value;		
			value = newValue;
			var errors = [];
			if (oldValue !== newValue) {
				subscribers.forEach(function (subscriber) {
					subscriber(value, oldValue);
				});
			}
		};

		function read () {
			var runningComputation = computedTracker[computedTracker.length - 1];
			if (runningComputation) {
				runningComputation.onStreamRead(stream);
			}
			return value;
		};

		return stream;	
	}

	return trkl;
})();
