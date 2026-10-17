| Kind | Size | Mechanism | Median ops/sec | Latency RME % | Samples |
| --- | ---: | --- | ---: | ---: | ---: |
| integer | 1000 | default | 110095.78 | 2.45 | 29271 |
| integer | 1000 | json-stringify | 123701.14 | 0.68 | 33517 |
| integer | 1000 | native | 190476.19 | 0.42 | 53405 |
| number | 1000 | default | 21759.00 | 1.29 | 6363 |
| number | 1000 | json-stringify | 23809.52 | 1.21 | 6404 |
| number | 1000 | native | 52061.64 | 0.38 | 14277 |
| short-string | 1000 | default | 40000.00 | 0.72 | 11040 |
| short-string | 1000 | json-stringify | 39151.20 | 0.54 | 11430 |
| short-string | 1000 | native | 81353.73 | 0.32 | 22829 |
| long-string | 1000 | default | 7007.32 | 1.90 | 1920 |
| long-string | 1000 | json-stringify | 6954.49 | 2.09 | 1871 |
| long-string | 1000 | native | 8898.78 | 2.10 | 2313 |
| flat-object | 1000 | default | 16678.06 | 1.23 | 4609 |
| flat-object | 1000 | json-stringify | 16585.95 | 1.07 | 4601 |
| flat-object | 1000 | native | 17505.47 | 0.39 | 5021 |
| nested-object | 1000 | default | 5302.69 | 1.12 | 1510 |
| nested-object | 1000 | json-stringify | 5102.04 | 1.42 | 1450 |
| nested-object | 1000 | native | 5078.28 | 3.18 | 1467 |
| nullable-number | 1000 | default | 25343.40 | 1.33 | 7358 |
| nullable-number | 1000 | json-stringify | 26143.79 | 1.73 | 7615 |
| nullable-number | 1000 | native | 41884.82 | 0.38 | 13192 |
| Float64Array | 1000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000 | native | 18619.20 | 0.59 | 5117 |
| Int32Array | 1000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000 | native | 32128.51 | 0.43 | 8820 |
| integer | 20000 | default | 5737.50 | 1.37 | 1594 |
| integer | 20000 | json-stringify | 10719.03 | 0.81 | 2936 |
| integer | 20000 | native | 10999.04 | 4.89 | 2767 |
| number | 20000 | default | 1016.37 | 2.70 | 288 |
| number | 20000 | json-stringify | 2619.94 | 0.72 | 760 |
| number | 20000 | native | 2635.33 | 1.11 | 746 |
| short-string | 20000 | default | 1720.74 | 2.00 | 486 |
| short-string | 20000 | json-stringify | 3102.38 | 3.90 | 837 |
| short-string | 20000 | native | 3114.46 | 2.13 | 909 |
| long-string | 20000 | default | 307.90 | 3.26 | 88 |
| long-string | 20000 | json-stringify | 427.60 | 5.00 | 120 |
| long-string | 20000 | native | 429.07 | 2.67 | 125 |
| flat-object | 20000 | default | 709.37 | 10.67 | 163 |
| flat-object | 20000 | json-stringify | 699.52 | 3.43 | 201 |
| flat-object | 20000 | native | 794.97 | 1.26 | 231 |
| nested-object | 20000 | default | 183.97 | 7.84 | 50 |
| nested-object | 20000 | json-stringify | 233.64 | 2.75 | 71 |
| nested-object | 20000 | native | 229.40 | 4.36 | 67 |
| nullable-number | 20000 | default | 1314.74 | 2.43 | 372 |
| nullable-number | 20000 | json-stringify | 2158.17 | 0.85 | 618 |
| nullable-number | 20000 | native | 2140.28 | 0.99 | 614 |
| Float64Array | 20000 | default | unsupported (TypeError) | — | — |
| Float64Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 20000 | native | 805.67 | 2.11 | 232 |
| Int32Array | 20000 | default | unsupported (TypeError) | — | — |
| Int32Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 20000 | native | 1329.79 | 1.54 | 375 |
| integer | 100000 | default | 1030.57 | 3.80 | 274 |
| integer | 100000 | json-stringify | 2086.41 | 1.43 | 571 |
| integer | 100000 | native | 2022.59 | 1.31 | 568 |
| number | 100000 | default | 203.68 | 3.99 | 61 |
| number | 100000 | json-stringify | 436.01 | 2.54 | 135 |
| number | 100000 | native | 493.07 | 2.27 | 142 |
| short-string | 100000 | default | 324.11 | 4.10 | 91 |
| short-string | 100000 | json-stringify | 620.63 | 1.83 | 186 |
| short-string | 100000 | native | 710.84 | 1.65 | 205 |
| long-string | 100000 | default | 59.55 | 5.35 | 19 |
| long-string | 100000 | json-stringify | 90.00 | 1.55 | 27 |
| long-string | 100000 | native | 93.06 | 1.75 | 28 |
| flat-object | 100000 | default | 143.45 | 13.91 | 33 |
| flat-object | 100000 | json-stringify | 154.79 | 1.70 | 46 |
| flat-object | 100000 | native | 151.81 | 1.82 | 46 |
| nested-object | 100000 | default | 17.80 | 12.20 | 8 |
| nested-object | 100000 | json-stringify | 49.23 | 2.47 | 15 |
| nested-object | 100000 | native | 49.01 | 2.72 | 15 |
| nullable-number | 100000 | default | 217.69 | 4.46 | 66 |
| nullable-number | 100000 | json-stringify | 336.08 | 2.77 | 104 |
| nullable-number | 100000 | native | 333.84 | 2.30 | 99 |
| Float64Array | 100000 | default | unsupported (TypeError) | — | — |
| Float64Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 100000 | native | 134.92 | 4.86 | 40 |
| Int32Array | 100000 | default | unsupported (TypeError) | — | — |
| Int32Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 100000 | native | 216.96 | 2.68 | 65 |
| integer | 1000000 | default | 84.57 | 3.10 | 26 |
| integer | 1000000 | json-stringify | 172.48 | 3.30 | 52 |
| integer | 1000000 | native | 170.14 | 2.98 | 51 |
| number | 1000000 | default | 15.97 | 15.01 | 8 |
| number | 1000000 | json-stringify | 46.61 | 3.36 | 15 |
| number | 1000000 | native | 44.01 | 4.60 | 14 |
| short-string | 1000000 | default | 14.26 | 12.72 | 8 |
| short-string | 1000000 | json-stringify | 64.08 | 2.33 | 20 |
| short-string | 1000000 | native | 64.79 | 2.72 | 20 |
| long-string | 1000000 | default | 4.40 | 8.97 | 8 |
| long-string | 1000000 | json-stringify | 8.78 | 2.73 | 8 |
| long-string | 1000000 | native | 8.48 | 3.23 | 8 |
| flat-object | 1000000 | default | 4.19 | 13.06 | 8 |
| flat-object | 1000000 | json-stringify | 15.31 | 1.33 | 8 |
| flat-object | 1000000 | native | 15.86 | 1.64 | 8 |
| nested-object | 1000000 | default | 1.20 | 8.70 | 8 |
| nested-object | 1000000 | json-stringify | 4.55 | 1.27 | 8 |
| nested-object | 1000000 | native | 4.86 | 1.28 | 8 |
| nullable-number | 1000000 | default | 24.42 | 1.60 | 8 |
| nullable-number | 1000000 | json-stringify | 35.19 | 2.21 | 11 |
| nullable-number | 1000000 | native | 34.09 | 3.10 | 11 |
| Float64Array | 1000000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | native | 11.57 | 12.50 | 8 |
| Int32Array | 1000000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | native | 20.33 | 17.50 | 8 |

Typed arrays are rejected by FJS; native serializes indexed objects. Each measured call includes Buffer.byteLength().
