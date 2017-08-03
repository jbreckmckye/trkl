var computedTracker = [];

// We will need to copy subscriptions here during writes, so that subscriptions can edit their original subscription lists
// safely. This is necessary for subscriptions that remove themselves.
var effects = [];

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

    // Using string keys tells Uglify that we intend to export these symbols
    self['subscribe'] = subscribe;

    // declaring as a private function means the minifier can scrub its name on internal references
    function subscribe(subscriber, immediate) {
        if (!~subscribers.indexOf(subscriber)) {
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

        if (newValue === oldValue && (newValue === null || typeof newValue !== 'object')) {
            return; // bail out
        }

        value = newValue;
        effects.push.apply(effects, subscribers);

        // We will now rewind through as many effects as we have subscribers
        // We don't recheck the length during the loop, as subscribers may be mutated
        // (e.g. when a subscribers unsubs itself)
        var subCount = subscribers.length;
        for (var i = 0; i < subCount; i++) {
            // If a sub throws an error, the effects array will just keep growing and growing.
            // It won't stop operating properly, but it might eat memory. We're okay with this, I guess?
            effects.pop()(value, oldValue);
        }
    }

    function read () {
        var runningComputation = computedTracker[computedTracker.length - 1];
        if (runningComputation) {
            subscribe(runningComputation._subscriber);
        }
        return value;
    }

    return self;
}

trkl['computed'] = function (fn) {
    var self = trkl();
    var computationToken = {
        _subscriber : runComputed
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

function remove(array, item) {
    var position = array.indexOf(item);
    if (position !== -1) {
        array.splice(position, 1);
    }
}

if (typeof module === 'object') {
    module.exports = trkl;
} else {
    window['trkl'] = trkl;
}