// File: backend/src/api/inquiry/routes/custom-inquiry.ts

export default {
    routes: [
      {
        method: 'POST',
        path: '/inquiries/send',
        handler: 'inquiry.send',
        config: {
          auth: false,
        },
      },
    ],
  };
  