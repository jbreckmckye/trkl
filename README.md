# trkl
Reactive JavaScript programming in 400 bytes.

For just a meagre **401 bytes** (minified and gzipped), you get

- observables with a pub/sub interface
- powerful Knockout.js-style computeds with proper "magical" dependency tracking
- circular reference detection

The basic idea is to provide the most 'bang for buck' in terms of bytes down the wire versus expressiveness and utility.

My motto is: "If you can find a smaller reactive programming microlibrary... keep it to yourself"

## Give me the gist

```javascript
const appleCount = trkl(5);
const bananaCount = trkl(4);

appleCount.subscribe(val => console.log(val, 'apples remaining');

appleCount(6); // prints, '6 apples remaining'

const fruitCount = trkl.computed(()=> {
  return appleCount() + bananaCount();
});

fruitCount.subscribe(val => console.log(val, 'fruit remaining');

bananaCount(3); // prints, '9 fruit remaining'
```

## Installation

You can either drop `trkl.min.js` straight into your project, or run

    npm install trkl --save

Trkl works in both CommonJS and AMD environments, but it can also create a simple `window.trkl` object otherwise.

## API

### trkl()
Creates an observable with optional supplied initial value.

    let observable = trkl('foo');

### observable()

Call without arguments to get the value, call with an argument to set it.

    observable();       // getter
    observable('foo');  // setter

### trkl.computed(fn)

Creates an observable that executes a function which calls other observables, and re-runs that function whenever those dependencies change.

If you've used Knockout computeds, you'll know exactly how these work. Here's an example:

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

You don't have to provide anything to computed to notify if it of your dependencies. This differs from other libraries, where you have to remember to explicitly pass in all the observables your computation depends on.

Dependencies can even be dynamic!

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
    

The computed `c` starts with a dependency on `bool` and `a`. When `bool` changes, we re-run the function and capture a dependency on `b`.

**What about circular references?**

If we have an observable *a* that informs an computed *b*, and then we have a new computed *c* that takes the value of *b* and inserts it into *a*, we get a triangular flow of information.

Luckily, trkl will detect such instances and immediately throw an exception:

    Circular reference detected


### observable.subscribe(fn)

When an observable is updated, pass its new and old values to the supplied subscriber.

    let numbers = trkl(1);
        numbers.subscribe((newVal, oldVal) => {
            console.log('The observable was changed from', oldVal, 'to', newVal);
        });

    numbers(2);
    // console outputs 'The observable was changed from 1 to 2'

Passing a subscriber multiple times does not cause it to fire multiple times on update.

### observable.unsubscribe(fn)

Remove the specified function as a subscriber.
