import { isString } from 'lodash';
import search, {
  CratesResponseJson,
  NpmResponseJson,
  ResponseJson,
  searchCrates,
  searchNpm,
} from './search';

function spyOnFetch<T>(
  responses: Record<string, { status?: number; contentType?: string; body: T }>,
) {
  jest.spyOn(global, 'fetch').mockImplementation((...args) => {
    const url = args[0];

    if (!isString(url)) {
      return Promise.reject();
    }

    for (const [
      key,
      { status = 200, contentType = 'application/json', body },
    ] of Object.entries(responses)) {
      if (url.includes(key)) {
        return Promise.resolve(
          new Response(JSON.stringify(body), {
            status,
            headers: { 'Content-Type': contentType },
          }),
        );
      }
    }

    return Promise.reject();
  });
}

describe('search', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('npm', () => {
    test('searchNpm', async () => {
      spyOnFetch<NpmResponseJson>({
        npmjs: {
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
      });
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
      spyOnFetch<CratesResponseJson>({
        crates: {
          body: {
            crates: [
              {
                updated_at: '2021-06-06T11:00:31.172403+00:00',
                repository: 'https://github.com/BurntSushi/fst',
              },
            ],
          },
        },
      });
      expect(await searchCrates('fst')).toEqual({
        timestamp: 1622977231172,
        repo: 'https://github.com/BurntSushi/fst',
      });
      expect(global.fetch).toBeCalledTimes(1);
    });
  });

  describe('all together', () => {
    test('npm is newest', async () => {
      spyOnFetch<ResponseJson>({
        npmjs: {
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
        crates: {
          body: {
            crates: [
              {
                updated_at: '2016-12-25T14:35:55.101357+00:00',
                repository: 'meh',
              },
            ],
          },
        },
      });

      const res = await search('lodash');

      expect(res).toEqual({
        repo: 'https://github.com/lodash/lodash',
        timestamp: 1613835736891,
      });

      expect(global.fetch).toBeCalledTimes(2);
    });

    test('crates is newest', async () => {
      spyOnFetch<ResponseJson>({
        npmjs: {
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
        crates: {
          body: {
            crates: [
              {
                updated_at: '2021-10-11T19:53:47.159715+00:00',
                repository: 'https://github.com/shssoichiro/zxcvbn-rs',
              },
            ],
          },
        },
      });

      const res = await search('zxcvbn');

      expect(res).toEqual({
        repo: 'https://github.com/shssoichiro/zxcvbn-rs',
        timestamp: 1633982027159,
      });

      expect(global.fetch).toBeCalledTimes(2);
    });
  });
});
