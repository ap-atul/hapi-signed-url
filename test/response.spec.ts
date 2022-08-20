import * as R from 'ramda';
import { expect } from 'chai';
import { getAnotherObject, getSampleObject, getSignedUrl } from './env/factory';
import { init } from './env/server';
import { execPath } from 'process';

describe('Single object', async () => {
  it('should update the keys for a single value response', async () => {
    const [lens, original, updated] = await getSampleObject();
    let server = await init(getSignedUrl, {
      lenses: [lens],
    });
    const single = await server.inject({
      method: 'POST',
      url: '/test',
      payload: original,
    });
    expect(single.result).to.eql(updated);
  });

  it('should update the keys for a multiple value response', async () => {
    const [lens, original, updated] = await getSampleObject();
    const [anotherLens, anotherOriginal, anotherUpdated] = await getAnotherObject();
    const server = await init(getSignedUrl, {
      lenses: [lens, anotherLens],
    });
    const multiple = await server.inject({
      method: 'POSt',
      url: '/test',
      payload: {
        ...original,
        ...anotherOriginal,
      },
    });
    expect(multiple.result).to.eql({ ...anotherUpdated, ...updated });
  });

  it('should update the keys for a array of values in response', async () => {
    const [lens, original, updated] = await getSampleObject();
    const [anotherLens, anotherOriginal, anotherUpdated] = await getAnotherObject();
    const server = await init(getSignedUrl, {
      lenses: [lens, anotherLens],
    });

    const response = await server.inject({
      method: 'POST',
      url: '/test',
      payload: [original, anotherOriginal],
    });
    expect(response.result).to.eql([updated, anotherUpdated]);
  });

  it('should update the keys for a nested single object', async () => {
    const [lens, original, updated] = await getSampleObject();
    const path = R.lensPath(['documents']);
    const server = await init(getSignedUrl, {
      lenses: [lens],
      pathToSource: path,
    });

    const payload = {
      name: 'test name',
      documents: original,
    };
    const response = await server.inject({
      method: 'POST',
      url: '/test',
      payload: payload,
    });
    expect(response.result).to.eql({ ...payload, documents: updated });
  });

  it('should update the keys for a nested multiple objects', async () => {
    const [lens, original, updated] = await getSampleObject();
    const [anotherLens, anotherOriginal, anotherUpdated] = await getAnotherObject();
    const path = R.lensPath(['documents']);
    const server = await init(getSignedUrl, {
      lenses: [lens, anotherLens],
      pathToSource: path,
    });

    const payload = {
      name: 'test name',
      documents: [original, anotherOriginal],
    };
    const response = await server.inject({
      method: 'POST',
      url: '/test',
      payload: payload,
    });
    expect(response.result).to.eql({ ...payload, documents: [updated, anotherUpdated] });
  });

  it('should update the keys for a nested single object with multiple sources', async () => {
    const [lens, original, updated] = await getSampleObject();
    const path = R.lensPath(['documents']);
    const anotherPath = R.lensPath(['other']);
    const server = await init(getSignedUrl, [
      {
        lenses: [lens],
        pathToSource: path,
      },
      {
        lenses: [lens],
        pathToSource: anotherPath,
      },
    ]);

    const payload = {
      name: 'test name',
      documents: original,
      other: original,
    };
    const response = await server.inject({
      method: 'POST',
      url: '/test',
      payload: payload,
    });
    expect(response.result).to.eql({ ...payload, documents: updated, other: updated });
  });

  it('should update the keys for a nested multiple objects with multiple sources', async () => {
    const [lens, original, updated] = await getSampleObject();
    const [anotherLens, anotherOriginal, anotherUpdated] = await getAnotherObject();
    const path = R.lensPath(['documents']);
    const anotherPath = R.lensPath(['other']);
    const server = await init(getSignedUrl, [
      {
        lenses: [lens, anotherLens],
        pathToSource: path,
      },
      {
        lenses: [lens, anotherLens],
        pathToSource: anotherPath,
      },
    ]);

    const payload = {
      name: 'test name',
      documents: [original, anotherOriginal],
      other: [original, anotherOriginal],
    };
    const response = await server.inject({
      method: 'POST',
      url: '/test',
      payload: payload,
    });
    expect(response.result).to.eql({
      ...payload,
      documents: [updated, anotherUpdated],
      other: [updated, anotherUpdated],
    });
  });

  it('should update the keys for a missing key from the lenses', async () => {
    const [lens, original, updated] = await getSampleObject();
    const [anotherLens, anotherOriginal, anotherUpdated] = await getAnotherObject();
    const server = await init(getSignedUrl, {
      lenses: [lens, anotherLens], // adding another lens but not the object
    });

    const response = await server.inject({
      method: 'POST',
      url: '/test',
      payload: original,
    });
    expect(response.result).to.eql(updated);
  });
});
