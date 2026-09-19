/// <reference types="vite-plus/client" />

interface ImportMetaEnv {
  readonly VITE_COMMONS_URL?: string;
  readonly VITE_OAUTH_CLIENT_ID?: string;
  readonly VITE_OAUTH_REDIRECT_URI?: string;
}

declare module '*.vue' {
  import {defineComponent} from 'vue';
  const Component: ReturnType<typeof defineComponent>;
  export default Component;
}

declare module '*.svg?component' {
  import {defineComponent} from 'vue';
  const Component: ReturnType<typeof defineComponent>;
  export default Component;
}
