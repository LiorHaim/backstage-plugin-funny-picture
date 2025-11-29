import { createPlugin, createRoutableExtension, createRouteRef } from '@backstage/core-plugin-api';

export const rootRouteRef = createRouteRef({
  id: 'funny-picture',
});

export const funnyPicturePlugin = createPlugin({
  id: 'funny-picture',
  routes: {
    root: rootRouteRef,
  },
});

export const FunnyPicturePage = funnyPicturePlugin.provide(
  createRoutableExtension({
    name: 'FunnyPicturePage',
    component: () =>
      import('./components/FunnyPicturePage').then(m => m.FunnyPicturePage),
    mountPoint: rootRouteRef,
  }),
);

