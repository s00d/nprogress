"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var nprogress_1 = __importDefault(require("./nprogress"));
var vue_1 = __importDefault(require("vue"));
var defaults = {
    latencyThreshold: 100,
    router: null,
    http: true
};
var Index = /** @class */ (function () {
    function Index() {
        this.installed = false;
    }
    Index.prototype.install = function (v, options) {
        if (options === void 0) { options = {}; }
        if (this.installed)
            return;
        this.installed = true;
        var np = v.Progress = v.prototype.$nprogress = new nprogress_1.default;
        var opt = Object.assign({}, defaults, options);
        var Mixin = /** @class */ (function (_super) {
            __extends(Mixin, _super);
            function Mixin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            Mixin.prototype.beforeCreate = function () {
                if (np) {
                    var requestsTotal_1 = 0;
                    var requestsCompleted_1 = 0;
                    var latencyThreshold_1 = options.latencyThreshold, applyOnRouter_1 = options.router, applyOnHttp_1 = options.http;
                    var confirmed_1 = true;
                    var setComplete_1 = function () {
                        requestsTotal_1 = 0;
                        requestsCompleted_1 = 0;
                        np.done();
                    };
                    var initProgress_1 = function () {
                        if (0 === requestsTotal_1) {
                            setTimeout(function () { return np.start(); }, latencyThreshold_1);
                        }
                        requestsTotal_1++;
                        np.set(requestsCompleted_1 / requestsTotal_1);
                    };
                    var increase_1 = function () {
                        // Finish progress bar 50 ms later
                        setTimeout(function () {
                            ++requestsCompleted_1;
                            if (requestsCompleted_1 >= requestsTotal_1) {
                                setComplete_1();
                            }
                            else {
                                np.set((requestsCompleted_1 / requestsTotal_1) - 0.1);
                            }
                        }, opt.latencyThreshold + 50);
                    };
                    if (applyOnHttp_1) {
                        var http = vue_1.default.http || vue_1.default.Http;
                        var axios_1 = vue_1.default.axios || vue_1.default.Axios;
                        if (http) {
                            // @ts-ignore
                            http.interceptors.push(function (request, next) {
                                var showProgressBar = 'showProgressBar' in request ? request.showProgressBar : applyOnHttp_1;
                                if (showProgressBar)
                                    initProgress_1();
                                next(function (response) {
                                    if (!showProgressBar)
                                        return response;
                                    increase_1();
                                });
                            });
                        }
                        else if (axios_1) {
                            axios_1.interceptors.request.use(function (request) {
                                if (!('showProgressBar' in request))
                                    request.showProgressBar = applyOnHttp_1;
                                if (request.showProgressBar)
                                    initProgress_1();
                                return request;
                            }, function (error) {
                                return Promise.reject(error);
                            });
                            axios_1.interceptors.response.use(function (response) {
                                if (response.config.showProgressBar)
                                    increase_1();
                                return response;
                            }, function (error) {
                                if ((error.config && error.config.showProgressBar) || axios_1.isCancel(error))
                                    increase_1();
                                return Promise.reject(error);
                            });
                        }
                    }
                    var router = applyOnRouter_1 && this.$options.router;
                    if (router) {
                        router.beforeEach(function (route, from, next) {
                            var showProgressBar = 'showProgressBar' in route.meta ? route.meta.showProgressBar : applyOnRouter_1;
                            if (showProgressBar && confirmed_1) {
                                initProgress_1();
                                confirmed_1 = false;
                            }
                            next();
                        });
                        router.afterEach(function (route) {
                            var showProgressBar = 'showProgressBar' in route.meta ? route.meta.showProgressBar : applyOnRouter_1;
                            if (showProgressBar) {
                                increase_1();
                                confirmed_1 = true;
                            }
                        });
                    }
                }
            };
            return Mixin;
        }(vue_1.default));
        v.mixin(Mixin);
    };
    Index.prototype.start = function () {
    };
    Index.prototype.init = function (app) {
        this.app = app;
    };
    return Index;
}());
exports.default = Index;
