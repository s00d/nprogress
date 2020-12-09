import NSProgress from "./nprogress";
import { AxiosStatic } from "axios";
import { Http } from "vue-resource/types/vue_resource";

declare module 'vue/types/vue' {
  interface VueConstructor {
    Progress: NSProgress
    http?: Http,
    Http?: Http,
    axios?: AxiosStatic,
    Axios?: AxiosStatic,
  }
  interface Vue {
    $progress: NSProgress
  }
}

declare module 'vue-resource/types/vue_resource' {
  interface HttpOptions {
    showProgressBar?: boolean,
  }
}

declare module 'axios/index' {
  interface AxiosRequestConfig {
    showProgressBar?: boolean,
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    progress?: NSProgress,
  }
}
