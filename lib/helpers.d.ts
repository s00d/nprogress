declare type Callback = (...val: any) => any;
declare function isDOM(obj: any): boolean;
declare function clamp(n: number, min: number, max: number): number;
declare function toBarPerc(n: number): number;
declare class Queue {
    private pending;
    add(fn: Callback): void;
    next(): void;
}
declare const queue: Queue;
declare const css: (elements: Array<HTMLElement>, properties: {
    [key: string]: any;
}) => void;
declare function classList(element: HTMLElement): string;
declare function hasClass(element: HTMLElement | string, name: string): boolean;
declare function removeClass(element: HTMLElement, name: string): void;
declare function addClass(element: HTMLElement, name: string): void;
declare function removeElement(element: HTMLElement): void;
export { queue, css, removeElement, addClass, removeClass, hasClass, classList, isDOM, clamp, toBarPerc };
