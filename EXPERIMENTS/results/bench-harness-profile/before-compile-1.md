| Schema | Median build ms | Median builds/sec | SD ms | RME % | Samples |
| --- | ---: | ---: | ---: | ---: | ---: |
| tiny | 0.0584 | 17112.45 | 0.0521 | 14.39 | 100 |
| wide | 0.2933 | 3409.09 | 0.1174 | 6.96 | 100 |
| deep | 0.1270 | 7872.74 | 0.0667 | 8.75 | 100 |
| refs | 0.4464 | 2240.37 | 0.0956 | 4.11 | 100 |
| array-of-objects | 0.0545 | 18362.61 | 0.0338 | 10.82 | 100 |
| oneOf-anyOf | 0.1756 | 5693.95 | 0.0702 | 7.43 | 100 |
| standalone | 0.3064 | 3264.20 | 0.1092 | 6.43 | 100 |

Schema allocation, module loading and 20 warmup builds are excluded; standalone measures source generation, not loading the generated module.
