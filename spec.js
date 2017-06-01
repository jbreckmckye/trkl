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

	it('A subscriber can be run immediately', ()=> {
		const val1 = {};
		const val2 = {};

		const observable = trkl(val1);
		observable(val2);

		const listener = jasmine.createSpy('listener');

		observable.subscribe(listener, true);

		expect(listener).toHaveBeenCalledWith(val1, val2);
	});

	it('The initial lastVal is undefined', ()=> {
		const val1 = {};
		const observable = trkl(val1);

		const listener = jasmine.createSpy('listener');

		observable.subscribe(listener, true);
		expect(listener).toHaveBeenCalledWith(val1, undefined);
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
	});

	it('Does not allow circular references', ()=> {
		const root = trkl(1);

		const left = trkl.computed(()=> {
			if (root() < 2) {
				return root() * 2;
			} else {
				return right() * 2;
			}
		});

		const right = trkl.computed(()=> {
			return left() + 5;
		});

		const makeCircular = ()=> {
            root(3); // should trigger circularity
		};

		expect(makeCircular).toThrow();
	});

	it('Does not allow circular writes', ()=> {
		const root = trkl(1);

		const makeCircular = ()=> {
            trkl.computed(()=> {
                root( root() + 1);
            });
		};

		expect(makeCircular).toThrow();
	});
});

describe('trkl.from', ()=> {

	it('creates an observable', ()=> {
		const result = trkl.from(()=> {});
		expect(typeof result).toBe('function');
	});

	it('passes the observable to the executor', ()=> {
		const executor = jasmine.createSpy('executor');
		const observable = trkl.from(executor);
		expect(executor).toHaveBeenCalledWith(observable);
	});
});
