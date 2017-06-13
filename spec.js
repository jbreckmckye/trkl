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
		const value = {};
		const observable = trkl(value);
		const listener = jasmine.createSpy('listener');

		observable.subscribe(listener, true);

		expect(listener).toHaveBeenCalledWith(value);
	});

	it('Can be unsubscribed from', ()=> {
		const observable = trkl();
		const listener = jasmine.createSpy('listener');

		observable.subscribe(listener);
		observable.unsubscribe(listener);

		observable(123);
		expect(listener).not.toHaveBeenCalled();
	});

	it('Subscribers can remove themselves without disrupting others', ()=> {
		const observable = trkl();
		const listener1 = jasmine.createSpy('listener 1').and.callFake(()=> {
			observable.unsubscribe(listener1);
		});
		const listener2 = jasmine.createSpy('listener 2');

		observable.subscribe(listener1);
		observable.subscribe(listener2);

		observable(123);
		expect(listener1).toHaveBeenCalled();
		expect(listener2).toHaveBeenCalled();


		observable(456);
		expect(listener1).toHaveBeenCalledTimes(1);
		expect(listener2).toHaveBeenCalledTimes(2);
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
