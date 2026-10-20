# Lighthouse verification

Tested: 2026-10-20T22:46:58.705Z  
Target: https://tipsbersihrumah.rezaprama.com  
Tool: local Lighthouse / Chrome, default mobile simulation and desktop preset. Lab scores are a snapshot, not a guarantee of field performance or search ranking. No standard GEO score exists.

| Page | Device | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- |
| / | mobile | 98 | 100 | 100 | 100 | 1.9 s | 0.007 |
| / | desktop | 100 | 100 | 100 | 100 | 0.6 s | 0.005 |
| /en/ | mobile | 97 | 100 | 100 | 100 | 2.1 s | 0 |
| /en/ | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 |
| /tips/kerak/ | mobile | 100 | 100 | 100 | 100 | 1.6 s | 0.026 |
| /tips/kerak/ | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0 |
| /en/tips/kerak/ | mobile | 100 | 100 | 100 | 100 | 1.5 s | 0 |
| /en/tips/kerak/ | desktop | 100 | 100 | 100 | 100 | 0.5 s | 0.012 |

Raw JSON and HTML reports are generated locally by `npm run audit`. They are ignored by Git.
