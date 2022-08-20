import * as hapi from '@hapi/hapi';
import { signedUrl } from '../../src/index';
import { RouteOptions } from '../../src/lib/types';
import { fileSignFunction } from './types';

export const init = async (
  getSignedUrl: fileSignFunction,
  options: RouteOptions | RouteOptions[],
) => {
  const PORT = 4000;
  const server = hapi.server({
    port: PORT,
    host: '0.0.0.0',
  });

  // registering signed url plugin
  await server.register([
    {
      plugin: signedUrl,
      options: {
        getSignedUrl: getSignedUrl,
      },
    },
  ]);

  // creating a sample route to test
  server.route({
    method: 'POST',
    path: '/test',
    options: {
      handler: (request: hapi.Request, h: hapi.ResponseToolkit) => {
        return h.response(request.payload).code(200);
      },
      plugins: {
        signedUrl: options,
      },
    },
  });
  await server.initialize();
  return server;
};

process.on('unhandledRejection', (err) => {
  console.log(err);
});

process.on('uncaughtException', (err) => {
  console.log(err);
});
