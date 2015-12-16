# trkl
Reactive JavaScript programming in under 500 bytes.

For just a meagre **425 bytes** (minified and gzipped), you get

- observables with a pub/sub interface
- Knockout.js-style computeds with proper "magical" dependency tracking
- maps
- reductions / scans
- circular reference detection

It's more of a proof of concept than anything else - but quite fun to write!

Project motto: "If you can find a smaller reactive programming microlibrary... keep it to yourself"

## API

### trkl()
Creates an observable with optional supplied initial value.

    let observable = trkl('foo');

### observable()

Call without arguments to get the value, call with an argument to set it.

    observable();       // getter
    observable('foo');  // setter

### observable.subscribe(fn)

When the observable is updated, pass its new and old values to the supplied subscriber.

    let numbers = trkl(1);
        numbers.subscribe((newVal, oldVal) => {
            console.log('The observable was changed from', oldVal, 'to', newVal);
        });

    numbers(2);
    // console outputs 'The observable was changed from 1 to 2'

Passing a subscriber multiple times does not cause it to fire multiple times on update.

### observable.unsubscribe(fn)

Remove the specified function as a subscriber.

### observable.map(fn)

Creates a new observable that transforms the original and all of its updates.

    let numbers = trkl(1);
    let doubles = numbers.map(x => {
        return x*2;
    });

    doubles(); // equals 2
    trkl(2);
    doubles(); // equals 4

### observable.scan(fn, accumulator)

Like `array.reduce`, but for a series of updates against an observable.

    let numbers = trkl();
    let sumChanges = numbers.scan((runningTotal, update) => {runningTotal + update}, 0);

    numbers(1);     // sumChanges = 1
    numbers(10);    // sumChanges = 11
    numbers(100);   // sumChanges = 111

Scan responds to updates only - not the initial value of the observable when the scan was attached.

### trkl.computed(fn)

Creates an observable that executes a function which calls other observables, and re-runs that function whenever those dependencies change.

If you've used Knockout computeds, you'll know exactly how these work. Here's an example:

    let a = trkl(1);
    let b = trkl(2);

    let c = trkl.computed(()=> {
        return a() + b();
    });

    c(); // equals 1 + 2 = 3

    a(3);
    c(); // equals 3 + 2 = 5

You don't have to provide anything to computed to notify if it of your dependencies. This differs from other libraries, where you have to remember to explicitly pass in all the observables your computation depends on (I'm looking at you, Flyd).

Dependencies can even be dynamic!

    let firstChoice = trkl('ice cream');
    let secondChoice = trkl('pecan pie');

    let preference = trkl.computed(()=> {
        if (firstChoice() !== '') {
            return 'I want ' + firstChoice();
        } else {
            return 'I want ' + secondChoice();
        }
    });

    preference(); // 'I want ice cream'

    firstChoice('');

    preference(); // 'I want pecan pie'

In this instance, the computed 'preference' starts with only a subscription to 'firstChoice'. When - and only when - firstChoice is blanked out, 'preference' gets a subscription to 'secondChoice', too. This is a really powerful feature in Knockout and it's quite cool to know we can make it happen with a microlibrary.

###What about circular references?

If we have an observable *a* that informs an computed *b*, and then we have a new computed *c* that takes the value of *b* and inserts it into *a*, we get a triangular flow of information.

Luckily, trkl will detect such instances and immediately throw an exception:

    Circular reference detected