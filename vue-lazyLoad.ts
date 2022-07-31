import { App, DirectiveBinding, nextTick, ObjectDirective } from "vue";

interface IOptions {
  preload?: number;
  loading?: string;
  error?: string;
}

interface IReactiveListener {
  src: string;
  options: IOptions;
  el: HTMLImageElement;
  elRender: Function;
  checkView: Function;
  load: Function;
  state: { loading: boolean };
}

interface IListeners extends Omit<IReactiveListener, "checkView" | "load"> {}
// 找到最近的可以滚动的元素
function infineitScroll(el: HTMLElement) {
  let parent = el.parentNode as HTMLElement;
  while (parent) {
    if (/(scroll)|(auto)/.test(getComputedStyle(parent)["overflow"])) {
      return parent;
    }
    parent = parent.parentNode as HTMLElement;
  }
  return parent;
}

// 加载图片
function loadImageAsync(
  src: string,
  resolve: (this: GlobalEventHandlers, ev: Event) => any,
  reject: OnErrorEventHandler
) {
  let image = new Image();
  image.src = src;
  image.onload = resolve;
  image.onerror = reject;
}

const Lazy = function (Vue: App) {
  // 单独控制一个 img 元素
  class ReactiveListener {
    el: HTMLImageElement;
    src: string;
    options: IOptions;
    state: { loading: boolean };
    elRender: Function;

    constructor(option: any) {
      this.el = option.el;
      this.src = option.src;
      this.options = option.options;
      this.state = { loading: false }; // 还没有加载过
      this.elRender = option.elRender;
    }

    checkView() {
      let isInview = false;
      return new Promise((resolve,reject)=>{
        let observe= new IntersectionObserver((entires,obseve)=>{
          if(entires[0].intersectionRatio>0){
            obseve.unobserve(this.el)
            resolve(true)
            isInview =  true
          }else {
            resolve(false)
            isInview =  false
          }
        },{
          root:infineitScroll(this.el),
          rootMargin:String((this.options.preload || 1.3) * 100)+'100%'
        })
        observe.observe(this.el)
      })
      return
      let { top } = this.el.getBoundingClientRect();
      return top < window.innerHeight * (this.options.preload || 1.3);
    }
    load() {
      // 用来加载这种图片
      this.elRender(this, "loading");
      loadImageAsync(
        this.src,
        () => {
          this.state.loading = true;
          this.elRender(this, "finish");
        },
        () => {
          this.state.loading = false;
          this.elRender(this, "error");
        }
      );
    }
  }

  return class LazyClass {
    options: IOptions;
    bindHandler: boolean;
    listenerQueue: IReactiveListener[];

    constructor(options: IOptions) {
      this.options = options;
      this.bindHandler = false;
      this.listenerQueue = [];
    }

    async handleLazyLoad () {
      this.listenerQueue.forEach(async listener => {
        if (!listener.state.loading) {
          let canIn =await listener.checkView();
          canIn && listener.load();
        }
      });
    }

    elRender(listener: IListeners, state: "loading" | "error" | "finish") {
      let el = listener.el;
      let src = "";
      switch (state) {
        case "loading":
          src = listener.options.loading || "";
          break;
        case "error":
          src = listener.options.error || "";
          break;
        default:
          src = listener.src;
      }
      el.setAttribute("src", src);
    }

    add(el: HTMLImageElement, bingings: DirectiveBinding) {
      // 找到父亲元素
      nextTick(() => {
        let parentNode = infineitScroll(el);
        if (parentNode && !this.bindHandler) {
          this.bindHandler = true;
          parentNode.addEventListener("scroll", this.handleLazyLoad.bind(this));
        }

        const listener = new ReactiveListener({
          el,
          options: this.options,
          src: bingings.value,
          elRender: this.elRender.bind(this),
        });
        this.handleLazyLoad();
        this.listenerQueue.push(listener);
      });
    }
  };
};
export default {
  install(Vue: App, options: IOptions) {
    const LazyClass = Lazy(Vue);
    const lazy = new LazyClass(options);
    Vue.directive("lazy", {
      created: lazy.add.bind(lazy),
    });
  },
};
