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

describe('Computed de-duplication', ()=> {

	it('in a diamond tree (A =-> B C ; B C -> D), D only gets run once when A updates', ()=> {
		//     A
		//   /   \
		//  B     C
		//   \   /
		//     D
		const a = trkl(1);
		const b = trkl.computed(()=> a() + 1);
		const c = trkl.computed(()=> a() + 1);

		let d_run_count = 0;
		const d = trkl.computed(()=> {
			d_run_count++;
			return b() + c();
		});

		expect(d_run_count).toBe(1); // initial run
		a(3);
		expect(d_run_count).toBe(2); // run again once, despite two dependencies changing
	});

	it('if a node adds a dynamic dependency, it still only runs once if that dependency is already ready', ()=> {
        //     A
        //   /   \
        //  B     C
        //   \   /
        //     D
        const a = trkl(1);
        const b = trkl.computed(()=> a() + 1);
        const c = trkl.computed(()=> a() + 2);

        let d_run_count = 0;
        const d = trkl.computed(()=> {
            d_run_count++;
            return a() < 10 ? b() : c(); // initial deps: A, B
        });

        expect(d_run_count).toBe(1); // initial run
		a(20);
		expect(d_run_count).toBe(2); // by the time d is run, b and c have been finalized, so d need only run once
	});

	it('if a node adds a dynamic dependency, may run twice if that dependency is not ready', ()=> {
        //   A
        //   | \
		//   |  B
		//   | /
		//   C
        const a = trkl(1);

        let c_run_count = 0;
        const c = trkl.computed(()=> {
        	c_run_count++;
        	return a() < 10 ? a() : b(); // initial deps: A
		});

        const b = trkl.computed(()=> a() + 1);

        expect(c_run_count).toBe(1); // initial run
		a(20);
		// C and B will update, in that order, but B won't be ready when C runs
		// Therefore C will _have_ to run twice
		expect(c_run_count).toBe(3);
	})

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
