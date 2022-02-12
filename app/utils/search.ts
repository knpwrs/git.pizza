import urlcat from 'urlcat';

export interface NpmResponseJson {
  objects: Array<{ package: { date: string; links: { repository: string } } }>;
}

export interface SearchResult {
  repo: string;
  timestamp: number;
}

export async function searchNpm(text: string): Promise<SearchResult | null> {
  const url = urlcat('https://registry.npmjs.com/-/v1/search', {
    text,
    size: 1,
  });

  const res = await fetch(url);
  const data = (await res.json()) as NpmResponseJson;
  const pack = data.objects[0]?.package;

  return pack
    ? {
        repo: pack.links.repository,
        timestamp: new Date(pack.date).getTime(),
      }
    : null;
}

export default async function search(text: string) {
  return searchNpm(text);
}
