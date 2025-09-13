import ImageKit from 'imagekit';

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_SECRET_KEY as string,
  urlEndpoint: 'https://ik.imagekit.io/vaibhavagar/',
});
