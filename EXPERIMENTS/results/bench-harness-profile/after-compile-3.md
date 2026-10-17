| Schema | Median build ms | Median builds/sec | SD ms | RME % | Samples |
| --- | ---: | ---: | ---: | ---: | ---: |
| tiny | 0.0696 | 14371.22 | 0.0683 | 14.64 | 100 |
| wide | 0.4213 | 2373.65 | 0.1784 | 7.27 | 100 |
| deep | 0.1480 | 6754.86 | 0.1520 | 14.84 | 100 |
| refs | 0.5562 | 1797.95 | 0.1331 | 4.25 | 100 |
| array-of-objects | 0.0842 | 11875.36 | 0.0860 | 16.22 | 100 |
| oneOf-anyOf | 0.1706 | 5862.97 | 0.0835 | 8.44 | 100 |
| standalone | 0.3705 | 2698.90 | 0.2410 | 10.57 | 100 |

Schema allocation, module loading and 20 warmup builds are excluded; standalone measures source generation, not loading the generated module.
