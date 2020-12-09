import Vue from "vue";
import Router from "vue-router";
export interface Options {
    latencyThreshold?: number;
    router?: Router;
    http?: boolean;
}
export default class Index {
    private installed;
    private app;
    install(v: typeof Vue, options?: Options): void;
    start(): void;
    init(app: any): void;
}
