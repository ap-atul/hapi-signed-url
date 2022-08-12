import { isEmpty, isNil, view, set, type } from 'ramda';
import { RouteOptions } from './types';

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

const getRouteOptions = (request, getSignedUrl): RouteOptions => {
  const options = request.route.settings.plugins.signedUrl;
  const source = options.pathToSource
    ? view(options.pathToSource, request.response.source)
    : request.response.source;
  return {
    ...options,
    source: source,
    getSignedUrl: getSignedUrl,
  };
};

const updateSignedUrl = async (options: RouteOptions) => {
  const { source, lenses, getSignedUrl } = options;
  const toUpdateLinks: string[] = lenses.map((lens) => view(lens, source));
  const promises = toUpdateLinks.map(async (link: string) => await getSignedUrl(link));
  const updatedLinks = await Promise.all(promises);
  const updatedSource = updatedLinks.reduce((source, link, index) => {
    return view(lenses[index], source) ? set(lenses[index], link, source) : source;
  }, source);
  return updatedSource as object;
};

const processSource = async (options: RouteOptions) => {
  // single object
  if (type(options.source) !== 'Array') {
    return updateSignedUrl(options);
  }

  // if source is array
  const promises = (options.source as any[]).map(async (src) => {
    return updateSignedUrl({
      ...options,
      source: src,
    });
  });
  return Promise.all(promises);
};

const signUrl = (getSignedUrl) => async (request, h) => {
  if (!isPluginActive(request)) {
    return h.continue;
  }
  if (isResponseAbsent(request)) {
    return h.continue;
  }

  const routeOptions = getRouteOptions(request, getSignedUrl);
  const updated = await processSource(routeOptions);
  const updatedSource = routeOptions.pathToSource
    ? set(routeOptions.pathToSource, updated, request.response.source)
    : updated;

  request.response.source = updatedSource;
  return h.continue;
};

export const signedUrl = {
  name: 'signedUrl',
  version: '1.0.0',
  register: async function (server, options) {
    server.ext('onPreResponse', signUrl(options.getSignedUrl));
  },
};
