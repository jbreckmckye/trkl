# trkl
Reactive JavaScript programming in less than half a kilobyte.

For just a meagre **403 bytes** (minified and gzipped), you get

- observables with a pub/sub interface
- powerful Knockout.js-style computeds with proper "magical" dependency tracking
- circular reference detection

The basic idea is to provide the most 'bang for buck' in terms of bytes down the wire versus expressiveness and utility.

My motto is: "If you can find a smaller reactive programming microlibrary... keep it to yourself"

## Give me the gist

```javascript
/**
* Pub-sub
*/
const oranges = trkl(4);

oranges.subscribe(_ => console.log('We have', _, 'oranges'));

oranges(5); // Console logs, "We have 5 oranges"

/**
* Computeds
*/

const apples = trkl(2);
const bananas = trkl(5);

trkl.computed(()=> {
    const totalFruit = apples() + bananas();
    console.log('We have', totalFruit, 'fruit');
});
// Console logs, "We have 7 fruit"

apples(4); // Console logs, "We have 9 fruit"
```

## Installation

You can either drop `trkl.min.js` straight into your project, or run

```
npm install trkl --save
```    

Trkl works in both CommonJS and browser environments. If you need AMD support, use v1.5.1

## API

### trkl()
Creates an observable with optional supplied initial value.

```javascript
let observable = trkl('foo');
```    

### observable()

Call without arguments to get the value, call with an argument to set it.

```javascript
observable();       // getter
observable('foo');  // setter
```

### trkl.computed(fn)

Creates an observable that executes a function which calls other observables, and re-runs that function whenever those dependencies change.

If you've used Knockout computeds, you'll know exactly how these work. Here's an example:

```javascript
let a = trkl(0);
let b = trkl(0);

let c = trkl.computed(()=> {
    return a() + b();
});

c.subscribe(newVal => {
    console.log("c's value is now ", newVal);
});

a(5); // Console => "c's value is now 5"
b(3); // Console => "c's value is now 8"
```

You don't have to provide anything to computed to notify if it of your dependencies. This differs from other libraries, where you have to remember to explicitly pass in all the observables your computation depends on.

Dependencies can even be dynamic!

```javascript
let a = trkl(1);
let b = trkl(2);
let bool = trkl(true);

const c = trkl.computed(()=> {
    if (bool()) {
        console.log('A is', a());
    } else {
        console.log('B is', b());
    }
});

// Console log -> "A is 1"
a(3);
// Console log -> "A is 3"
bool(false);
// Console log -> "B is 2"
b(4);
// Console log -> "B is 4"
bool(true);
// Console log -> "A is 3"
```

The computed `c` starts with a dependency on `bool` and `a`. When `bool` changes, we re-run the function and capture a dependency on `b`.

**What about circular references?**

If we have an observable *a* that informs an computed *b*, and then we have a new computed *c* that takes the value of *b* and inserts it into *a*, we get a triangular flow of information.

Luckily, trkl will detect such instances and immediately throw an exception:

```
Circular reference detected
```

### trkl.from(observable => {...})

Create an observable, and pass it to your supplied function. That function may then set up event handlers to change the observable's state.

For instance, to create an observable that tracks the x/y coordinates of user clicks:

```javascript
const clicks = trkl.from(observable => {
    window.addEventListener('click', e => {
        const coordinates = {x: e.clientX, y: e.clientY};
        observable(coordinates);
    });
});

clicks.subscribe(coordinates => console.log(coordinates));
```

Every time the user clicks, clicks is updated with the latest coordinates.


### observable.subscribe(fn, ?immediate)

When an observable is updated, pass its new and old values to the supplied subscriber.

```javascript
let numbers = trkl(1);
numbers.subscribe((newVal, oldVal) => {
    console.log('The observable was changed from', oldVal, 'to', newVal);
});

numbers(2); // console outputs 'The observable was changed from 1 to 2'
```    

If you pass the same subscriber multiple times, it will be de-duplicated, and only run once. 

If you pass a truthy value to `immediate`, the subscriber will also run immediately.

A subscription can mutate the observable's subscriber list (e.g. a subscriber can remove itself), but the mutation won't take effect until the next time the observer changes.

### observable.unsubscribe(fn)

Remove the specified function as a subscriber.
