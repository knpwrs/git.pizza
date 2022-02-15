import { isString } from 'lodash';
import { JsonValue } from 'type-fest';
import search, {
  CratesResponseJson,
  fetchJson,
  GemsResponseJson,
  GemsSearchResponseJson,
  NpmResponseJson,
  PypiResponseJson,
  ResponseJson,
  searchCrates,
  searchGems,
  searchNpm,
  searchPypi,
} from './search';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function spyOnFetch<T = JsonValue>(
  responses: Array<{
    test?: RegExp;
    status?: number;
    contentType?: string;
    body: T;
  }>,
) {
  jest.spyOn(global, 'fetch').mockImplementation((...args) => {
    const url = args[0];

    if (!isString(url)) {
      return Promise.reject();
    }

    for (const {
      test = /./,
      status = 200,
      contentType = 'application/json',
      body,
    } of responses) {
      if (test.test(url)) {
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            status,
            headers: { 'Content-Type': contentType },
          }),
        );
      }
    }

    return Promise.resolve(new Response(JSON.stringify({})));
  });
}

describe('search', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    fetchJson.clear();
  });

  describe('fetchJson', () => {
    test('200 response', async () => {
      spyOnFetch([{ body: { success: true } }]);
      const res = await fetchJson('foo');
      expect(res).toEqual({ success: true });
    });

    test('404 response', async () => {
      spyOnFetch([{ status: 404, body: { success: false } }]);
      const res = await fetchJson('foo');
      expect(res).toEqual({});
    });
  });

  describe('npm', () => {
    test('searchNpm', async () => {
      spyOnFetch<NpmResponseJson>([
        {
          test: /npmjs\.com/,
          body: {
            objects: [
              {
                package: {
                  date: '2021-02-20T15:42:16.891Z',
                  links: { repository: 'https://github.com/lodash/lodash' },
                },
              },
            ],
          },
        },
      ]);
      expect(await searchNpm('lodash')).toEqual({
        timestamp: 1613835736891,
        repo: 'https://github.com/lodash/lodash',
      });
      expect(global.fetch).toBeCalledTimes(1);
      expect(global.fetch).toBeCalledWith(
        'https://registry.npmjs.com/-/v1/search?text=lodash&size=1',
      );
    });
  });

  describe('crates', () => {
    test('searchCrates', async () => {
      spyOnFetch<CratesResponseJson>([
        {
          test: /crates\.io/,
          body: {
            crates: [
              {
                updated_at: '2021-06-06T11:00:31.172403+00:00',
                repository: 'https://github.com/BurntSushi/fst',
              },
            ],
          },
        },
      ]);
      expect(await searchCrates('fst')).toEqual({
        timestamp: 1622977231172,
        repo: 'https://github.com/BurntSushi/fst',
      });
      expect(global.fetch).toBeCalledTimes(1);
    });
  });

  describe('gems', () => {
    test('searchGems', async () => {
      spyOnFetch<GemsSearchResponseJson | GemsResponseJson>([
        {
          test: /rubygems\.org\/.+\/search/,
          body: [
            {
              name: 'byebug',
            },
          ],
        },
        {
          test: /rubygems\.org\/.+\/gems/,
          body: {
            version_created_at: '2020-04-23T10:01:33.453Z',
            source_code_uri: 'https://github.com/deivid-rodriguez/byebug',
          },
        },
      ]);
      expect(await searchGems('byebug')).toEqual({
        timestamp: 1587636093453,
        repo: 'https://github.com/deivid-rodriguez/byebug',
      });
      expect(global.fetch).toBeCalledTimes(2);
    });
  });

  describe('pypi', () => {
    test('searchPypi', async () => {
      spyOnFetch<PypiResponseJson>([
        {
          test: /pypi\.org/,
          body: {
            info: {
              project_urls: {
                'Source Code': 'https://github.com/pallets/flask/',
              },
              version: '2.0.2',
            },
            releases: {
              '2.0.2': [
                {
                  upload_time_iso_8601: '2021-10-04T14:34:54.817314Z',
                },
              ],
            },
          },
        },
      ]);
      expect(await searchPypi('flask')).toEqual({
        timestamp: 1633358094817,
        repo: 'https://github.com/pallets/flask/',
      });
      expect(global.fetch).toBeCalledTimes(1);
    });
  });

  describe('all together', () => {
    describe('any', () => {
      test('npm is newest', async () => {
        spyOnFetch<ResponseJson>([
          {
            test: /npmjs\.com/,
            body: {
              objects: [
                {
                  package: {
                    date: '2021-02-20T15:42:16.891Z',
                    links: { repository: 'https://github.com/lodash/lodash' },
                  },
                },
              ],
            },
          },
          {
            test: /crates\.io/,
            body: {
              crates: [
                {
                  updated_at: '2016-12-25T14:35:55.101357+00:00',
                  repository: 'meh',
                },
              ],
            },
          },
        ]);

        const res = await search('lodash');

        expect(res).toEqual({
          repo: 'https://github.com/lodash/lodash',
          timestamp: 1613835736891,
        });

        expect(global.fetch).toBeCalledTimes(4);
      });

      test('crates is newest', async () => {
        spyOnFetch<ResponseJson>([
          {
            test: /npmjs\.com/,
            body: {
              objects: [
                {
                  package: {
                    date: '2017-02-07T03:58:00.320Z',
                    links: { repository: 'https://github.com/dropbox/zxcvbn' },
                  },
                },
              ],
            },
          },
          {
            test: /crates\.io/,
            body: {
              crates: [
                {
                  updated_at: '2021-10-11T19:53:47.159715+00:00',
                  repository: 'https://github.com/shssoichiro/zxcvbn-rs',
                },
              ],
            },
          },
        ]);

        const res = await search('zxcvbn');

        expect(res).toEqual({
          repo: 'https://github.com/shssoichiro/zxcvbn-rs',
          timestamp: 1633982027159,
        });

        expect(global.fetch).toBeCalledTimes(4);
      });

      test('no results goes to github', async () => {
        spyOnFetch([{ status: 404, body: {} }]);
        const res = await search('foo');
        expect(res).toMatchObject({ repo: 'https://github.com/search?q=foo' });
      });
    });

    describe('scoped', () => {
      test.each([
        [
          'npm',
          [
            {
              body: {
                objects: [
                  {
                    package: {
                      date: '2021-02-20T15:42:16.891Z',
                      links: { repository: 'https://github.com/lodash/lodash' },
                    },
                  },
                ],
              },
            },
          ],
          'https://github.com/lodash/lodash',
        ],
        [
          'crates',
          [
            {
              body: {
                crates: [
                  {
                    updated_at: '2021-06-06T11:00:31.172403+00:00',
                    repository: 'https://github.com/BurntSushi/fst',
                  },
                ],
              },
            },
          ],
          'https://github.com/BurntSushi/fst',
        ],
        [
          'gems',
          [
            {
              test: /rubygems\.org\/.+\/search/,
              body: [
                {
                  name: 'byebug',
                },
              ],
            },
            {
              test: /rubygems\.org\/.+\/gems/,
              body: {
                version_created_at: '2020-04-23T10:01:33.453Z',
                source_code_uri: 'https://github.com/deivid-rodriguez/byebug',
              },
            },
          ],
          'https://github.com/deivid-rodriguez/byebug',
        ],
        [
          'pypi',
          [
            {
              test: /pypi\.org/,
              body: {
                info: {
                  project_urls: {
                    'Source Code': 'https://github.com/pallets/flask/',
                  },
                  version: '2.0.2',
                },
                releases: {
                  '2.0.2': [
                    {
                      upload_time_iso_8601: '2021-10-04T14:34:54.817314Z',
                    },
                  ],
                },
              },
            },
          ],
          'https://github.com/pallets/flask/',
        ],
      ])('%s', async (scope, spyConf, url) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOnFetch(spyConf as any);
        const res = await search('__packagename__', scope);
        expect(res).toMatchObject({ repo: url });
      });
    });
  });
});
