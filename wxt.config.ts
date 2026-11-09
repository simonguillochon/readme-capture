import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  srcDir: 'src',
  publicDir: 'public',
  modules: ['@wxt-dev/module-vue'],
  manifestVersion: 3,
  manifest: {
    name: 'Readme Capture',
    action: {},
    permissions: ['storage', 'scripting'],
    host_permissions: ['<all_urls>'],
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
