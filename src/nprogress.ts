type Callback = (...val: any) => any

export interface Settings {
  minimum?: number,
  easing?: 'linear'|'ease'|string,
  positionUsing?: string,
  speed?: number,
  trickle?: boolean,
  trickleSpeed?: number,
  showSpinner?: boolean,
  barSelector?: string,
  spinnerSelector?: string,
  parent?: HTMLElement|string,
  template?: string
}

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

const queue = new (class{
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
})

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

  function applyCss(element: HTMLElement, prop: string, value: string) {
    prop = getStyleProp(prop);
    // @ts-ignore
    element.style[prop] = value;
  }

  return function(element: HTMLElement, properties: {[key: string]: any}) {
    let args = arguments,
      prop,
      value;

    if (args.length == 2) {
      for (prop in properties) {
        value = properties[prop];
        if (value !== undefined && properties.hasOwnProperty(prop)) applyCss(element, prop, value);
      }
    } else {
      applyCss(element, args[1], args[2]);
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


export default class NSProgress {
  private settings: {
    minimum: number,
    easing: 'linear'|'ease'|string,
    positionUsing: string,
    speed: number,
    trickle: boolean,
    trickleSpeed: number,
    showSpinner: boolean,
    barSelector: string,
    spinnerSelector: string,
    parent: HTMLElement|string,
    template: string
  } = {
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
  private status: null|number = null;
  private promise: ($promise: any) => (this);

  constructor() {
    let initial = 0
    let current = 0;

    this.promise = ($promise: any) => {
      if (!$promise || $promise.state() === "resolved") {
        return this;
      }

      if (current === 0) {
        this.start();
      }

      initial++;
      current++;

      $promise.always(() => {
        current--;
        if (current === 0) {
          initial = 0;
          this.done();
        } else {
          this.set((initial - current) / initial);
        }
      });

      return this;
    };
  }

  configure(settings: Settings) {
    this.settings = {...this.settings, ...settings}
  }

  isStarted() {
    return this.status !== null;
  }

  isRendered() {
    return !!document.getElementById('nprogress');
  };

  set(n: number) {
    const started = this.isStarted();

    n = clamp(n, this.settings.minimum, 1);
    this.status = (n === 1 ? null : n);

    const progress = this.render(!started)
    const bar      = progress.querySelector(this.settings.barSelector) as HTMLElement
    const speed    = this.settings.speed
    const ease     = this.settings.easing

    progress.offsetWidth; /* Repaint */

    queue.add((next) => {
      // Set positionUsing if it hasn't already been set
      if (this.settings.positionUsing === '') this.settings.positionUsing = this.getPositioningCSS();

      // Add transition
      css(bar, this.barPositionCSS(n, speed, ease));

      if (n === 1) {
        // Fade out
        css(progress, {
          transition: 'none',
          opacity: 1
        });
        progress.offsetWidth; /* Repaint */

        setTimeout(() => {
          css(progress, {
            transition: 'all ' + speed + 'ms linear',
            opacity: 0
          });
          setTimeout(() => {
            this.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  }

  start() {
    if (!this.status) this.set(0);

    var work = () => {
      setTimeout(() => {
        if (!this.status) return;
        this.trickle();
        work();
      }, this.settings.trickleSpeed);
    };

    if (this.settings.trickle) work();

    return this;
  };

  done(force: boolean = false) {
    if (!force && !this.status) return this;

    this.inc(0.3 + 0.5 * Math.random());
    this.set(1)
    return;
  };

  remove() {
    removeClass(document.documentElement, 'nprogress-busy');
    const parent = (isDOM(this.settings.parent) ? this.settings.parent : document.querySelector(this.settings.parent as string)) as HTMLElement
    removeClass(parent, 'nprogress-custom-parent')
    const progress = document.getElementById('nprogress');
    progress && removeElement(progress);
  };

  inc = (amount: number|null = null) => {
    let n = this.status;

    if (!n) {
      return this.start();
    } else if(n > 1) {
      return;
    } else {
      if (amount === null) {
        amount = 0;
        if (n >= 0 && n < 0.2) { amount = 0.1; }
        else if (n >= 0.2 && n < 0.5) { amount = 0.04; }
        else if (n >= 0.5 && n < 0.8) { amount = 0.02; }
        else if (n >= 0.8 && n < 0.99) { amount = 0.005; }
      }

      n = clamp(n + amount, 0, 0.994);
      return this.set(n);
    }
  };

  trickle() {
    return this.inc();
  };

  render(fromStart: boolean): HTMLElement {
    if (this.isRendered()) return document.getElementById('nprogress') as HTMLElement;

    addClass(document.documentElement, 'nprogress-busy');

    const progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = this.settings.template;

    const bar = progress.querySelector(this.settings.barSelector) as HTMLElement
    const perc = fromStart ? '-100' : toBarPerc(this.status || 0)
    const parent = (isDOM(this.settings.parent) ? this.settings.parent : document.querySelector(this.settings.parent as string)) as HTMLElement
    let spinner: HTMLElement|null = null

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

  getPositioningCSS() {
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
    } else if (vendorPrefix + 'Transform' in bodyStyle) {
      // Browsers without 3D support, e.g. IE9
      return 'translate';
    } else {
      // Browsers without translate() support, e.g. IE7-8
      return 'margin';
    }
  };

  barPositionCSS(n: number, speed: number, ease: string) {
    let barCSS: {transform?: string, 'margin-left'?: string, transition?: string} = {};

    if (this.settings.positionUsing === 'translate3d') {
      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
    } else if (this.settings.positionUsing === 'translate') {
      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
    } else {
      barCSS = { 'margin-left': toBarPerc(n)+'%' };
    }

    barCSS.transition = 'all '+speed+'ms '+ease;

    return barCSS;
  }
}
