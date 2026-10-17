| Kind | Size | Mechanism | Median ops/sec | Latency RME % | Samples |
| --- | ---: | --- | ---: | ---: | ---: |
| integer | 1000 | default | 98357.43 | 64.38 | 5029 |
| integer | 1000 | json-stringify | 100000.00 | 81.94 | 5799 |
| integer | 1000 | native | 169004.56 | 60.51 | 11521 |
| number | 1000 | default | 19138.76 | 60.09 | 1428 |
| number | 1000 | json-stringify | 19559.90 | 57.66 | 1451 |
| number | 1000 | native | 41096.45 | 58.90 | 3134 |
| short-string | 1000 | default | 36309.50 | 28.37 | 1405 |
| short-string | 1000 | json-stringify | 37037.04 | 42.12 | 1703 |
| short-string | 1000 | native | 66480.52 | 36.14 | 5271 |
| long-string | 1000 | default | 5956.81 | 55.99 | 369 |
| long-string | 1000 | json-stringify | 5893.19 | 43.37 | 566 |
| long-string | 1000 | native | 4301.83 | 47.23 | 455 |
| flat-object | 1000 | default | 15727.47 | 39.98 | 777 |
| flat-object | 1000 | json-stringify | 16326.53 | 38.70 | 1067 |
| flat-object | 1000 | native | 15018.85 | 62.43 | 922 |
| nested-object | 1000 | default | 4611.84 | 85.32 | 315 |
| nested-object | 1000 | json-stringify | 4745.90 | 58.27 | 363 |
| nested-object | 1000 | native | 4924.07 | 63.21 | 239 |
| nullable-number | 1000 | default | 24792.98 | 60.27 | 806 |
| nullable-number | 1000 | json-stringify | 24767.80 | 64.23 | 1528 |
| nullable-number | 1000 | native | 40404.04 | 40.98 | 3119 |
| Float64Array | 1000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000 | native | 15594.54 | 40.42 | 921 |
| Int32Array | 1000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000 | native | 26845.64 | 57.79 | 2009 |
| integer | 20000 | default | 4823.64 | 48.60 | 256 |
| integer | 20000 | json-stringify | 8516.65 | 70.82 | 530 |
| integer | 20000 | native | 8823.52 | 74.50 | 452 |
| number | 20000 | default | 842.45 | 63.03 | 66 |
| number | 20000 | json-stringify | 2019.95 | 45.46 | 148 |
| number | 20000 | native | 2025.14 | 64.38 | 119 |
| short-string | 20000 | default | 1458.88 | 95.56 | 61 |
| short-string | 20000 | json-stringify | 3013.56 | 74.11 | 114 |
| short-string | 20000 | native | 2885.66 | 81.84 | 246 |
| long-string | 20000 | default | 244.05 | 68.61 | 26 |
| long-string | 20000 | json-stringify | 382.95 | 78.45 | 24 |
| long-string | 20000 | native | 123.25 | 47.42 | 18 |
| flat-object | 20000 | default | 593.24 | 114.10 | 19 |
| flat-object | 20000 | json-stringify | 634.42 | 139.29 | 13 |
| flat-object | 20000 | native | 370.86 | 103.44 | 33 |
| nested-object | 20000 | default | 51.12 | 94.49 | 8 |
| nested-object | 20000 | json-stringify | 115.20 | 53.76 | 17 |
| nested-object | 20000 | native | 149.59 | 78.07 | 14 |
| nullable-number | 20000 | default | 1023.22 | 62.99 | 64 |
| nullable-number | 20000 | json-stringify | 1614.73 | 40.12 | 108 |
| nullable-number | 20000 | native | 1701.89 | 53.17 | 114 |
| Float64Array | 20000 | default | unsupported (TypeError) | — | — |
| Float64Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 20000 | native | 649.67 | 37.58 | 83 |
| Int32Array | 20000 | default | unsupported (TypeError) | — | — |
| Int32Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 20000 | native | 1014.33 | 50.70 | 116 |
| integer | 100000 | default | 774.41 | 41.28 | 146 |
| integer | 100000 | json-stringify | 1663.95 | 49.66 | 210 |
| integer | 100000 | native | 1602.08 | 42.51 | 250 |
| number | 100000 | default | 96.35 | 93.64 | 13 |
| number | 100000 | json-stringify | 397.75 | 92.61 | 29 |
| number | 100000 | native | 393.65 | 68.53 | 34 |
| short-string | 100000 | default | 241.07 | 64.25 | 20 |
| short-string | 100000 | json-stringify | 525.05 | 63.91 | 40 |
| short-string | 100000 | native | 579.19 | 90.53 | 44 |
| long-string | 100000 | default | 12.48 | 40.30 | 8 |
| long-string | 100000 | json-stringify | 63.98 | 89.52 | 8 |
| long-string | 100000 | native | 26.34 | 85.37 | 8 |
| flat-object | 100000 | default | 21.03 | 65.80 | 8 |
| flat-object | 100000 | json-stringify | 51.20 | 76.85 | 9 |
| flat-object | 100000 | native | 105.59 | 113.60 | 9 |
| nested-object | 100000 | default | 3.94 | 53.61 | 8 |
| nested-object | 100000 | json-stringify | 7.46 | 28.52 | 8 |
| nested-object | 100000 | native | 12.40 | 37.21 | 8 |
| nullable-number | 100000 | default | 193.19 | 56.83 | 27 |
| nullable-number | 100000 | json-stringify | 163.79 | 44.76 | 22 |
| nullable-number | 100000 | native | 313.13 | 59.24 | 49 |
| Float64Array | 100000 | default | unsupported (TypeError) | — | — |
| Float64Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 100000 | native | 114.42 | 3.96 | 34 |
| Int32Array | 100000 | default | unsupported (TypeError) | — | — |
| Int32Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 100000 | native | 240.07 | 1.83 | 72 |
| integer | 1000000 | default | 89.69 | 2.24 | 27 |
| integer | 1000000 | json-stringify | 199.36 | 3.49 | 57 |
| integer | 1000000 | native | 191.81 | 2.59 | 57 |
| number | 1000000 | default | 17.91 | 15.54 | 8 |
| number | 1000000 | json-stringify | 54.39 | 1.40 | 17 |
| number | 1000000 | native | 54.81 | 1.05 | 17 |
| short-string | 1000000 | default | 14.98 | 13.22 | 8 |
| short-string | 1000000 | json-stringify | 71.76 | 1.57 | 22 |
| short-string | 1000000 | native | 71.39 | 2.72 | 21 |
| long-string | 1000000 | default | 4.43 | 13.57 | 8 |
| long-string | 1000000 | json-stringify | 7.09 | 48.42 | 8 |
| long-string | 1000000 | native | 7.85 | 13.75 | 8 |
| flat-object | 1000000 | default | 3.87 | 9.07 | 8 |
| flat-object | 1000000 | json-stringify | 14.72 | 2.32 | 8 |
| flat-object | 1000000 | native | 14.32 | 3.45 | 8 |
| nested-object | 1000000 | default | 0.76 | 40.86 | 8 |
| nested-object | 1000000 | json-stringify | 1.41 | 17.41 | 8 |
| nested-object | 1000000 | native | 1.39 | 19.59 | 8 |
| nullable-number | 1000000 | default | 5.60 | 43.57 | 8 |
| nullable-number | 1000000 | json-stringify | 13.17 | 15.03 | 8 |
| nullable-number | 1000000 | native | 20.71 | 40.24 | 8 |
| Float64Array | 1000000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | native | 5.96 | 23.60 | 8 |
| Int32Array | 1000000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | native | 6.40 | 25.27 | 8 |

Typed arrays are rejected by FJS; native serializes indexed objects. Each measured call includes Buffer.byteLength().
