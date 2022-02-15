import { LoaderFunction, redirect } from 'remix';
import parse from '~/utils/parse';
import search from '~/utils/search';

export const loader: LoaderFunction = async ({ params }) => {
  const text = params['*'] ?? '';
  const { scope, name } = parse(text);

  if (!name) {
    return redirect('/');
  }

  const { repo = '/' } = (await search(name, scope)) ?? {};

  return redirect(repo);
};
