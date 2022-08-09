## Signed URL Plugin

This plugin allows generating a signed url for a file link/id. Useful when
using with AWS S3 sign urls for private objects.

## Basic Usage

-   Register the plugin

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

-   Dummy response

```json
{
    "file": "random_id",
    "name": "this is a file"
}
```

-   Create a lens using ramda for the above object

```js
const lens = R.lensProp<string, any>('file') // here file is the key from object
```

-   Use it in the route

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

-   Final response

```json
{
    "file": "random_id_SIGNATURE", // this value will be updated
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

### Note

-   It will work with single objects and arrays. `pathToSource` is optional field,
    use when nested objects are to be updated.
