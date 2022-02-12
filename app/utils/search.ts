import urlcat from 'urlcat';

export interface NpmResponseJson {
  objects: Array<{ package: { links: { repository: string } } }>;
}

export async function searchNpm(text: string) {
  const url = urlcat('https://registry.npmjs.com/-/v1/search', {
    text,
    size: 1,
  });

  const res = await fetch(url);
  const data = (await res.json()) as NpmResponseJson;

  return data.objects[0].package.links.repository;
}

export default async function search(text: string) {
  return searchNpm(text);
}
