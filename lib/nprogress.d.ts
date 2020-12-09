export interface Settings {
    delay?: number;
    minimum?: number;
    maximum?: number;
    easing?: 'linear' | 'ease' | string;
    positionUsing?: string;
    speed?: number;
    trickle?: boolean;
    trickleSpeed?: number;
    showSpinner?: boolean;
    barSelector?: string;
    spinnerSelector?: string;
    parent?: HTMLElement | string;
    topPosition?: number;
    template?: string;
}
export default class NSProgress {
    private settings;
    private status;
    private promise;
    private startDelay;
    private isPaused;
    constructor();
    configure(settings: Settings): void;
    isStarted(): boolean;
    isRendered(): boolean;
    set(n: number): this;
    clearDelay(): void;
    start(): this;
    done(force?: boolean): this | undefined;
    continue(): void;
    pause(): void;
    remove(): void;
    inc: (amount?: number | null) => this | undefined;
    trickle(): this | undefined;
    render(fromStart: boolean): HTMLElement;
    getPositioningCSS(): "translate3d" | "translate" | "margin";
    barPositionCSS(n: number, speed: number, ease: string): {
        transform?: string | undefined;
        'margin-left'?: string | undefined;
        transition?: string | undefined;
        top?: string | undefined;
    };
    trickleSpeed(): number;
}
