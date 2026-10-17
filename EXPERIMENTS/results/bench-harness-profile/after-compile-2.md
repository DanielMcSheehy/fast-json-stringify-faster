| Schema | Median build ms | Median builds/sec | SD ms | RME % | Samples |
| --- | ---: | ---: | ---: | ---: | ---: |
| tiny | 0.0754 | 13259.61 | 0.1143 | 18.64 | 100 |
| wide | 0.4419 | 2262.76 | 0.4982 | 17.49 | 100 |
| deep | 0.1614 | 6194.35 | 0.1033 | 10.19 | 100 |
| refs | 0.6055 | 1651.53 | 0.2982 | 8.24 | 100 |
| array-of-objects | 0.0860 | 11625.07 | 0.1012 | 17.06 | 100 |
| oneOf-anyOf | 0.1820 | 5495.77 | 0.1345 | 10.55 | 100 |
| standalone | 0.3540 | 2824.86 | 0.1517 | 7.35 | 100 |

Schema allocation, module loading and 20 warmup builds are excluded; standalone measures source generation, not loading the generated module.
