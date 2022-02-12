import { LoaderFunction, redirect } from 'remix';
import search from '~/utils/search';

export const loader: LoaderFunction = async ({ params }) => {
  const text = params['*'] ?? '';
  const url = await search(text);
  return redirect(url);
};
