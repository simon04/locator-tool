import {toReactive, useBrowserLocation} from '@vueuse/core';
import {
  type App,
  type Component,
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  type PropType
} from 'vue';

// A tiny hash-history router covering just the subset of vue-router this app uses.
// Hash links (`<a href="#/…">`) navigate natively, so no click handlers are needed.
// The reactive location comes from VueUse; URL / URLSearchParams do the parsing.

type Loader = () => Promise<Component | {default: Component}>;

export interface RouteRecord {
  name: string;
  path: string;
  component: Component | Loader;
}

export interface RouteLocationRaw {
  name: string;
  query?: Record<string, string | number | undefined | null>;
}

export interface RouteLocation {
  name?: string;
  path: string;
  query: Record<string, string>;
}

export interface Router {
  currentRoute: RouteLocation;
  routes: RouteRecord[];
  linkActiveClass?: string;
  resolve(to: RouteLocationRaw): {name: string; href: string};
  push(to: RouteLocationRaw): void;
  install(app: App): void;
}

let router: Router;

export function createRouter(options: {linkActiveClass?: string; routes: RouteRecord[]}): Router {
  const routes = options.routes.map(route => ({
    ...route,
    component:
      typeof route.component === 'function'
        ? defineAsyncComponent(route.component as Loader)
        : route.component
  }));

  const resolve = (to: RouteLocationRaw) => {
    const record = routes.find(r => r.name === to.name);
    if (!record) throw new Error(`Unknown route: ${to.name}`);
    const url = new URL(record.path, location.origin);
    for (const [key, value] of Object.entries(to.query ?? {}))
      if (value != null) url.searchParams.set(key, String(value));
    return {name: record.name, href: `#${url.pathname}${url.search}`};
  };

  const browser = useBrowserLocation();
  const currentRoute = toReactive(
    computed<RouteLocation>(() => {
      const url = new URL(browser.value.hash?.slice(1) || '/', location.origin);
      return {
        name: routes.find(r => r.path === url.pathname)?.name,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams)
      };
    })
  );

  return (router = {
    currentRoute,
    routes,
    linkActiveClass: options.linkActiveClass,
    resolve,
    push: to => {
      location.hash = resolve(to).href;
    },
    install(app) {
      app.component('RouterLink', RouterLink);
      app.component('RouterView', RouterView);
    }
  });
}

export const useRouter = () => router;
export const useRoute = () => router.currentRoute;

export const RouterLink = defineComponent({
  name: 'RouterLink',
  props: {to: {type: Object as PropType<RouteLocationRaw>, required: true}},
  setup(props, {slots}) {
    const link = computed(() => router.resolve(props.to));
    const active = computed(() => link.value.name === router.currentRoute.name);
    return () =>
      h(
        'a',
        {href: link.value.href, class: active.value ? router.linkActiveClass : undefined},
        slots.default?.()
      );
  }
});

export const RouterView = defineComponent({
  name: 'RouterView',
  setup() {
    const match = computed(
      () =>
        router.routes.find(r => r.path === router.currentRoute.path) ??
        router.routes.find(r => r.path === '/')
    );
    return () => (match.value ? h(match.value.component) : null);
  }
});
