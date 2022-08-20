import * as R from 'ramda';

const generateRandomString = (): string =>
  (Math.random() + 1).toString(36).substring(7).toString();

export const getSignedUrl = async (key: string) => (key ? `SIGNED_${key}` : '');

export const getSampleObject = async (): Promise<[any, object, object]> => {
  const data = {
    type: 'png',
    image: generateRandomString(),
  };
  return [
    R.lensProp<string, any>('image'),
    data,
    {
      ...data,
      image: await getSignedUrl(data.image),
    },
  ];
};

export const getAnotherObject = async (): Promise<[any, object, object]> => {
  const data = {
    mime: 'png',
    file: generateRandomString(),
  };
  return [
    R.lensProp<string, any>('file'),
    data,
    {
      ...data,
      file: await getSignedUrl(data.file),
    },
  ];
};
