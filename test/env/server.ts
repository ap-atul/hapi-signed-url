import * as hapi from '@hapi/hapi';
import { signedUrl } from '../../src/index';
import { fileSignFunction } from './types';
import * as R from 'ramda';

export const init = async (getSignedUrl: fileSignFunction) => {
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

  // defining custom lenses
  const fileLens = R.lensProp<string, any>('file');
  const imageLens = R.lensProp<string, any>('image');

  const nestedLevelOnePath = R.lensPath(['data']);
  const nestedLevelTwoPath = R.lensPath(['data', 'images']);

  server.route({
    method: 'POST',
    path: '/lenses',
    options: {
      handler: (request: hapi.Request, h: hapi.ResponseToolkit) => {
        return h.response(request.payload).code(200);
      },
      plugins: {
        signedUrl: {
          lenses: [fileLens, imageLens],
        },
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/nested/level-one',
    options: {
      handler: (request: hapi.Request, h: hapi.ResponseToolkit) => {
        return h.response(request.payload).code(200);
      },
      plugins: {
        signedUrl: {
          lenses: [fileLens, imageLens],
          pathToSource: nestedLevelOnePath,
        },
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/nested/level-two',
    options: {
      handler: (request: hapi.Request, h: hapi.ResponseToolkit) => {
        return h.response(request.payload).code(200);
      },
      plugins: {
        signedUrl: {
          lenses: [fileLens, imageLens],
          pathToSource: nestedLevelTwoPath,
        },
      },
    },
  });

  await server.initialize();
  return server;
};
