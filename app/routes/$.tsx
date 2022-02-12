import { LoaderFunction, redirect } from 'remix';
import { request } from 'undici';
import urlcat from 'urlcat';

export const loader: LoaderFunction = async ({ params }) => {
  const { body } = await request(
    urlcat('https://registry.npmjs.com/-/v1/search', {
      text: params['*'],
      size: 1,
    }),
  );
  const data: {
    objects: Array<{ package: { links: { repository: string } } }>;
  } = await body.json();
  return redirect(data.objects[0].package.links.repository);
};
