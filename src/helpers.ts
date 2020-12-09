type Callback = (...val: any) => any

function isDOM (obj: any): boolean {
  if (typeof HTMLElement === 'object') {
    return obj instanceof HTMLElement
  }
  return (obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string')
}

function clamp(n: number, min: number, max: number) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function toBarPerc(n: number) {
  return (-1 + n) * 100;
}

class Queue{
  private pending: Array<any> = [];

  add(fn: Callback) {
    this.pending.push(fn);
    if (this.pending.length == 1) this.next();
  }

  next() {
    const fn = this.pending.shift();
    if (fn) {
      fn(this.next);
    }
  }
}

const queue = new Queue;

const css = (() => {
  const cssPrefixes = [ 'Webkit', 'O', 'Moz', 'ms' ]
  const cssProps: {[key: string]: string} = {};

  function camelCase(string: String) {
    return string.replace(/^-ms-/, 'ms-')
      .replace(/-([\da-z])/gi, (match, letter) => letter.toUpperCase());
  }

  function getVendorProp(name: string) {
    const style = document.body.style;
    if (name in style) return name;

    let i = cssPrefixes.length;
    let capName = name.charAt(0).toUpperCase() + name.slice(1);
    let vendorName = '';
    while (i--) {
      vendorName = cssPrefixes[i] + capName;
      if (vendorName in style) return vendorName;
    }

    return name;
  }

  function getStyleProp(name: string) {
    name = camelCase(name);
    return cssProps[name] || (cssProps[name] = getVendorProp(name));
  }

  function applyCss(elements: Array<HTMLElement>, prop: string, value: string) {
    prop = getStyleProp(prop);
    for (let i in elements) {
      // @ts-ignore
      elements[i].style[prop] = value;
    }
  }

  return function(elements: Array<HTMLElement>, properties: {[key: string]: any}) {
    let args = arguments,
      prop,
      value;

    if (args.length == 2) {
      for (prop in properties) {
        value = properties[prop];
        if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(elements, prop, value);
      }
    } else {
      applyCss(elements, args[1], args[2])
    }
  }
})();

function classList(element: HTMLElement) {
  return (' ' + (element && element.className || '') + ' ').replace(/\s+/gi, ' ');
}

function hasClass(element: HTMLElement|string, name: string) {
  const list = typeof element == 'string' ? element : classList(element);
  return list.indexOf(' ' + name + ' ') >= 0;
}

function removeClass(element: HTMLElement, name: string) {
  let oldList = classList(element)
  let newList = '';

  if (!hasClass(element, name)) return;

  // Replace the class name.
  newList = oldList.replace(' ' + name + ' ', ' ');

  // Trim the opening and closing spaces.
  element.className = newList.substring(1, newList.length - 1);
}

function addClass(element: HTMLElement, name: string) {
  let oldList = classList(element)
  let newList = oldList + name;

  if (hasClass(oldList, name)) return;

  // Trim the opening space.
  element.className = newList.substring(1);
}

function removeElement(element: HTMLElement) {
  element && element.parentNode && element.parentNode.removeChild(element);
}


export { queue, css, removeElement, addClass, removeClass, hasClass, classList, isDOM, clamp, toBarPerc }
