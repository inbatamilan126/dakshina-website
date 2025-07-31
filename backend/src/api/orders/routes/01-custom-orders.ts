// File: backend/src/api/orders/routes/01-custom-orders.ts

export default {
  routes: [
    {
      method: 'POST',
      path: '/orders/create',
      handler: 'api::orders.orders.create',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/orders/verify',
      handler: 'api::orders.orders.verify',
      config: {
        auth: false,
      },
    },
  ],
};
