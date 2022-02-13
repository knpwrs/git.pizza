import { maxBy } from 'lodash';
import urlcat from 'urlcat';

export interface SearchResult {
  repo: string;
  timestamp: number;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = (await res.json()) as T;

  return data;
}

function dateStringToMs(date: string) {
  return new Date(date).getTime();
}

export interface NpmResponseJson {
  objects: Array<{ package: { date: string; links: { repository?: string } } }>;
}

export async function searchNpm(text: string): Promise<SearchResult | null> {
  const url = urlcat('https://registry.npmjs.com/-/v1/search', {
    text,
    size: 1,
  });

  const data = await fetchJson<NpmResponseJson>(url);
  const pack = data.objects[0]?.package;

  return pack && pack.links.repository
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
  const crate = data.crates[0];

  return crate
    ? {
        repo: crate.repository,
        timestamp: dateStringToMs(crate.updated_at),
      }
    : null;
}

export type ResponseJson = NpmResponseJson | CratesResponseJson;

export default async function search(text: string) {
  const allRes = (
    await Promise.all([searchNpm(text), searchCrates(text)])
  ).filter((el): el is SearchResult => !!el);

  return maxBy(allRes, 'timestamp');
}
