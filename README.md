# nprogress-ts

Slim progress bars is based on [nprogress-ts](https://github.com/s00d/nprogress) for Ajax'y applications


## Installation

```console
$ npm install vue-nprogress-ts --save
```

## Examples

```vue
<template>
  <div class="nprogress-container"></div>
</template>

<script>
export default {
  name: 'nprogress-container'
}
</script>

<style lang="css">
@import 'vue-nprogress-ts/lib/nprogress.min.css'; 
/* or scss  vue-nprogress-ts/src/nprogress.scss */
</style>
```

vue 2 example
```js
import Vue from 'vue'
import App from './App.vue'
import NProgress from 'vue-nprogress-ts'

Vue.use(NProgress)

const nprogress = new NProgress()

const app = new Vue({
  nprogress
  ...App
})

// APIs: see https://github.com/s00d/nprogress
// app.nprogress
// app.nprogress.start()
// app.nprogress.inc(0.2)
// app.nprogress.done()
// Component:
// this.$nprogress
```


## Configuration

```js
const options = {
  latencyThreshold: 200, // Number of ms before progressbar starts showing, default: 100,
  router: true, // Show progressbar when navigating routes, default: true
  http: false // Show progressbar when doing Vue.http, default: true
};
Vue.use(NProgress, options)
```

In order to overwrite the configuration for certain requests, use showProgressBar parameter in request/route's meta.

Like this:

```js
Vue.http.get('/url', { showProgressBar: false })
```
```js
const router = new VueRouter({
  routes: [
    {
      path: '/foo',
      component: Foo,
      meta: {
        showProgressBar: false
      }
    }
  ]
})
```


## Badges

![](https://img.shields.io/badge/license-MIT-blue.svg)
![](https://img.shields.io/badge/status-stable-green.svg)

---

> GitHub [@s00d](https://github.com/s00d) &nbsp;&middot;&nbsp;

*   Big thanks to [`rstacruz/nprogress`](https://github.com/rstacruz/nprogress) to learn how to write the plugin.
*   Big thanks to [`vue-bulma/nprogress`](https://github.com/vue-bulma/nprogress) to learn how to write the plugin.

