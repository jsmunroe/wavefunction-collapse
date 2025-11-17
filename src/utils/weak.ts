export class WeakHandler<TSource extends WeakKey, TEvent extends Event> {
    private _source: WeakRef<TSource>;
    private _weakRef: WeakRef<(event: TEvent) => void>;

    constructor(source: TSource, listener: (event: TEvent) => void) {
        this._source = new WeakRef(source);
        this._weakRef = new WeakRef(listener);
    }

    call(event: TEvent): void {
        const source = this._source.deref();
        const listener = this._weakRef.deref();

        if (!source || !listener) {  
            return;
        }

        if (typeof listener === 'function') {
            listener.call(source, event);
        }
    }
}

export function wrapWeakHandler<TSource extends WeakKey, TEvent extends Event>(source: TSource, listener: (event: TEvent) => void): (event: TEvent) => void {
    const weakHandler = new WeakHandler(source, listener);
    return weakHandler.call.bind(weakHandler);
}