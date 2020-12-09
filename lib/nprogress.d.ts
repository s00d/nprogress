export interface Settings {
    minimum?: number;
    easing?: 'linear' | 'ease' | string;
    positionUsing?: string;
    speed?: number;
    trickle?: boolean;
    trickleSpeed?: number;
    showSpinner?: boolean;
    barSelector?: string;
    spinnerSelector?: string;
    parent?: HTMLElement | string;
    template?: string;
}
export default class NSProgress {
    private settings;
    private status;
    private promise;
    constructor();
    configure(settings: Settings): void;
    isStarted(): boolean;
    isRendered(): boolean;
    set(n: number): this;
    start(): this;
    done(force?: boolean): this | undefined;
    remove(): void;
    inc: (amount?: number | null) => this | undefined;
    trickle(): this | undefined;
    render(fromStart: boolean): HTMLElement;
    getPositioningCSS(): "translate3d" | "translate" | "margin";
    barPositionCSS(n: number, speed: number, ease: string): {
        transform?: string | undefined;
        'margin-left'?: string | undefined;
        transition?: string | undefined;
    };
}
