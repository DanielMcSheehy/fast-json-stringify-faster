| Schema | Median build ms | Median builds/sec | SD ms | RME % | Samples |
| --- | ---: | ---: | ---: | ---: | ---: |
| tiny | 0.0646 | 15473.89 | 0.0702 | 16.18 | 100 |
| wide | 0.3513 | 2846.47 | 0.1489 | 7.35 | 100 |
| deep | 0.1575 | 6350.03 | 0.0822 | 8.83 | 100 |
| refs | 0.5885 | 1699.30 | 0.2808 | 8.52 | 100 |
| array-of-objects | 0.0797 | 12545.71 | 0.0587 | 12.43 | 100 |
| oneOf-anyOf | 0.1996 | 5010.96 | 0.5952 | 31.01 | 100 |
| standalone | 0.3587 | 2787.62 | 0.4330 | 17.07 | 100 |

Schema allocation, module loading and 20 warmup builds are excluded; standalone measures source generation, not loading the generated module.
