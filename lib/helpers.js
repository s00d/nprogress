"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBarPerc = exports.clamp = exports.isDOM = exports.classList = exports.hasClass = exports.removeClass = exports.addClass = exports.removeElement = exports.css = exports.queue = void 0;
function isDOM(obj) {
    if (typeof HTMLElement === 'object') {
        return obj instanceof HTMLElement;
    }
    return (obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string');
}
exports.isDOM = isDOM;
function clamp(n, min, max) {
    if (n < min)
        return min;
    if (n > max)
        return max;
    return n;
}
exports.clamp = clamp;
function toBarPerc(n) {
    return (-1 + n) * 100;
}
exports.toBarPerc = toBarPerc;
var Queue = /** @class */ (function () {
    function Queue() {
        this.pending = [];
    }
    Queue.prototype.add = function (fn) {
        this.pending.push(fn);
        if (this.pending.length == 1)
            this.next();
    };
    Queue.prototype.next = function () {
        var fn = this.pending.shift();
        if (fn) {
            fn(this.next);
        }
    };
    return Queue;
}());
var queue = new Queue;
exports.queue = queue;
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
    function applyCss(elements, prop, value) {
        prop = getStyleProp(prop);
        for (var i in elements) {
            // @ts-ignore
            elements[i].style[prop] = value;
        }
    }
    return function (elements, properties) {
        var args = arguments, prop, value;
        if (args.length == 2) {
            for (prop in properties) {
                value = properties[prop];
                if (value !== undefined && properties.hasOwnProperty(prop))
                    applyCss(elements, prop, value);
            }
        }
        else {
            applyCss(elements, args[1], args[2]);
        }
    };
})();
exports.css = css;
function classList(element) {
    return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
}
exports.classList = classList;
function hasClass(element, name) {
    var list = typeof element == 'string' ? element : classList(element);
    return list.indexOf(' ' + name + ' ') >= 0;
}
exports.hasClass = hasClass;
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
exports.removeClass = removeClass;
function addClass(element, name) {
    var oldList = classList(element);
    var newList = oldList + name;
    if (hasClass(oldList, name))
        return;
    // Trim the opening space.
    element.className = newList.substring(1);
}
exports.addClass = addClass;
function removeElement(element) {
    element && element.parentNode && element.parentNode.removeChild(element);
}
exports.removeElement = removeElement;
