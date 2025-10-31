/**
 * Custom routes for users-permissions
 */

export default {
  routes: [
    {
      method: 'POST',
      path: '/users/:id/send-password-email',
      handler: 'user.sendPasswordEmail',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

