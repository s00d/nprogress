import {addClass, clamp, css, isDOM, queue, removeClass, removeElement, toBarPerc} from "./helpers";

export interface Settings {
  delay?: number,
  minimum?: number,
  maximum?: number,
  easing?: 'linear'|'ease'|string,
  positionUsing?: string,
  speed?: number,
  trickle?: boolean,
  trickleSpeed?: number,
  showSpinner?: boolean,
  barSelector?: string,
  spinnerSelector?: string,
  parent?: HTMLElement|string,
  topPosition?: number,
  template?: string
}


export default class NSProgress {
  private settings: {
    delay: number;
    minimum: number,
    maximum: number,
    easing: 'linear'|'ease'|string,
    positionUsing: string,
    speed: number,
    trickle: boolean,
    trickleSpeed: number,
    showSpinner: boolean,
    barSelector: string,
    spinnerSelector: string,
    parent: HTMLElement|string,
    topPosition: number,
    template: string,
  } = {
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
    template: `
    <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="1">
      <div class="peg"></div>
    </div>
    <div class="spinner" role="progressbar" aria-valuemin="0" aria-valuemax="1">
      <div class="spinner-icon"></div>
    </div>
`
  };
  private status: null|number = null;
  private promise: ($promise: any) => (this);
  private startDelay: NodeJS.Timeout|null = null;
  private isPaused = false;

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
    const spinner  = progress.querySelector(this.settings.spinnerSelector) as HTMLElement
    const speed    = this.settings.speed
    const ease     = this.settings.easing

    progress.offsetWidth; /* Repaint */

    queue.add((next) => {
      // Set positionUsing if it hasn't already been set
      // if (this.settings.positionUsing === '') this.settings.positionUsing = this.getPositioningCSS();

      // Add transition
      css([bar], this.barPositionCSS(n, speed, ease));

      if (n === 1) {
        // Fade out
        css([bar, spinner], {
          transition: 'none',
          opacity: 1
        });
        progress.offsetWidth; /* Repaint */

        setTimeout(() => {
          css([bar, spinner], {
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

  clearDelay() {
    if (this.startDelay) {
      clearTimeout(this.startDelay);
      this.startDelay = null;
    }
  }

  start() {
    this.clearDelay();
    this.isPaused = false;
    this.startDelay = setTimeout(() => {
      if (!this.status) this.set(0);
      const work = () => {
        setTimeout(() => {
          if (!this.status) return;
          this.trickle();
          work();
        }, this.trickleSpeed());
      };

      if (this.settings.trickle) work();
    }, this.settings.delay || 0);

    return this;
  };

  done(force: boolean = false) {
    this.clearDelay();

    if (!force && !this.status) return this;

    this.inc(0.3 + 0.5 * Math.random());
    this.set(1)
    return;
  };

  continue() {
    this.isPaused = false
  }

  pause() {
    this.isPaused = true
  }

  remove() {
    removeClass(document.documentElement, 'nprogress-busy');
    const parent = (isDOM(this.settings.parent) ? this.settings.parent : document.querySelector(this.settings.parent as string)) as HTMLElement
    removeClass(parent, 'nprogress-custom-parent')
    const progress = document.getElementById('nprogress');
    progress && removeElement(progress);
    this.status = null
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

      n = clamp(n + amount, 0, this.settings.maximum);
      return this.set(n);
    }
  };

  trickle() {
    return this.isPaused ? this : this.inc();
  };

  render(fromStart: boolean): HTMLElement {
    if (this.isRendered()) return document.getElementById('nprogress') as HTMLElement;

    addClass(document.documentElement, 'nprogress-busy');

    const progress = document.createElement('div');
    progress.id = 'nprogress';
    progress.innerHTML = this.settings.template;

    const bar = progress.querySelector(this.settings.barSelector) as HTMLElement
    const perc     = fromStart ? 0 : this.status || 0;
    const parent = (isDOM(this.settings.parent) ? this.settings.parent : document.querySelector(this.settings.parent as string)) as HTMLElement
    let spinner: HTMLElement|null = null

    // Set positionUsing if it hasn't already been set
    if (this.settings.positionUsing === '') this.settings.positionUsing = this.getPositioningCSS();

    css([bar], this.barPositionCSS(perc, 0, 'linear'));

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
    let barCSS: {transform?: string, 'margin-left'?: string, transition?: string, top?: string} = {};

    if (this.settings.positionUsing === 'translate3d') {
      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
    } else if (this.settings.positionUsing === 'translate') {
      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
    } else {
      barCSS = { 'margin-left': toBarPerc(n)+'%' };
    }

    barCSS.top = this.settings.topPosition + 'px'

    barCSS.transition = 'all '+speed+'ms '+ease;

    return barCSS;
  }

  trickleSpeed(){
    return Math.random() * this.settings.trickleSpeed * 2;
  };
}
