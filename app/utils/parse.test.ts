import parse from './parse';

describe('parse', () => {
  test('parses empty string', () => {
    expect(parse('')).toEqual({ scope: undefined, name: undefined });
  });

  test('parses unscoped name', () => {
    expect(parse('foo')).toEqual({ scope: undefined, name: 'foo' });
  });

  test('parses scoped name', () => {
    expect(parse('@foo/bar')).toEqual({ scope: undefined, name: '@foo/bar' });
  });

  test('parses name with search scope', () => {
    expect(parse('foo/bar')).toEqual({ scope: 'foo', name: 'bar' });
  });

  test('parses unscoped name with search scope', () => {
    expect(parse('foo/@bar/baz')).toEqual({ scope: 'foo', name: '@bar/baz' });
  });
});
