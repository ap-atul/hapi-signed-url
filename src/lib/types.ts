import { Lens } from 'ramda';

export interface RouteOptions {
  // lenses for properties to update
  lenses: Lens<object, string>[];
  // path from which source to extract
  pathToSource?: Lens<object, Response>;
}

export interface PluginOptions {
  // function to generate signed urls
  getSignedUrl(key: string): Promise<string>;
}

export type Response = object | object[];
