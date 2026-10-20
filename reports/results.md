# Lighthouse verification

Tested: 2026-10-20T22:34:39.827Z  
Target: http://127.0.0.1:4173  
Tool: local Lighthouse / Chrome, default mobile simulation and desktop preset. Lab scores are a snapshot, not a guarantee of field performance or search ranking. No standard GEO score exists.

| Page | Device | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| / | mobile | 96 | 100 | 100 | 100 | 1.8 s | 0 |
| / | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 |
| /en/ | mobile | 99 | 100 | 100 | 100 | 1.7 s | 0 |
| /en/ | desktop | 100 | 100 | 100 | 100 | 0.4 s | 0 |

Raw JSON and HTML reports are generated locally by `npm run audit`. They are ignored by Git.
