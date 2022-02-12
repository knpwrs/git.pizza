import { NpmResponseJson, searchNpm } from './search';

function spyOnFetch<T>(body: T) {
  jest.spyOn(global, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  );
}

describe('search', () => {
  describe('npm', () => {
    test('searchNpm', async () => {
      spyOnFetch<NpmResponseJson>({
        objects: [
          {
            package: {
              date: '2021-02-20T15:42:16.891Z',
              links: { repository: 'https://github.com/lodash/lodash' },
            },
          },
        ],
      });
      expect(await searchNpm('test')).toEqual({
        timestamp: new Date('2021-02-20T15:42:16.891Z').getTime(),
        repo: 'https://github.com/lodash/lodash',
      });
    });
  });
});
