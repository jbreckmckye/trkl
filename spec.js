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
