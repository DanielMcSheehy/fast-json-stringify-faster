| Schema | Median build ms | Median builds/sec | SD ms | RME % | Samples |
| --- | ---: | ---: | ---: | ---: | ---: |
| tiny | 0.0488 | 20512.82 | 0.0402 | 14.40 | 100 |
| wide | 0.3072 | 3255.34 | 0.1068 | 6.18 | 100 |
| deep | 0.1212 | 8247.46 | 0.0481 | 6.76 | 100 |
| refs | 0.4838 | 2067.18 | 0.0935 | 3.65 | 100 |
| array-of-objects | 0.0607 | 16483.56 | 0.0379 | 10.51 | 100 |
| oneOf-anyOf | 0.1400 | 7141.79 | 0.0583 | 7.50 | 100 |
| standalone | 0.2689 | 3719.19 | 0.0795 | 5.26 | 100 |

Schema allocation, module loading and 20 warmup builds are excluded; standalone measures source generation, not loading the generated module.
