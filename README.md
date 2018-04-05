# trkl
Reactive JavaScript programming in less than half a kilobyte.

For just a meagre **434 bytes** (minified and gzipped), you get

- observables with a pub/sub interface
- powerful Knockout.js-style computeds with proper "magical" dependency tracking
- circular reference detection
- (New!) TypeScript project support

The basic idea is to provide the most 'bang for buck' in terms of bytes down the wire versus expressiveness and utility.

My motto is: "If you can find a smaller reactive programming microlibrary... keep it to yourself"

## Give me the gist

The basic building block is the **Observable**. It's a data container you can subscribe to:

```javascript
const oranges = trkl(2);

print(oranges()); // Print "2"

oranges.subscribe(print);

oranges(3); // Print "3"
```

Pretty simple. But things get interesting when you combine observables using **computeds**:

```javascript
const oranges = trkl(2);
const lemons = trkl(2);

const fruit = trkl.computed(()=> oranges() + lemons());

print(fruit()); // Print "4"

fruit.subscribe(print);

lemons(3); // Print "5"
```

In a nutshell: Trkl lets you create observable channels of data, and then combine them with functions to result in further observables.

## Installation

You can either drop `trkl.min.js` straight into your project, or run

```
npm install trkl --save
```

Trkl works in both CommonJS and browser environments. If you need AMD support, use v1.5.1

### Importing

Node / SystemJS: `const trkl = require('trkl');`

ES6 / TypeScript: `import * as trkl from 'trkl';`

## TypeScript support

Types are defined in `index.d.ts`.

It's assumed that the types inside observables are immutable. If you need to initialise a type-less observable use `foo = trkl(undefined as any)`;

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
    print(`a + b = ${newVal}`);
});

a(5); // Print "a + b = 5"
b(3); // Print "a + b = 8"
```

You don't have to provide anything to computed to notify if it of your dependencies. This differs from other libraries, where you have to remember to explicitly pass in all the observables your computation depends on.

Dependencies can even be dynamic!

```javascript
const a = trkl('A');
const b = trkl('B');
const readA = trkl(true);

const reader = trkl.computed(()=> {
    return readA() ? a() : b();
});

print(reader()); // 'A'

readB(false);

print(reader()); // 'B'
```

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

When an observable's value changes, pass its new and old values to the supplied subscriber.

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

#### How updates are deduplicated

Note that Trkl will only filter out duplicate updates if the values are primitives, not objects or arrays. Why? Well, if you have two objects or arrays, you can only tell if their values have changed by recursively inspecting the whole tree of their properties. This would be expensive, and could lead us into circular inspections, so for performance and size reasons we don't bother.

If you really need to filter out duplicates, you could always do

```javascript
const filter = trkl.from(observer => {
  source.subscribe((newVal, oldVal) => {
    if (newVal.length && (newVal.length !== oldVal.length)) {
      observer(newVal);
    } else if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
      observer(newVal);
    }
  });
});
```

This will only work if your objects / arrays are JSON-serializable, though.

### observable.unsubscribe(fn)

Remove the specified function as a subscriber.

## Why 'trkl'?

Because it's like a stream, except smaller (a 'trickle'), except even smaller than that ('trkl').
