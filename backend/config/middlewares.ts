// File: backend/config/middlewares.ts

export default [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      parserOptions: {
        // This is the crucial part. It enables the raw body to be passed through.
        includeUnparsed: true,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
