// Computations are a tuple of: [ subscriber ]
var computedTracker = [];

function trkl(value) {
    var subscribers = [];

    var self = function (...args) {
        return args.length
            ? write(args[0])
            : read();
    };

    // declaring as a private function means the minifier can scrub its name on internal references
    var subscribe = (subscriber, immediate) => {
        if (!~subscribers.indexOf(subscriber)) {
            subscribers.push(subscriber);
        }
        if (immediate) {
            subscriber(value);
        }
    }

    // Using string keys tells Uglify that we intend to export these symbols
    self['subscribe'] = subscribe;

    self['unsubscribe'] = subscriber => {
        remove(subscribers, subscriber);
    };

    function write (newValue) {
        if (newValue === value && (value === null || typeof value !== 'object')) {
            return;
        }

        var oldValue = value;
        value = newValue;

        for (let i = subscribers.length - 1; i > -1; i--) {
            // Errors will just terminate the effects
            subscribers[i](value, oldValue);
        }
    }

    function read () {
        var runningComputation = computedTracker[computedTracker.length - 1];
        if (runningComputation) {
            subscribe(runningComputation);
        }
        return value;
    }

    return self;
}

trkl['computed'] = fn => {
    var self = trkl();

    function computation() {
        detectCircularity(computation);
        computedTracker.push(computation);
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

    computation();
    return self;
};

trkl['from'] = executor => {
    var self = trkl();
    executor(self);
    return self;
};

function detectCircularity(token) {
    if (computedTracker.indexOf(token) > -1) {
        throw Error('Circular computation');
    }
}

function remove(array, item) {
    var position = array.indexOf(item);
    if (position > -1) {
        array.splice(position, 1);
    }
}

if (typeof module === 'object') {
    module.exports = trkl;
} else {
    window['trkl'] = trkl;
}