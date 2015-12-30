'use strict';
let trkl = window.trkl;

describe('trkl observables', ()=> {

	it('Provides an accessor that may be used as a getter or setter', ()=> {
		const value = {};
		const accessor = trkl();
		accessor(value);
		expect(accessor()).toBe(value);
	});

	it('Can be initialized with a value', ()=> {
		const value = {};
		const accessor = trkl(value);
		expect(accessor()).toBe(value);
	});

	it('Can be subscribed to', ()=> {
		const oldValue = {};
		const newValue = {};
		const listener = jasmine.createSpy('listener');
		const observable = trkl(oldValue);
		
		observable.subscribe(listener);
		observable(newValue);

		expect(listener).toHaveBeenCalledWith(newValue, oldValue);
	});

	it('Can be unsubscribed from', ()=> {
		const observable = trkl();
		const listener = jasmine.createSpy('listener');

		observable.subscribe(listener);
		observable.unsubscribe(listener);

		observable(123);
		expect(listener).not.toHaveBeenCalled();
	});
});

describe('A computed', ()=> {

	it('Starts at the initial result of the computation', ()=> {
		const a = trkl(1);
		const b = trkl(2);
		const c = trkl.computed(()=> {
			return a() + b();
		});
		expect(c()).toBe(3);
	});

	it('Updates when its dependencies change', ()=> {
		const a = trkl(1);
		const b = trkl(2);
		const c = trkl.computed(()=> {
			return a() + b();
		});

		a(5);
		b(5);

		expect(c()).toBe(10);
	});

	it('Can handle dynamic dependencies', ()=> {
		const a = trkl(1);
		const b = trkl(2);
		const relay = trkl();

		const computation = trkl.computed(()=> {
			if (relay()) {
				return a();
			} else {
				return b();
			}
		});

		relay(true);
		expect(computation()).toBe(1);

		relay(false);
		expect(computation()).toBe(2);
	})

	it('Does not allow circular references', ()=> {
		const a = trkl(1);
		const b = trkl.computed(()=> {
			return a() + 1;
		});
		const attachCircular = ()=> {
			trkl.computed(()=> {
				a(b() + 1);
			})
		};

		expect(attachCircular).toThrow(Error('Circular computation detected'));
	});
});

describe('A map', ()=> {

	it('Transforms an observable', ()=> {
		const numbers = trkl(1);
		const numbersDoubled = numbers.map(x => {
			return x*2;
		});

		expect(numbersDoubled()).toBe(2);
	});

	it('Transforms updates', ()=> {
		const numbers = trkl(1);
		const numbersDoubled = numbers.map(x => {
			return x*2;
		});

		numbers(5);

		expect(numbersDoubled()).toBe(10);
	});
});

describe('Observable history', ()=> {
	let numbers, values;

	beforeEach(()=> {
		numbers = trkl(1);
		values = numbers.history();
	});

	it('Creates an array', ()=> {
		expect(values()).toEqual(jasmine.any(Array));
	});

	it('Starts the array with the current value', ()=> {
		expect(values()).toEqual([1]);
	});

	it('Collects mutations to the observable', ()=> {
		numbers(2); numbers(3);

		expect(values()).toEqual([1, 2, 3]);
	});

	it('Does not capture non-changing writes', ()=> {
		numbers(2);
		numbers(2);
		numbers(2);

		expect(values()).toEqual([1, 2]);
	});

	it('Can be limited', ()=> {
		const lastThreeValues = numbers.history(3);
		numbers(1); numbers(2); numbers(3); numbers(4);

		expect(lastThreeValues()).toEqual([2,3,4]);
	});

	it('Can be subscribed to', done => {
		values.subscribe(done);
		numbers(2);
	});

	it('Subscriptions are passed full history', done => {
		values.subscribe(history => {
			expect(history).toEqual([1, 2]);
			done();
		});
		numbers(2);
	});
});