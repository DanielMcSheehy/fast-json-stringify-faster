| Schema | Median build ms | Median builds/sec | SD ms | RME % | Samples |
| --- | ---: | ---: | ---: | ---: | ---: |
| tiny | 0.0712 | 14043.27 | 0.0621 | 13.13 | 100 |
| wide | 0.3764 | 2656.63 | 0.1635 | 7.49 | 100 |
| deep | 0.1502 | 6656.50 | 0.0654 | 7.63 | 100 |
| refs | 0.5977 | 1673.00 | 0.1782 | 5.43 | 100 |
| array-of-objects | 0.0802 | 12464.32 | 0.0682 | 13.37 | 100 |
| oneOf-anyOf | 0.1774 | 5637.12 | 0.0833 | 7.93 | 100 |
| standalone | 0.3320 | 3012.42 | 0.1145 | 5.83 | 100 |

Schema allocation, module loading and 20 warmup builds are excluded; standalone measures source generation, not loading the generated module.
