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
function isDOM(obj) {
    if (typeof HTMLElement === 'object') {
        return obj instanceof HTMLElement;
    }
    return (obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string');
}
function clamp(n, min, max) {
    if (n < min)
        return min;
    if (n > max)
        return max;
    return n;
}
function toBarPerc(n) {
    return (-1 + n) * 100;
}
var queue = new (/** @class */ (function () {
    function class_1() {
        this.pending = [];
    }
    class_1.prototype.add = function (fn) {
        this.pending.push(fn);
        if (this.pending.length == 1)
            this.next();
    };
    class_1.prototype.next = function () {
        var fn = this.pending.shift();
        if (fn) {
            fn(this.next);
        }
    };
    return class_1;
}()));
var css = (function () {
    var cssPrefixes = ['Webkit', 'O', 'Moz', 'ms'];
    var cssProps = {};
    function camelCase(string) {
        return string.replace(/^-ms-/, 'ms-')
            .replace(/-([\da-z])/gi, function (match, letter) { return letter.toUpperCase(); });
    }
    function getVendorProp(name) {
        var style = document.body.style;
        if (name in style)
            return name;
        var i = cssPrefixes.length;
        var capName = name.charAt(0).toUpperCase() + name.slice(1);
        var vendorName = '';
        while (i--) {
            vendorName = cssPrefixes[i] + capName;
            if (vendorName in style)
                return vendorName;
        }
        return name;
    }
    function getStyleProp(name) {
        name = camelCase(name);
        return cssProps[name] || (cssProps[name] = getVendorProp(name));
    }
    function applyCss(element, prop, value) {
        prop = getStyleProp(prop);
        // @ts-ignore
        element.style[prop] = value;
    }
    return function (element, properties) {
        var args = arguments, prop, value;
        if (args.length == 2) {
            for (prop in properties) {
                value = properties[prop];
                if (value !== undefined && properties.hasOwnProperty(prop))
                    applyCss(element, prop, value);
            }
        }
        else {
            applyCss(element, args[1], args[2]);
        }
    };
})();
function classList(element) {
    return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
}
function hasClass(element, name) {
    var list = typeof element == 'string' ? element : classList(element);
    return list.indexOf(' ' + name + ' ') >= 0;
}
function removeClass(element, name) {
    var oldList = classList(element);
    var newList = '';
    if (!hasClass(element, name))
        return;
    // Replace the class name.
    newList = oldList.replace(' ' + name + ' ', ' ');
    // Trim the opening and closing spaces.
    element.className = newList.substring(1, newList.length - 1);
}
function addClass(element, name) {
    var oldList = classList(element);
    var newList = oldList + name;
    if (hasClass(oldList, name))
        return;
    // Trim the opening space.
    element.className = newList.substring(1);
}
function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
}
var NSProgress = /** @class */ (function () {
    function NSProgress() {
        var _this = this;
        this.settings = {
            minimum: 0.08,
            easing: 'linear',
            positionUsing: '',
            speed: 200,
            trickle: true,
            trickleSpeed: 200,
            showSpinner: true,
            barSelector: '[role="bar"]',
            spinnerSelector: '[role="spinner"]',
            parent: 'body',
            template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
        };
        this.status = null;
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
                n = clamp(n + amount, 0, 0.994);
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
        n = clamp(n, this.settings.minimum, 1);
        this.status = (n === 1 ? null : n);
        var progress = this.render(!started);
        var bar = progress.querySelector(this.settings.barSelector);
        var speed = this.settings.speed;
        var ease = this.settings.easing;
        progress.offsetWidth; /* Repaint */
        queue.add(function (next) {
            // Set positionUsing if it hasn't already been set
            if (_this.settings.positionUsing === '')
                _this.settings.positionUsing = _this.getPositioningCSS();
            // Add transition
            css(bar, _this.barPositionCSS(n, speed, ease));
            if (n === 1) {
                // Fade out
                css(progress, {
                    transition: 'none',
                    opacity: 1
                });
                progress.offsetWidth; /* Repaint */
                setTimeout(function () {
                    css(progress, {
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
    NSProgress.prototype.start = function () {
        var _this = this;
        if (!this.status)
            this.set(0);
        var work = function () {
            setTimeout(function () {
                if (!_this.status)
                    return;
                _this.trickle();
                work();
            }, _this.settings.trickleSpeed);
        };
        if (this.settings.trickle)
            work();
        return this;
    };
    ;
    NSProgress.prototype.done = function (force) {
        if (force === void 0) { force = false; }
        if (!force && !this.status)
            return this;
        this.inc(0.3 + 0.5 * Math.random());
        this.set(1);
        return;
    };
    ;
    NSProgress.prototype.remove = function () {
        removeClass(document.documentElement, 'nprogress-busy');
        var parent = (isDOM(this.settings.parent) ? this.settings.parent : document.querySelector(this.settings.parent));
        removeClass(parent, 'nprogress-custom-parent');
        var progress = document.getElementById('nprogress');
        progress && removeElement(progress);
    };
    ;
    NSProgress.prototype.trickle = function () {
        return this.inc();
    };
    ;
    NSProgress.prototype.render = function (fromStart) {
        if (this.isRendered())
            return document.getElementById('nprogress');
        addClass(document.documentElement, 'nprogress-busy');
        var progress = document.createElement('div');
        progress.id = 'nprogress';
        progress.innerHTML = this.settings.template;
        var bar = progress.querySelector(this.settings.barSelector);
        var perc = fromStart ? '-100' : toBarPerc(this.status || 0);
        var parent = (isDOM(this.settings.parent) ? this.settings.parent : document.querySelector(this.settings.parent));
        var spinner = null;
        css(bar, {
            transition: 'all 0 linear',
            transform: 'translate3d(' + perc + '%,0,0)'
        });
        if (!this.settings.showSpinner) {
            spinner = progress.querySelector(this.settings.spinnerSelector);
            spinner && removeElement(spinner);
        }
        if (parent != document.body) {
            addClass(parent, 'nprogress-custom-parent');
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
            barCSS = { transform: 'translate3d(' + toBarPerc(n) + '%,0,0)' };
        }
        else if (this.settings.positionUsing === 'translate') {
            barCSS = { transform: 'translate(' + toBarPerc(n) + '%,0)' };
        }
        else {
            barCSS = { 'margin-left': toBarPerc(n) + '%' };
        }
        barCSS.transition = 'all ' + speed + 'ms ' + ease;
        return barCSS;
    };
    return NSProgress;
}());
export default NSProgress;
