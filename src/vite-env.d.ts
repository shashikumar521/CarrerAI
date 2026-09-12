/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly [key: string]: string | boolean | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (config: {
          client_id: string;
          callback?: (response: any) => void;
          auto_select?: boolean;
          cancel_on_tap_outside?: boolean;
          context?: string;
          state_cookie_domain?: string;
          ux_mode?: 'popup' | 'redirect';
          allowed_parent_origin?: string | string[];
          intermediate_iframe_close_callback?: () => void;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: {
            type?: 'standard' | 'icon';
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            logo_alignment?: 'left' | 'center';
            width?: string | number;
            locale?: string;
            click_listener?: () => void;
          }
        ) => void;
        prompt: (momentListener?: (notification: any) => void) => void;
        cancel: () => void;
        disableAutoSelect: () => void;
        storeCredential?: (credential: any, callback?: () => void) => void;
      };
      oauth2?: {
        initTokenClient: (config: any) => any;
      };
    };
  };
}
