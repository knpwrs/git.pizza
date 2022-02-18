# git.pizza

[git.pizza][gp] is a site which redirects you to the source code of a given
package. Simply go to `git.pizza/packagename` and you will be redirected to the
source code. You can also go directly to [git.pizza][gp] to use the search UI
and change settings.

Currently [git.pizza][gp] supports the following package registries:

- [npm](https://npmjs.org)
- [crates](https://crates.io)
- [RubyGems.org](https://rubygems.org/)
- [PyPI](https://pypi.org/)

Feel free to open issues requesting more registries!

## Scoped Search

You can scope your search to a particular package registry like so:

```
https://git.pizza/npm/packagename
https://git.pizza/crates/packagename
https://git.pizza/gems/packagename
https://git.pizza/python/packagename
```

You can scope to multiple package registries as well:

```
https://git.pizza/npm,crates/packagename
```

And prefix matches on scope are supported. The following will search for both
Ruby and Rust packages:

```
https://git.pizza/ru/packagename
```

## Fallback

If the package you are looking for cannot be found, or the package registry
doesn't have a repostiory linked, you will be redirected to a search on Github.

## WHy git.pizza?

Why not? It's memorable and it was available.

[gp]: https://git.pizza
