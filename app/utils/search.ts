import { maxBy } from 'lodash';
import urlcat from 'urlcat';
import memoize from 'memoizee';
import ms from 'ms';
import type { PartialDeep } from 'type-fest';

export interface SearchResult {
  repo: string;
  timestamp: number;
}

export const fetchJson = memoize(
  async function fetchJson<T>(url: string): Promise<PartialDeep<T>> {
    const res = await fetch(url);

    if (res.status >= 400) {
      return {} as PartialDeep<T>;
    }

    const data = (await res.json()) as T;

    return data as PartialDeep<T>;
  },
  {
    maxAge: ms('1 day'),
    max: 1000,
    promise: true,
  },
);

function dateStringToMs(date: string) {
  return new Date(date).getTime();
}

export interface NpmResponseJson {
  objects: Array<{ package: { date: string; links: { repository: string } } }>;
}

export async function searchNpm(text: string): Promise<SearchResult | null> {
  const url = urlcat('https://registry.npmjs.com/-/v1/search', {
    text,
    size: 1,
  });

  const data = await fetchJson<NpmResponseJson>(url);
  const pack = data.objects?.[0]?.package;

  return pack?.links?.repository && pack?.date
    ? {
        repo: pack.links.repository,
        timestamp: dateStringToMs(pack.date),
      }
    : null;
}

export interface CratesResponseJson {
  crates: Array<{ updated_at: string; repository: string }>;
}

export async function searchCrates(q: string): Promise<SearchResult | null> {
  const url = urlcat(
    'https://crates.io/api/v1/crates?page=1&per_page=1&q=fst',
    { page: 1, per_page: 1, q: q },
  );

  const data = await fetchJson<CratesResponseJson>(url);
  const crate = data.crates?.[0];

  return crate?.repository && crate?.updated_at
    ? {
        repo: crate.repository,
        timestamp: dateStringToMs(crate.updated_at),
      }
    : null;
}

export type GemsSearchResponseJson = Array<{ name: string }>;
export interface GemsResponseJson {
  source_code_uri: string;
  version_created_at: string;
}

export async function searchGems(query: string): Promise<SearchResult | null> {
  const searchUrl = urlcat('https://rubygems.org/api/v1/search.json', {
    query,
  });

  const searchData = await fetchJson<GemsSearchResponseJson>(searchUrl);
  const gem = searchData[0];

  if (!gem) {
    return null;
  }

  const gemUrl = urlcat('https://rubygems.org/api/v1/gems/:name.json', {
    name: gem.name,
  });
  const gemData = await fetchJson<GemsResponseJson>(gemUrl);

  return gemData && gemData.source_code_uri && gemData.version_created_at
    ? {
        repo: gemData.source_code_uri,
        timestamp: dateStringToMs(gemData.version_created_at),
      }
    : null;
}

export interface PypiResponseJson {
  info: {
    project_urls: {
      'Source Code': string;
    };
    version: string;
  };
  releases: {
    [key: PypiResponseJson['info']['version']]: Array<{
      upload_time_iso_8601: string;
    }>;
  };
}

// Pypi doesn't have a search api, the name must be exact
export async function searchPypi(name: string): Promise<SearchResult | null> {
  const url = urlcat('https://pypi.org/pypi/:name/json', { name });

  const data = await fetchJson<PypiResponseJson>(url);

  return data.info?.project_urls?.['Source Code'] &&
    data.info?.version &&
    data.releases?.[data.info.version]?.[0]?.upload_time_iso_8601
    ? {
        repo: data.info.project_urls['Source Code'],
        timestamp: dateStringToMs(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          data.releases[data.info.version]![0]!.upload_time_iso_8601!,
        ),
      }
    : null;
}

export type ResponseJson =
  | NpmResponseJson
  | CratesResponseJson
  | GemsSearchResponseJson
  | GemsResponseJson
  | PypiResponseJson;

export type Scope = 'any' | 'npm' | 'crates' | 'gems' | 'pypi';

export const scopes: Array<{ label: string; value: Scope }> = [
  { label: 'Any', value: 'any' },
  { label: 'NPM', value: 'npm' },
  { label: 'Rust Crates', value: 'crates' },
  { label: 'Ruby Gems', value: 'gems' },
  { label: 'Pypi', value: 'pypi' },
];

const scopeToFn: Record<
  Scope,
  Array<(text: string) => Promise<SearchResult | null>>
> = {
  any: [searchNpm, searchCrates, searchGems, searchPypi],
  npm: [searchNpm],
  crates: [searchCrates],
  gems: [searchGems],
  pypi: [searchPypi],
};

export default async function search(text: string, scope = 'any') {
  const allRes = (
    await Promise.all(
      // TODO: cast is temporary until custom scopes are supported
      scopeToFn[scope as Scope].map((fn) => fn(text)),
    )
  ).filter((el): el is SearchResult => !!el);

  return maxBy(allRes, 'timestamp');
}
