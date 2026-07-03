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

// A very small router that only supports hash history and named routes.
// It is a drop-in replacement for the tiny subset of vue-router this app uses.

export type LocationQueryValue = string | string[];
export type LocationQuery = Record<string, LocationQueryValue>;
export type LocationQueryRaw = Record<
  string,
  string | number | undefined | null | (string | number)[]
>;

export interface RouteLocationRaw {
  name?: string;
  path?: string;
  query?: LocationQueryRaw;
}

export interface RouteLocation {
  name: string | undefined;
  path: string;
  query: LocationQuery;
  href: string;
}

type ComponentLoader = () => Promise<Component | {default: Component}>;

export interface RouteRecord {
  name: string;
  path: string;
  component: Component | ComponentLoader;
}

export interface RouterOptions {
  history: RouterHistory;
  linkActiveClass?: string;
  routes: RouteRecord[];
}

export interface RouterHistory {
  /** the current location without the leading `#`, e.g. `/map?files=x` */
  readonly location: string;
  push(to: string): void;
  listen(onChange: () => void): void;
}

export function createWebHashHistory(): RouterHistory {
  const current = () => {
    const hash = window.location.hash;
    return (hash.startsWith('#') ? hash.slice(1) : hash) || '/';
  };
  return {
    get location() {
      return current();
    },
    push(to) {
      window.location.hash = to;
    },
    listen(onChange) {
      window.addEventListener('hashchange', onChange);
    }
  };
}

function stringifyQuery(query?: LocationQueryRaw): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) if (v !== undefined && v !== null) params.append(key, String(v));
    } else {
      params.append(key, String(value));
    }
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

function parseQuery(search: string): LocationQuery {
  const params = new URLSearchParams(search);
  const query: LocationQuery = {};
  for (const key of new Set(params.keys())) {
    const all = params.getAll(key);
    query[key] = all.length > 1 ? all : all[0];
  }
  return query;
}

export interface Router {
  readonly currentRoute: RouteLocation;
  options: RouterOptions;
  resolve(to: RouteLocationRaw | string): RouteLocation;
  push(to: RouteLocationRaw | string): void;
  install(app: App): void;
}

let activeRouter: Router | undefined;

export function createRouter(options: RouterOptions): Router {
  // pre-wrap lazily-imported components so <router-view> can render them directly
  const routes: RouteRecord[] = options.routes.map(route => ({
    ...route,
    component:
      typeof route.component === 'function'
        ? defineAsyncComponent(route.component as ComponentLoader)
        : route.component
  }));

  function recordFor(loc: RouteLocationRaw | string): RouteRecord | undefined {
    if (typeof loc === 'string') {
      const [path] = loc.split('?');
      return routes.find(r => r.path === path);
    }
    if (loc.name) return routes.find(r => r.name === loc.name);
    return routes.find(r => r.path === loc.path);
  }

  function resolve(to: RouteLocationRaw | string): RouteLocation {
    if (typeof to === 'string') {
      const [path, search = ''] = to.split('?');
      return {name: recordFor(to)?.name, path, query: parseQuery(search), href: `#${to}`};
    }
    const record = recordFor(to);
    const path = record?.path ?? to.path ?? '/';
    const search = stringifyQuery(to.query);
    return {name: record?.name, path, query: parseQuery(search), href: `#${path}${search}`};
  }

  function fromLocation(location: string): RouteLocation {
    const [path, search = ''] = location.split('?');
    const record = routes.find(r => r.path === path) ?? routes.find(r => r.path === '/');
    return {name: record?.name, path, query: parseQuery(search), href: `#${location}`};
  }

  const currentRoute = reactive(fromLocation(options.history.location)) as RouteLocation;
  options.history.listen(() => Object.assign(currentRoute, fromLocation(options.history.location)));

  const router: Router = {
    currentRoute,
    options: {...options, routes},
    resolve,
    push(to) {
      const href = resolve(to).href;
      options.history.push(href.slice(1));
    },
    install(app) {
      app.component('RouterLink', RouterLink);
      app.component('RouterView', RouterView);
    }
  };
  activeRouter = router;
  return router;
}

export function useRouter(): Router {
  if (!activeRouter) throw new Error('router has not been created yet');
  return activeRouter;
}

export function useRoute(): RouteLocation {
  return useRouter().currentRoute;
}

export const RouterLink = defineComponent({
  name: 'RouterLink',
  props: {
    to: {type: [String, Object] as PropType<RouteLocationRaw | string>, required: true}
  },
  setup(props, {slots}) {
    const router = useRouter();
    const route = router.currentRoute;
    const resolved = computed(() => router.resolve(props.to));
    const isActive = computed(
      () => resolved.value.name !== undefined && resolved.value.name === route.name
    );
    function onClick(event: MouseEvent) {
      // let the browser handle new-tab / modified clicks
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
        return;
      event.preventDefault();
      router.push(props.to);
    }
    return () =>
      h(
        'a',
        {
          href: resolved.value.href,
          onClick,
          class: isActive.value ? router.options.linkActiveClass : undefined
        },
        slots.default?.()
      );
  }
});

export const RouterView = defineComponent({
  name: 'RouterView',
  setup() {
    const router = useRouter();
    const route = router.currentRoute;
    const component = computed(() => {
      const record =
        router.options.routes.find(r => r.path === route.path) ??
        router.options.routes.find(r => r.path === '/');
      return (record?.component as Component) ?? null;
    });
    return () => (component.value ? h(component.value) : null);
  }
});
