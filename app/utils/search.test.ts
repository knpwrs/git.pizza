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
        objects: [{ package: { links: { repository: 'ey!' } } }],
      });
      expect(await searchNpm('test')).toBe('ey!');
    });
  });
});
