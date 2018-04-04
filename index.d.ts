export as namespace trkl;

export = trkl;

declare function trkl<T>(seed?: T): trkl.Observable<T>;

declare namespace trkl {
    export function computed<T>(executor: Computation<T>): trkl.Observable<T>;

    export function from(executor: Writer): trkl.Observable<any>;

    interface Observable<T> {
        (newValue: T): void; // write
        (): T; // read

        subscribe: AddSubscriber<T>;
        unsubscribe: RemoveSubscriber;
    }

    interface Subscriber<T> {
        (latest: T, last?: T): any | void;
    }

    interface AddSubscriber<T> {
        (subscriber: Subscriber<T>, runImmediate?: boolean): void;
    }

    interface RemoveSubscriber {
        (subscriber: Subscriber<any>): void;
    }

    interface Computation<T> {
        (): T;
    }

    interface Writer {
        (observable: trkl.Observable<any>): void;
    }
}