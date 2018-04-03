export as namespace trkl;

export = trkl;

declare interface TrklObservable<T> {
    (newValue: T): void; // write
    (): T; // read

    subscribe: AddSubscriber<T>;
    unsubscribe: RemoveSubscriber;
}

declare interface Subscriber<T> {
    (latest: T, last?: T): any | void;
}

declare interface AddSubscriber<T> {
    (subscriber: Subscriber<T>, runImmediate?: boolean): void;
}

declare interface RemoveSubscriber {
    (subscriber: Subscriber<any>): void;
}

declare interface Computation<T> {
    (): T;
}

declare interface Writer {
    (observable: TrklObservable<any>): void;
}

declare function trkl<T>(seed?: T): TrklObservable<T>;

declare namespace trkl {
    export function computed<T>(executor: Computation<T>): TrklObservable<T>;

    export function from(executor: Writer): TrklObservable<any>;
}