import { expect } from 'chai';
import { init } from './env/server';

const getSignedUrl = async (key: string) => (key ? `SIGNED_${key}` : '');

describe('Single object', async () => {
  const server = await init(getSignedUrl);
  const sampleImage = {
    type: 'png',
    image: 'image_id',
  };
  const sampleFile = {
    what: 'pdf',
    name: 'sample.pdf',
    file: 'file_id',
  };
  const nestedLevelOne = {
    name: 'some name',
    data: {
      ...sampleImage,
      ...sampleFile,
    },
  };
  const nestedLevelTwo = {
    name: 'some name',
    data: {
      images: {
        ...sampleImage,
        ...sampleFile,
      },
    },
  };

  const updatedSampleImage = {
    type: 'png',
    image: await getSignedUrl(sampleImage.image),
  };
  const updatedSampleFile = {
    what: 'pdf',
    name: 'sample.pdf',
    file: await getSignedUrl(sampleFile.file),
  };
  const updatedNestedLevelOne = {
    name: 'some name',
    data: {
      ...updatedSampleFile,
      ...updatedSampleImage,
    },
  };
  const updatedNestedLevelTwo = {
    name: 'some name',
    data: {
      images: {
        ...updatedSampleFile,
        ...updatedSampleImage,
      },
    },
  };

  it('should update the keys for a single value response', async () => {
    const empty = await server.inject({
      method: 'POST',
      url: '/lenses',
      payload: sampleImage,
    });

    expect(empty.result).to.eql(updatedSampleImage);

    const fileImage = await server.inject({
      method: 'POST',
      url: '/lenses',
      payload: {
        ...sampleFile,
        ...sampleImage,
      },
    });

    expect(fileImage.result).to.eql({
      ...updatedSampleImage,
      ...updatedSampleFile,
    });
  });

  it('should update the keys for a array of values in response', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/lenses',
      payload: [sampleImage, sampleFile, sampleImage, sampleFile],
    });
    const result = response.result as any[];

    expect(result.length).to.eql(4);
    expect(result).to.eql([
      updatedSampleImage,
      updatedSampleFile,
      updatedSampleImage,
      updatedSampleFile,
    ]);
  });

  it('should update the keys for a nested object in response', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/nested/level-one',
      payload: nestedLevelOne,
    });
    const result = response.result;
    expect(result).to.eql(updatedNestedLevelOne);
  });

  it('should update the keys for a nested two layers object in response', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/nested/level-two',
      payload: nestedLevelTwo,
    });
    const result = response.result;
    expect(result).to.eql(updatedNestedLevelTwo);
  });
});
