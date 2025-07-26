// File: backend/src/admin/vite.config.ts

import { defineConfig, mergeConfig } from 'vite';

export default (config) => {
  // Merge our custom configuration with Strapi's default Vite config
  return mergeConfig(config, defineConfig({
    server: {
      // This is the crucial part that allows ngrok to connect
      allowedHosts: true,
    },
  }));
};

