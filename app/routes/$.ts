import { LoaderFunction, redirect } from 'remix';
import parse from '~/utils/parse';
import search from '~/utils/search';

export const loader: LoaderFunction = async ({ params, request }) => {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const modeCookieValue = decodeURIComponent(
    /mode=(.+?)(?:;|$)/.exec(cookieHeader)?.[1] ?? '',
  );
  const scopesCookieValue = decodeURIComponent(
    /scopes=(.+?)(?:;|$)/.exec(cookieHeader)?.[1] ?? '',
  );

  const text = params['*'] ?? '';
  const { scope, name } = parse(text);

  if (!name) {
    return redirect('/');
  }

  const { repo = '/' } =
    (await search(
      name,
      scope || scopesCookieValue,
      modeCookieValue || 'newest',
    )) ?? {};

  return redirect(repo);
};
