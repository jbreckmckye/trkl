(function (root, factory) {
    if (define && define.amd) {
        // AMD. Register as an anonymous module
        define([], factory);
    } else if (module && module.exports) {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like environments that support module.exports,
        // like Node
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root["trkl"] = factory();
    }
}(this, function() {
    let runningComputed = null;
    let staledItems = [];

    let trkl = function(init) {
        let observable = new DataNode(init);
        let self = function() {
            return arguments.length ? observable.write(arguments[0]) : observable.read();
        };
        self.subscribe = observable.sub.bind(observable);
        self.unsubscribe = observable.unsub.bind(observable);
        return self;
    };

    trkl['computed'] = function(executor) {
        let observable = new DataNode(0, executor);
        let self = observable.read.bind(observable);
        self.subscribe = observable.sub.bind(observable);
        self.unsubscribe = observable.unsub.bind(observable);
        return self;
    };

    trkl['from'] = function(executor) {
        let observable = trkl();
        executor(observable);
        return observable;
    };

    function DataNode(val, computed) {
        this._computed = computed;
        computed && this._runComputed();

        this._value = computed ? this._value : val;
        //this._rollbackVal;
        this._lastVal = this._value;
        this._staleness = 0;
        this._staledItemsPosition = -1;

        this._children = [];
        this._subscribers = [];
    }

    // By overwriting the prototype with a local var, we can cut down the minified size
    let DataNode_prototype = {};
    DataNode.prototype = DataNode_prototype;

    DataNode_prototype.sub = function(func, immediate) {
        if (this._subscribers.indexOf(func) == -1) this._subscribers.push(func);
        if (immediate) func(this._value, this.lastVal);
    };

    DataNode_prototype.unsub = function(func) {
        let pos = this._subscribers.indexOf(func);
        if (pos > -1) this._subscribers.splice(pos, 1);
    };

    DataNode_prototype.read = function() {
        if (runningComputed && this._children.indexOf(runningComputed) == -1) {
            // We have a new child node
            this._children.push(runningComputed);
            // The child may have missed our own staleness message, so pass it individually if needs be
            if (this._staleness) runningComputed.setStale();
        }
        return this._value;
    };

    DataNode_prototype._runComputed = function() {
        runningComputed = this;

        this._rollbackVal = this._value;

        let error;
        try {
            this._value = this._computed();
        } catch (e) {
            error = e;
        }

        runningComputed = null;

        if (error) {
            this.onError();
            throw error;
        } else {
            this._lastVal = this._rollbackVal;
        }
    };

    DataNode_prototype.onError = function() {
        this._value = this._rollbackVal;
        this._staleness = 0;
        this._children && this._children.forEach(child => child.onError());
    };

    DataNode.validate = function() {
        let unreconciled;
        for (let i = 0; i < staledItems.length; i++) {
            if (staledItems[i] !== null) {
                unreconciled = staledItems[i];
                break;
            }
        }
        staledItems.length = 0;
        if (unreconciled) DataNode.foundCircular(unreconciled);
    };

    DataNode.foundCircular = function(unreconciled) {
        throw new Error('Circular dependency detected. Trkl has stopped. Suspicious function is: ' + unreconciled._computed.toString());
    };

    DataNode_prototype.write = function(next) {
        // This is what will dispatch the whole update chain

        // Prepare for errors
        this._rollbackVal = this._value;

        // Staleness will propagate downwards. Every Node will emit a stale broadcast the first time it becomes stale.
        // Children count the number of stale notifications vs the number of ready notifications.
        // When a Node returns to an unstale state, it will emit a readiness broadcast.
        this._broadcastStale();

        // Update root value...
        this._value = next;

        // Propagate change downwards
        // This can trigger computeds, which may throw errors, so listen for exceptions
        try {
            this._broadcastReady();
        } catch (e) {
            this.onError();
            throw e;
        }

        // Once all the operations are done, check that everything is reconciled. May throw.
        DataNode.validate();

        // If it's all good, run the side effects
        this._runSubscribers();

        // Writes should return the value, for the sake of 'a = b = c'-style assignments.
        return this._value;
    };

    DataNode_prototype.setStale = function() {
        this._staleness++;
        if (this._staleness == 1) {
            // just became stale
            // It's very important that we only broadcast our staleness to the world once
            this._children.forEach(child => child.setStale());
            this._registerStaled();
        }
    };

    DataNode_prototype._registerStaled = function() {
        // This is used for the validation check at the end of each write
        this._staledItemsPosition = staledItems.length;
        staledItems[this._staledItemsPosition] = this;
    };

    DataNode_prototype._unregisterStaled = function() {
        staledItems[this._staledItemsPosition] = null;
        this._staledItemsPosition = -1;
    };

    DataNode_prototype.setReady = function() {
        // If we're about to become unstale, run the computed now to discover any more dynamic dependencies
        if (this._staleness == 1 && this._computed) {
            this._runComputed();
        }

        this._staleness--;

        if (this._staleness == 0) {
            // We have become unstale
            // As with the staleness message, it's very important we only dispatch a ready message we completely trust
            this._unregisterStaled();
            this._broadcastReady();
            this._runSubscribers();
        }
    };

    DataNode_prototype._broadcastReady = function() {
        for (let i = 0; i < this._children.length; i++) {
            this._children[i].setReady();
        }
    };

    DataNode_prototype._broadcastStale = function() {
        for (let i = 0; i < this._children.length; i++) {
            this._children[i].setStale();
        }
    };

    DataNode_prototype._runSubscribers = function() {
        if (!this._subscribers.length) return;

        for (let i = 0; i < this._subscribers.length; i++) {
            this._runSubscriber(this._subscribers[i]);
        }
    };

    DataNode_prototype._runSubscriber = function(func) {
        let error;
        try {
            func(this._value, this._lastVal);
        } catch (e) {
            error = e;
        }
        if (error) window.setTimeout(()=> {throw error;}, 0);
    };

    return trkl;
}));
