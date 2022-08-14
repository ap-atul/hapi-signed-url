import { isEmpty, isNil, set, view, type } from 'ramda';
import { PluginOptions, Response, RouteOptions } from './types';

const isPluginActive = (request): boolean => {
  return (
    (request.route.settings.plugins && request.route.settings.plugins.signedUrl) || false
  );
};

const isResponseAbsent = (request): boolean => {
  const response = request.response;
  return (
    response.statusCode !== 200 || isEmpty(response.source) || isNil(response.source)
  );
};

const validateRouteOptions = (options: RouteOptions | RouteOptions[]): void => {
  if (Array.isArray(options)) {
    options.map((option) => validateRouteOptions(option));
  } else if (!options.lenses) {
    throw new Error('hapi-signed-url: requires lenses in route options');
  }
};

const validatePluginOptions = (options: PluginOptions): void => {
  if (type(options.getSignedUrl) !== 'Function') {
    throw new Error('hapi-signed-url: requires getSignedUrl function while registering');
  }
};

const getRouteOptions = (request): RouteOptions[] => {
  const options = request.route.settings.plugins.signedUrl;
  return Array.isArray(options) ? options : [options];
};

const updateSignedUrl = async (
  source: object,
  routeOptions: RouteOptions,
  pluginOptions: PluginOptions,
): Promise<object> => {
  const { lenses } = routeOptions;
  const toUpdateLinks = lenses.map((lens) => view(lens, source));
  const promises = toUpdateLinks.map(
    async (link) => await pluginOptions.getSignedUrl(link),
  );
  const updatedLinks = await Promise.all(promises);
  const updatedSource = updatedLinks.reduce((source, link, index) => {
    return view(lenses[index], source) ? set(lenses[index], link, source) : source;
  }, source);
  return updatedSource;
};

const processSource = async (
  source: object | object[],
  routeOptions: RouteOptions,
  pluginOptions: PluginOptions,
): Promise<object | object[]> => {
  // single object
  if (!Array.isArray(source)) {
    return updateSignedUrl(source, routeOptions, pluginOptions);
  }

  // if source is array
  const promises = source.map(async (src) => {
    return updateSignedUrl(src, routeOptions, pluginOptions);
  });
  return Promise.all(promises);
};

const signUrl = (options: PluginOptions) => async (request, h) => {
  if (!isPluginActive(request)) {
    return h.continue;
  }
  if (isResponseAbsent(request)) {
    return h.continue;
  }

  const routeOptions = getRouteOptions(request);
  validateRouteOptions(routeOptions);
  let toUpdateResponse = request.response.source as Response;

  for (const routeOption of routeOptions) {
    const source = routeOption.pathToSource
      ? view(routeOption.pathToSource, toUpdateResponse)
      : toUpdateResponse;
    const processed = await processSource(source, routeOption, options);
    toUpdateResponse = routeOption.pathToSource
      ? set(routeOption.pathToSource, processed, toUpdateResponse)
      : processed;
  }

  request.response.source = toUpdateResponse;
  return h.continue;
};

export const signedUrl = {
  name: 'signedUrl',
  version: '1.0.0',
  register: (server, options: PluginOptions) => {
    validatePluginOptions(options);
    server.ext('onPreResponse', signUrl(options));
  },
};
