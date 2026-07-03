import {
  type App,
  type Component,
  computed,
  defineAsyncComponent,
  defineComponent,
  h,
  type PropType,
  reactive
} from 'vue';

// A tiny hash-history router covering just the subset of vue-router this app uses.
// Hash links (`<a href="#/…">`) navigate natively, so no click handlers are needed.

type Loader = () => Promise<Component | {default: Component}>;

export interface RouteRecord {
  name: string;
  path: string;
  component: Component | Loader;
}

export interface RouteLocationRaw {
  name?: string;
  path?: string;
  query?: Record<string, string | number | undefined | null | (string | number)[]>;
}

export interface RouteLocation {
  name?: string;
  path: string;
  query: Record<string, string | string[]>;
}

const stringifyQuery = (query: RouteLocationRaw['query']) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {}))
    for (const v of [value].flat()) if (v != null) params.append(key, String(v));
  return String(params) && `?${params}`;
};

const parseQuery = (search: string) => {
  const query: RouteLocation['query'] = {};
  new URLSearchParams(search).forEach((value, key) => {
    query[key] = key in query ? [query[key], value].flat() : value;
  });
  return query;
};

export interface Router {
  currentRoute: RouteLocation;
  routes: RouteRecord[];
  linkActiveClass?: string;
  resolve(to: RouteLocationRaw): {name?: string; path: string; href: string};
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
    const record =
      to.name != null ? routes.find(r => r.name === to.name) : routes.find(r => r.path === to.path);
    const path = record?.path ?? to.path ?? '/';
    return {name: record?.name, path, href: `#${path}${stringifyQuery(to.query)}`};
  };

  const currentRoute = reactive<RouteLocation>({path: '/', query: {}});
  const sync = () => {
    const [path, ...rest] = (location.hash.slice(1) || '/').split('?');
    Object.assign(currentRoute, {
      name: routes.find(r => r.path === path)?.name,
      path,
      query: parseQuery(rest.join('?'))
    });
  };
  window.addEventListener('hashchange', sync);
  sync();

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
    const active = computed(() => link.value.name && link.value.name === router.currentRoute.name);
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
