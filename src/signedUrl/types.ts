export interface RouteOptions {
    // lenses for properties to update
    lenses: any[];
    // path from which source to extract
    pathToSource: any;
    // source object can also be array
    source: object | any[];
    // function to generate signed urls
    getSignedUrl(key: string): Promise<string>;
}
