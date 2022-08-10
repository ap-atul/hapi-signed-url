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

  it('should update the key for a single value response', async () => {
    const empty = await server.inject({
      method: 'POST',
      url: '/lenses',
      payload: sampleImage,
    });

    expect(empty.result).to.contains(updatedSampleImage);

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

  it('should update the key for a array of values in response', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/lenses',
      payload: [sampleImage, sampleFile, sampleImage, sampleFile],
    });
    const result = response.result as any[];

    expect(result.length).to.eql(4);
    expect(result[0]).to.contains(updatedSampleImage);
    expect(result[1]).to.contains(updatedSampleFile);
    expect(result[2]).to.contains(updatedSampleImage);
    expect(result[3]).to.contains(updatedSampleFile);
  });
});
