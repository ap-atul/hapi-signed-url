## Signed URL Plugin

This plugin allows generating a signed url for a file link/id. Useful when
using with AWS S3 sign urls for private objects.

## Status

[![Package CI](https://github.com/AP-Atul/hapi-signed-url/actions/workflows/test_build.yml/badge.svg?branch=main)](https://github.com/AP-Atul/hapi-signed-url/actions/workflows/test_build.yml)

## Installation

```
npm i hapi-signed-url
```

## Route Options

| Key          | Type                             | Description                                                                 |
| ------------ | -------------------------------- | --------------------------------------------------------------------------- |
| lenses       | Lens<object, string>[]           | Array of lenses, this should be `R.lensProp<string, string>(key)`           |
| pathToSource | Lens<object, object \| object[]> | Path to the nested object, this should be `R.lensPath(['somepath', '...'])` |

## Basic Usage

- Import the plugin

```js
import { signedUrl } from 'hapi-signed-url';
```

- Register the plugin

```js
await server.register([
  {
    plugin: signedUrl,
    options: {
      getSignedUrl: (key: string): string => 'my_custom_sign', // takes in function to sign the id
    },
  },
]);
```

- Dummy response

```json
{
  "file": "random_id",
  "name": "this is a file"
}
```

- Create a lens using ramda for the above object. Ramda [lenses](!https://ramdajs.com/docs/#lensProp)

```js
const lens = R.lensProp<string, any>('file') // here file is the key from object
```

- Use it in the route

```js
server.route({
    method: 'GET',
    path: '/sample',
    options: {
        handler: handler.performAction,
        plugins: {
            // define the plugin
            signedUrl: {
                // add the array of lenses for multiple keys
                lenses: [lens],
            },
        },
        ...
    },
});
```

- Final response

```js
{
  "file": "random_id_SIGNATURE", // this value is updated
  "name": "this is a file"
}
```

### For nested objects

```js
// example response which needs to be updated
{
    name: "some name",
    more: "some more data",
    ...,
    documents: [
        {
            asset: "thisisafile", // want to update this
            other: "other details",
            ...
        }
    ]
}

// notice we dont change the basic lens
const lens = R.lensProp<string, any>('asset');

// but we add extra options, pathToSource
// you can add multiple layer of paths
const path = R.lensPath(['documents']);

// in route it looks like
server.route({
    method: 'GET',
    path: '/sample',
    options: {
        handler: handler.performAction,
        plugins: {
            signedUrl: {
                lenses: [lens],
                pathToSource: path, // add the path to source
            },
        },
        ...
    },
});
```

## For multiple nested keys

Example with multiple options

```ts
const responseObject = {
  name: 'atul',
  profile: '1212121', // to sign
  projects: [
    {
      id: '1',
      files: '1234', // to sign
    },
    {
      id: '2',
      files: '123232', // to sign
    },
  ],
};

// lenses for the entire object
const profileLens = R.lensProp<string, string>('profile');
const filesLens = R.lensProp<string, string>('files');

// path for nested object
const projectPath = R.lensPath(['projects']);

// server route config
server.route({
    method: 'GET',
    path: '/sample',
    options: {
        handler: handler.performAction,
        plugins: {
            signedUrl: [
              // for profile sign
              {
                lenses: [profileLens],
              },

              // for files signing
              {
                lenses: [fileLens],
                pathToSource: projectPath,
              }
            ]
        },
        ...
    },
});
```
