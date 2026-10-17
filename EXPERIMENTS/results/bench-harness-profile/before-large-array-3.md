| Kind | Size | Mechanism | Median ops/sec | Latency RME % | Samples |
| --- | ---: | --- | ---: | ---: | ---: |
| integer | 1000 | default | 94491.17 | 36.02 | 11752 |
| integer | 1000 | json-stringify | 93747.07 | 40.17 | 11786 |
| integer | 1000 | native | 163265.31 | 23.29 | 26209 |
| number | 1000 | default | 18927.56 | 32.66 | 2597 |
| number | 1000 | json-stringify | 19753.09 | 20.07 | 3186 |
| number | 1000 | native | 39932.91 | 0.71 | 11606 |
| short-string | 1000 | default | 34833.50 | 10.58 | 7350 |
| short-string | 1000 | json-stringify | 32042.04 | 10.77 | 7675 |
| short-string | 1000 | native | 60912.47 | 9.54 | 16043 |
| long-string | 1000 | default | 5369.13 | 12.17 | 1351 |
| long-string | 1000 | json-stringify | 5760.90 | 4.28 | 1427 |
| long-string | 1000 | native | 6928.42 | 3.30 | 1795 |
| flat-object | 1000 | default | 14990.48 | 9.75 | 3253 |
| flat-object | 1000 | json-stringify | 14607.50 | 1.45 | 3911 |
| flat-object | 1000 | native | 13761.40 | 3.73 | 3761 |
| nested-object | 1000 | default | 4228.33 | 1.43 | 1209 |
| nested-object | 1000 | json-stringify | 4667.44 | 1.65 | 1243 |
| nested-object | 1000 | native | 4509.16 | 11.63 | 982 |
| nullable-number | 1000 | default | 22813.34 | 2.70 | 6088 |
| nullable-number | 1000 | json-stringify | 23188.41 | 5.84 | 5238 |
| nullable-number | 1000 | native | 38584.71 | 0.57 | 10997 |
| Float64Array | 1000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000 | native | 14571.95 | 2.38 | 3859 |
| Int32Array | 1000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000 | native | 24390.24 | 1.75 | 6888 |
| integer | 20000 | default | 4196.91 | 4.62 | 1124 |
| integer | 20000 | json-stringify | 8385.74 | 0.84 | 2394 |
| integer | 20000 | native | 8510.64 | 3.42 | 2251 |
| number | 20000 | default | 881.70 | 2.93 | 253 |
| number | 20000 | json-stringify | 2022.16 | 0.52 | 598 |
| number | 20000 | native | 2250.14 | 0.67 | 671 |
| short-string | 20000 | default | 1564.49 | 1.70 | 450 |
| short-string | 20000 | json-stringify | 2815.09 | 3.46 | 712 |
| short-string | 20000 | native | 2843.94 | 19.02 | 525 |
| long-string | 20000 | default | 269.84 | 7.18 | 74 |
| long-string | 20000 | json-stringify | 339.81 | 12.38 | 80 |
| long-string | 20000 | native | 344.95 | 15.49 | 84 |
| flat-object | 20000 | default | 604.90 | 11.74 | 151 |
| flat-object | 20000 | json-stringify | 550.55 | 36.35 | 90 |
| flat-object | 20000 | native | 616.11 | 32.66 | 95 |
| nested-object | 20000 | default | 143.39 | 19.83 | 29 |
| nested-object | 20000 | json-stringify | 195.29 | 34.29 | 39 |
| nested-object | 20000 | native | 185.88 | 28.40 | 35 |
| nullable-number | 20000 | default | 1078.36 | 21.12 | 181 |
| nullable-number | 20000 | json-stringify | 1641.08 | 1.51 | 470 |
| nullable-number | 20000 | native | 1704.67 | 1.98 | 490 |
| Float64Array | 20000 | default | unsupported (TypeError) | — | — |
| Float64Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 20000 | native | 568.79 | 10.10 | 133 |
| Int32Array | 20000 | default | unsupported (TypeError) | — | — |
| Int32Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 20000 | native | 1028.89 | 11.56 | 249 |
| integer | 100000 | default | 716.57 | 17.47 | 163 |
| integer | 100000 | json-stringify | 1568.27 | 24.95 | 324 |
| integer | 100000 | native | 1495.42 | 40.35 | 185 |
| number | 100000 | default | 133.82 | 14.28 | 35 |
| number | 100000 | json-stringify | 364.47 | 14.12 | 90 |
| number | 100000 | native | 357.63 | 5.72 | 99 |
| short-string | 100000 | default | 258.54 | 4.99 | 74 |
| short-string | 100000 | json-stringify | 549.02 | 2.01 | 158 |
| short-string | 100000 | native | 530.35 | 11.19 | 125 |
| long-string | 100000 | default | 37.89 | 17.07 | 11 |
| long-string | 100000 | json-stringify | 51.84 | 15.87 | 16 |
| long-string | 100000 | native | 68.20 | 5.21 | 21 |
| flat-object | 100000 | default | 104.68 | 16.09 | 25 |
| flat-object | 100000 | json-stringify | 125.74 | 2.49 | 38 |
| flat-object | 100000 | native | 127.73 | 1.62 | 39 |
| nested-object | 100000 | default | 15.68 | 15.07 | 8 |
| nested-object | 100000 | json-stringify | 43.88 | 1.44 | 14 |
| nested-object | 100000 | native | 44.58 | 1.51 | 14 |
| nullable-number | 100000 | default | 215.38 | 2.96 | 64 |
| nullable-number | 100000 | json-stringify | 304.85 | 9.28 | 82 |
| nullable-number | 100000 | native | 323.10 | 1.21 | 96 |
| Float64Array | 100000 | default | unsupported (TypeError) | — | — |
| Float64Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 100000 | native | 136.81 | 3.76 | 41 |
| Int32Array | 100000 | default | unsupported (TypeError) | — | — |
| Int32Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 100000 | native | 197.98 | 2.22 | 58 |
| integer | 1000000 | default | 71.36 | 1.48 | 22 |
| integer | 1000000 | json-stringify | 163.53 | 5.39 | 48 |
| integer | 1000000 | native | 155.24 | 1.61 | 46 |
| number | 1000000 | default | 14.54 | 15.70 | 8 |
| number | 1000000 | json-stringify | 41.37 | 2.20 | 13 |
| number | 1000000 | native | 40.31 | 8.07 | 12 |
| short-string | 1000000 | default | 12.72 | 23.13 | 8 |
| short-string | 1000000 | json-stringify | 54.20 | 11.15 | 15 |
| short-string | 1000000 | native | 58.19 | 4.69 | 18 |
| long-string | 1000000 | default | 3.58 | 11.19 | 8 |
| long-string | 1000000 | json-stringify | 4.30 | 18.29 | 8 |
| long-string | 1000000 | native | 3.68 | 18.53 | 8 |
| flat-object | 1000000 | default | 2.28 | 17.32 | 8 |
| flat-object | 1000000 | json-stringify | 8.80 | 15.56 | 8 |
| flat-object | 1000000 | native | 10.05 | 15.48 | 8 |
| nested-object | 1000000 | default | 0.99 | 7.40 | 8 |
| nested-object | 1000000 | json-stringify | 4.17 | 6.84 | 8 |
| nested-object | 1000000 | native | 4.67 | 4.77 | 8 |
| nullable-number | 1000000 | default | 16.75 | 3.55 | 8 |
| nullable-number | 1000000 | json-stringify | 27.98 | 2.37 | 9 |
| nullable-number | 1000000 | native | 23.72 | 17.49 | 8 |
| Float64Array | 1000000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | native | 9.12 | 23.95 | 8 |
| Int32Array | 1000000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | native | 14.41 | 17.01 | 8 |

Typed arrays are rejected by FJS; native serializes indexed objects. Each measured call includes Buffer.byteLength().
