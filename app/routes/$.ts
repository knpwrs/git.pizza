import { LoaderFunction, redirect } from 'remix';
import parse from '~/utils/parse';
import search from '~/utils/search';

const plausibleEndpoint = 'https://plausible.io/api/event';

function reportToPlausible(
  text: string,
  scope: string,
  name: string,
  mode: string,
  referrer: string,
  userAgent: string,
) {
  const props = { scope, name, mode };
  const baseBody = {
    domain: 'git.pizza',
    url: `https://git.pizza/${text}`,
    referrer,
  };
  const baseOps = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': userAgent,
    },
  };
  fetch(plausibleEndpoint, {
    ...baseOps,
    body: JSON.stringify({
      ...baseBody,
      name: 'pageView',
    }),
  });
  fetch(plausibleEndpoint, {
    ...baseOps,
    body: JSON.stringify({
      ...baseBody,
      name: 'short url',
      props,
    }),
  });
}

export const loader: LoaderFunction = async ({ params, request, ...rest }) => {
  const cookieHeader = request.headers.get('Cookie') ?? '';
  const modeCookieValue = decodeURIComponent(
    /mode=(.+?)(?:;|$)/.exec(cookieHeader)?.[1] ?? '',
  );
  const scopesCookieValue = decodeURIComponent(
    /scopes=(.+?)(?:;|$)/.exec(cookieHeader)?.[1] ?? '',
  );

  const text = params['*'] ?? '';
  const { scope, name } = parse(text);
  const mode = modeCookieValue || 'newest';

  reportToPlausible(
    text,
    scope || '',
    name || '',
    mode,
    request.referrer,
    request.headers.get('User-Agent') || 'unknown',
  );

  if (!name) {
    return redirect('/');
  }

  const { repo = '/' } =
    (await search(name, scope || scopesCookieValue, mode)) ?? {};

  return redirect(repo);
};
