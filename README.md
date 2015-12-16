# trkl
Reactive JavaScript programming in under 500 bytes (gzipped)

Very hastily written. Don't take it too seriously.

**Sixty-second documentation:**

    // OBSERVABLES
    
    var foo = trkl();
    
    foo(1); // setter
    foo();  // getter
    
    foo.subscribe((newValue, oldValue) => {
        console.log('Foo was changed from', oldValue, 'to', newValue);
    });
    
    foo(2);
    // Console outputs 'Foo was changed from 1 to 2'
    
    var bar = trkl(7); // initialize with value
    
    // COMPUTEDS
    
    var addition = trkl.computed(() => {
      var sum = foo() + bar();
      console.log('Sum equals', sum);
    });
    // Console outputs 'Sum equals 9'
    
    bar(8);
    // Console outputs 'Sum equals 10'
    
    foo(100);
    // Console outputs 'Sum equals 108';
    
    addition.destroy();
    
    foo(0);
    bar(0);
    // Console outputs nothing
    
    // REDUCTIONS
    
    var trackMutations = trkl.reduce(foo, (accumulator, newValue)=> {
      return accumulator.concat([newValue]);
    }, []); // last arg is initial value of 'accumulator'
    
    foo(6);
    trackMutations(); // [6]
    foo(8);
    trackMutations(); // [6, 8]
    
    // FILTER
    
    var oddFoos = trkl.filter(foo, (newValue, oldValue)=> {
        return newValue % 2 !== 1;
    });
    
    trackMutations.subscribe(newValue => {
        console.log(newValue);
    });
    
    foo(5);
    // console outputs '5'
    foo(6);
    foo(3);
    // console outputs '3'
