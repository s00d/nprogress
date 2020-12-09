import NSProgress from './nprogress'
import Vue  from "vue";
import Router from "vue-router";
import {AxiosInstance, AxiosRequestConfig, AxiosStatic} from "axios";

export interface Options {
  latencyThreshold?: number,
  router?: Router,
  http?: boolean
}

const defaults = {
  latencyThreshold: 100,
  router: null,
  http: true
}

export default class Index {
  private installed = false;
  private app: any;
  install(v: typeof Vue, options: Options = {}) {
    if (this.installed) return
    this.installed = true

    const np = v.Progress = v.prototype.$nprogress =  new NSProgress

    const opt: {latencyThreshold: number, router:null|Router,http:boolean }  = Object.assign({}, defaults, options)

    class Mixin extends Vue {
      beforeCreate() {
        if (np) {

          let requestsTotal = 0
          let requestsCompleted = 0
          let { latencyThreshold, router: applyOnRouter, http: applyOnHttp } = options
          let confirmed = true

          const setComplete = () => {
            requestsTotal = 0
            requestsCompleted = 0
            np.done()
          };

          const initProgress = () => {
            if (0 === requestsTotal) {
              setTimeout(() => np.start(), latencyThreshold)
            }
            requestsTotal++
            np.set(requestsCompleted / requestsTotal)
          };

          const increase = () => {
            // Finish progress bar 50 ms later
            setTimeout(() => {
              ++requestsCompleted
              if (requestsCompleted >= requestsTotal) {
                setComplete()
              } else {
                np.set((requestsCompleted / requestsTotal) - 0.1)
              }
            }, opt.latencyThreshold + 50)
          };

          if (applyOnHttp) {
            const http = Vue.http || Vue.Http
            const axios = Vue.axios || Vue.Axios

            if (http) {
              // @ts-ignore
              http.interceptors.push((request: any, next: (response: any) => void) => {
                const showProgressBar = 'showProgressBar' in request ? request.showProgressBar : applyOnHttp
                if (showProgressBar) initProgress()

                next((response: any) => {
                  if (!showProgressBar) return response
                  increase()
                })
              })
            } else if (axios) {
              axios.interceptors.request.use((request: AxiosRequestConfig) => {
                if (!('showProgressBar' in request)) request.showProgressBar = applyOnHttp
                if (request.showProgressBar) initProgress()
                return request
              }, (error) => {
                return Promise.reject(error)
              })

              axios.interceptors.response.use((response) => {
                if (response.config.showProgressBar) increase()
                return response
              }, (error) => {
                if ((error.config && error.config.showProgressBar) || axios.isCancel(error)) increase()
                return Promise.reject(error)
              })
            }
          }

          const router = applyOnRouter && this.$options.router
          if (router) {
            router.beforeEach((route, from, next) => {
              const showProgressBar = 'showProgressBar' in route.meta ? route.meta.showProgressBar : applyOnRouter
              if (showProgressBar && confirmed) {
                initProgress()
                confirmed = false
              }
              next()
            })
            router.afterEach(route => {
              const showProgressBar = 'showProgressBar' in route.meta ? route.meta.showProgressBar : applyOnRouter
              if (showProgressBar) {
                increase()
                confirmed = true
              }
            })
          }
        }
      }
    }

    v.mixin(Mixin);
  }

  start() {

  }

  init(app: any) {
    this.app = app
  }
}
