(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root['trkl'] = factory();
    }
}(this, function() {
    var computedTracker = [];

    function trkl(initValue) {
        var value = initValue;
        var subscribers = [];
    
        var self = function (writeValue) {
            if (arguments.length) {
                write(writeValue);
            } else {
                return read();
            }
        };

        // Using string keys tells the Google Closure compiler that we intend to export these symbols
        self['subscribe'] = subscribe;
    
        // declaring as a private function means the minifier can scrub its name on internal references
        function subscribe(subscriber, immediate) {
            if (absent(subscribers, subscriber)) {
                subscribers.push(subscriber);
            }
            if (immediate) {
                subscriber(value);
            }
        }
    
        self['unsubscribe'] = function (subscriber) {
            remove(subscribers, subscriber);
        };
    
        function write (newValue) {
            var oldValue = value;       
            value = newValue;
            subscribers.slice().forEach(function (subscriber) {
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

    trkl['computed'] = function (fn) {
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

    trkl['from'] = function (executor) {
        var self = trkl();
        executor(self);
        return self;
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
    
    return trkl;
}));
