# Third Party Licenses

This package (`@nonz250/ai-rotom`) bundles source code from the following
third-party libraries into `dist/index.mjs`. Their licenses and copyright
notices are reproduced below, in compliance with each license's terms.

---

## @pokesol/pokesol-text-parser-ts

- Package: `@pokesol/pokesol-text-parser-ts`
- Version: 1.0.0
- License: MIT
- Upstream tarball:
  `https://registry.npmjs.org/@pokesol/pokesol-text-parser-ts/-/pokesol-text-parser-ts-1.0.0.tgz`
- Tarball integrity (sha512):
  `tp020uhgCFjknSfcpRQwaFDH3p2wOATXpUpVVoIIU+yBv3zO5XwnzH4E/E+k8NYkALyMp+00J4sBBkQjDJKf0g==`
- Retrieved: 2026-04-23 (JST)
- Purpose: ポケソルテキスト (Showdown 風 1 匹分の育成記述) のパース。
  `import_party_from_text` ツールで一括取り込みに使用している。

### License text

```
MIT License

Copyright (c) 2024 Hikaru Kazama

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Sources and notes

- `@pokesol/pokesol-text-parser-ts` の LICENSE は npm tarball (dist) に同梱された
  `LICENSE` をそのまま転記している。

## Maintenance policy

When bumping `@pokesol/pokesol-text-parser-ts`:

1. Fetch the new tarball and replace the LICENSE block if upstream changed it.
2. Update the Version / integrity / Retrieved fields above.
