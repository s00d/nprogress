"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var helpers_1 = require("./helpers");
var NSProgress = /** @class */ (function () {
    function NSProgress() {
        var _this = this;
        this.settings = {
            delay: 0,
            minimum: 0.08,
            maximum: 0.994,
            easing: 'linear',
            positionUsing: '',
            speed: 200,
            trickle: true,
            trickleSpeed: 200,
            showSpinner: true,
            barSelector: 'div.bar',
            spinnerSelector: 'div.spinner',
            parent: 'body',
            topPosition: 0,
            template: "\n    <div class=\"bar\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"1\">\n      <div class=\"peg\"></div>\n    </div>\n    <div class=\"spinner\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"1\">\n      <div class=\"spinner-icon\"></div>\n    </div>\n"
        };
        this.status = null;
        this.startDelay = null;
        this.isPaused = false;
        this.inc = function (amount) {
            if (amount === void 0) { amount = null; }
            var n = _this.status;
            if (!n) {
                return _this.start();
            }
            else if (n > 1) {
                return;
            }
            else {
                if (amount === null) {
                    amount = 0;
                    if (n >= 0 && n < 0.2) {
                        amount = 0.1;
                    }
                    else if (n >= 0.2 && n < 0.5) {
                        amount = 0.04;
                    }
                    else if (n >= 0.5 && n < 0.8) {
                        amount = 0.02;
                    }
                    else if (n >= 0.8 && n < 0.99) {
                        amount = 0.005;
                    }
                }
                n = helpers_1.clamp(n + amount, 0, _this.settings.maximum);
                return _this.set(n);
            }
        };
        var initial = 0;
        var current = 0;
        this.promise = function ($promise) {
            if (!$promise || $promise.state() === "resolved") {
                return _this;
            }
            if (current === 0) {
                _this.start();
            }
            initial++;
            current++;
            $promise.always(function () {
                current--;
                if (current === 0) {
                    initial = 0;
                    _this.done();
                }
                else {
                    _this.set((initial - current) / initial);
                }
            });
            return _this;
        };
    }
    NSProgress.prototype.configure = function (settings) {
        this.settings = __assign(__assign({}, this.settings), settings);
    };
    NSProgress.prototype.isStarted = function () {
        return this.status !== null;
    };
    NSProgress.prototype.isRendered = function () {
        return !!document.getElementById('nprogress');
    };
    ;
    NSProgress.prototype.set = function (n) {
        var _this = this;
        var started = this.isStarted();
        n = helpers_1.clamp(n, this.settings.minimum, 1);
        this.status = (n === 1 ? null : n);
        var progress = this.render(!started);
        var bar = progress.querySelector(this.settings.barSelector);
        var spinner = progress.querySelector(this.settings.spinnerSelector);
        var speed = this.settings.speed;
        var ease = this.settings.easing;
        progress.offsetWidth; /* Repaint */
        helpers_1.queue.add(function (next) {
            // Set positionUsing if it hasn't already been set
            // if (this.settings.positionUsing === '') this.settings.positionUsing = this.getPositioningCSS();
            // Add transition
            helpers_1.css([bar], _this.barPositionCSS(n, speed, ease));
            if (n === 1) {
                // Fade out
                helpers_1.css([bar, spinner], {
                    transition: 'none',
                    opacity: 1
                });
                progress.offsetWidth; /* Repaint */
                setTimeout(function () {
                    helpers_1.css([bar, spinner], {
                        transition: 'all ' + speed + 'ms linear',
                        opacity: 0
                    });
                    setTimeout(function () {
                        _this.remove();
                        next();
                    }, speed);
                }, speed);
            }
            else {
                setTimeout(next, speed);
            }
        });
        return this;
    };
    NSProgress.prototype.clearDelay = function () {
        if (this.startDelay) {
            clearTimeout(this.startDelay);
            this.startDelay = null;
        }
    };
    NSProgress.prototype.start = function () {
        var _this = this;
        this.clearDelay();
        this.isPaused = false;
        this.startDelay = setTimeout(function () {
            if (!_this.status)
                _this.set(0);
            var work = function () {
                setTimeout(function () {
                    if (!_this.status)
                        return;
                    _this.trickle();
                    work();
                }, _this.trickleSpeed());
            };
            if (_this.settings.trickle)
                work();
        }, this.settings.delay || 0);
        return this;
    };
    ;
    NSProgress.prototype.done = function (force) {
        if (force === void 0) { force = false; }
        this.clearDelay();
        if (!force && !this.status)
            return this;
        this.inc(0.3 + 0.5 * Math.random());
        this.set(1);
        return;
    };
    ;
    NSProgress.prototype.continue = function () {
        this.isPaused = false;
    };
    NSProgress.prototype.pause = function () {
        this.isPaused = true;
    };
    NSProgress.prototype.remove = function () {
        helpers_1.removeClass(document.documentElement, 'nprogress-busy');
        var parent = (helpers_1.isDOM(this.settings.parent) ? this.settings.parent : document.querySelector(this.settings.parent));
        helpers_1.removeClass(parent, 'nprogress-custom-parent');
        var progress = document.getElementById('nprogress');
        progress && helpers_1.removeElement(progress);
        this.status = null;
    };
    ;
    NSProgress.prototype.trickle = function () {
        return this.isPaused ? this : this.inc();
    };
    ;
    NSProgress.prototype.render = function (fromStart) {
        if (this.isRendered())
            return document.getElementById('nprogress');
        helpers_1.addClass(document.documentElement, 'nprogress-busy');
        var progress = document.createElement('div');
        progress.id = 'nprogress';
        progress.innerHTML = this.settings.template;
        var bar = progress.querySelector(this.settings.barSelector);
        var perc = fromStart ? 0 : this.status || 0;
        var parent = (helpers_1.isDOM(this.settings.parent) ? this.settings.parent : document.querySelector(this.settings.parent));
        var spinner = null;
        // Set positionUsing if it hasn't already been set
        if (this.settings.positionUsing === '')
            this.settings.positionUsing = this.getPositioningCSS();
        helpers_1.css([bar], this.barPositionCSS(perc, 0, 'linear'));
        if (!this.settings.showSpinner) {
            spinner = progress.querySelector(this.settings.spinnerSelector);
            spinner && helpers_1.removeElement(spinner);
        }
        if (parent != document.body) {
            helpers_1.addClass(parent, 'nprogress-custom-parent');
        }
        parent.appendChild(progress);
        return progress;
    };
    ;
    NSProgress.prototype.getPositioningCSS = function () {
        // Sniff on document.body.style
        var bodyStyle = document.body.style;
        // Sniff prefixes
        var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
            ('MozTransform' in bodyStyle) ? 'Moz' :
                ('msTransform' in bodyStyle) ? 'ms' :
                    ('OTransform' in bodyStyle) ? 'O' : '';
        if (vendorPrefix + 'Perspective' in bodyStyle) {
            // Modern browsers with 3D support, e.g. Webkit, IE10
            return 'translate3d';
        }
        else if (vendorPrefix + 'Transform' in bodyStyle) {
            // Browsers without 3D support, e.g. IE9
            return 'translate';
        }
        else {
            // Browsers without translate() support, e.g. IE7-8
            return 'margin';
        }
    };
    ;
    NSProgress.prototype.barPositionCSS = function (n, speed, ease) {
        var barCSS = {};
        if (this.settings.positionUsing === 'translate3d') {
            barCSS = { transform: 'translate3d(' + helpers_1.toBarPerc(n) + '%,0,0)' };
        }
        else if (this.settings.positionUsing === 'translate') {
            barCSS = { transform: 'translate(' + helpers_1.toBarPerc(n) + '%,0)' };
        }
        else {
            barCSS = { 'margin-left': helpers_1.toBarPerc(n) + '%' };
        }
        barCSS.top = this.settings.topPosition + 'px';
        barCSS.transition = 'all ' + speed + 'ms ' + ease;
        return barCSS;
    };
    NSProgress.prototype.trickleSpeed = function () {
        return Math.random() * this.settings.trickleSpeed * 2;
    };
    ;
    return NSProgress;
}());
exports.default = NSProgress;
