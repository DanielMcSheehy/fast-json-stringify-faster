| Kind | Size | Mechanism | Median ops/sec | Latency RME % | Samples |
| --- | ---: | --- | ---: | ---: | ---: |
| integer | 1000 | default | 97162.84 | 0.91 | 26664 |
| integer | 1000 | json-stringify | 107135.20 | 0.69 | 29810 |
| integer | 1000 | native | 196695.52 | 0.46 | 54402 |
| number | 1000 | default | 25000.00 | 1.10 | 6825 |
| number | 1000 | json-stringify | 24615.38 | 1.17 | 6692 |
| number | 1000 | native | 44118.94 | 0.37 | 13235 |
| short-string | 1000 | default | 34985.83 | 0.74 | 9529 |
| short-string | 1000 | json-stringify | 34139.01 | 0.95 | 9237 |
| short-string | 1000 | native | 62340.25 | 4.89 | 17260 |
| long-string | 1000 | default | 5358.93 | 2.56 | 1506 |
| long-string | 1000 | json-stringify | 5426.17 | 2.08 | 1549 |
| long-string | 1000 | native | 7036.06 | 3.02 | 1926 |
| flat-object | 1000 | default | 15306.20 | 1.27 | 3937 |
| flat-object | 1000 | json-stringify | 14475.13 | 0.95 | 4201 |
| flat-object | 1000 | native | 15604.52 | 0.43 | 4567 |
| nested-object | 1000 | default | 4837.72 | 1.90 | 1287 |
| nested-object | 1000 | json-stringify | 4347.83 | 4.23 | 1145 |
| nested-object | 1000 | native | 4478.44 | 1.35 | 1280 |
| nullable-number | 1000 | default | 22620.34 | 1.48 | 6277 |
| nullable-number | 1000 | json-stringify | 24896.68 | 1.01 | 7096 |
| nullable-number | 1000 | native | 49485.35 | 0.30 | 14327 |
| Float64Array | 1000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000 | native | 19851.12 | 0.51 | 5549 |
| Int32Array | 1000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000 | native | 30131.84 | 0.68 | 8642 |
| integer | 20000 | default | 5135.88 | 4.85 | 1126 |
| integer | 20000 | json-stringify | 8099.92 | 12.74 | 2033 |
| integer | 20000 | native | 8069.92 | 0.90 | 2336 |
| number | 20000 | default | 899.48 | 2.86 | 252 |
| number | 20000 | json-stringify | 1930.11 | 13.18 | 440 |
| number | 20000 | native | 2107.67 | 15.17 | 486 |
| short-string | 20000 | default | 1384.12 | 25.08 | 288 |
| short-string | 20000 | json-stringify | 2785.19 | 16.17 | 627 |
| short-string | 20000 | native | 2752.45 | 29.79 | 516 |
| long-string | 20000 | default | 274.64 | 3.63 | 80 |
| long-string | 20000 | json-stringify | 368.93 | 2.38 | 110 |
| long-string | 20000 | native | 386.20 | 1.66 | 116 |
| flat-object | 20000 | default | 654.02 | 5.99 | 171 |
| flat-object | 20000 | json-stringify | 714.46 | 1.05 | 209 |
| flat-object | 20000 | native | 722.52 | 1.08 | 213 |
| nested-object | 20000 | default | 166.72 | 11.53 | 42 |
| nested-object | 20000 | json-stringify | 193.98 | 5.32 | 56 |
| nested-object | 20000 | native | 207.86 | 9.63 | 58 |
| nullable-number | 20000 | default | 1228.00 | 2.17 | 352 |
| nullable-number | 20000 | json-stringify | 1980.85 | 0.83 | 581 |
| nullable-number | 20000 | native | 2124.64 | 0.68 | 604 |
| Float64Array | 20000 | default | unsupported (TypeError) | — | — |
| Float64Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 20000 | native | 858.58 | 1.72 | 243 |
| Int32Array | 20000 | default | unsupported (TypeError) | — | — |
| Int32Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 20000 | native | 1362.82 | 1.73 | 378 |
| integer | 100000 | default | 837.43 | 3.54 | 231 |
| integer | 100000 | json-stringify | 1738.88 | 1.21 | 502 |
| integer | 100000 | native | 1702.19 | 1.18 | 498 |
| number | 100000 | default | 201.06 | 3.60 | 60 |
| number | 100000 | json-stringify | 439.41 | 1.70 | 134 |
| number | 100000 | native | 465.87 | 1.87 | 136 |
| short-string | 100000 | default | 321.94 | 3.24 | 91 |
| short-string | 100000 | json-stringify | 724.33 | 1.53 | 207 |
| short-string | 100000 | native | 665.11 | 1.46 | 194 |
| long-string | 100000 | default | 58.70 | 5.54 | 18 |
| long-string | 100000 | json-stringify | 81.79 | 2.13 | 25 |
| long-string | 100000 | native | 77.16 | 5.84 | 23 |
| flat-object | 100000 | default | 117.10 | 15.87 | 28 |
| flat-object | 100000 | json-stringify | 131.45 | 2.32 | 40 |
| flat-object | 100000 | native | 140.17 | 1.75 | 42 |
| nested-object | 100000 | default | 16.28 | 14.55 | 8 |
| nested-object | 100000 | json-stringify | 44.65 | 2.31 | 14 |
| nested-object | 100000 | native | 46.60 | 1.46 | 14 |
| nullable-number | 100000 | default | 243.87 | 3.26 | 71 |
| nullable-number | 100000 | json-stringify | 381.89 | 2.86 | 109 |
| nullable-number | 100000 | native | 315.53 | 8.86 | 82 |
| Float64Array | 100000 | default | unsupported (TypeError) | — | — |
| Float64Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 100000 | native | 126.01 | 4.17 | 37 |
| Int32Array | 100000 | default | unsupported (TypeError) | — | — |
| Int32Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 100000 | native | 175.37 | 11.48 | 47 |
| integer | 1000000 | default | 67.87 | 5.19 | 20 |
| integer | 1000000 | json-stringify | 147.61 | 1.42 | 44 |
| integer | 1000000 | native | 152.83 | 1.95 | 45 |
| number | 1000000 | default | 10.16 | 12.03 | 8 |
| number | 1000000 | json-stringify | 36.15 | 2.56 | 11 |
| number | 1000000 | native | 34.68 | 6.98 | 11 |
| short-string | 1000000 | default | 11.97 | 15.15 | 8 |
| short-string | 1000000 | json-stringify | 57.60 | 2.25 | 18 |
| short-string | 1000000 | native | 50.36 | 10.29 | 15 |
| long-string | 1000000 | default | 4.12 | 4.24 | 8 |
| long-string | 1000000 | json-stringify | 7.97 | 6.34 | 8 |
| long-string | 1000000 | native | 8.22 | 4.54 | 8 |
| flat-object | 1000000 | default | 3.33 | 14.50 | 8 |
| flat-object | 1000000 | json-stringify | 8.97 | 19.90 | 8 |
| flat-object | 1000000 | native | 12.66 | 15.32 | 8 |
| nested-object | 1000000 | default | 0.91 | 9.13 | 8 |
| nested-object | 1000000 | json-stringify | 4.07 | 7.06 | 8 |
| nested-object | 1000000 | native | 2.36 | 19.61 | 8 |
| nullable-number | 1000000 | default | 12.28 | 39.96 | 8 |
| nullable-number | 1000000 | json-stringify | 20.22 | 16.56 | 8 |
| nullable-number | 1000000 | native | 26.46 | 8.25 | 8 |
| Float64Array | 1000000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | native | 9.07 | 12.87 | 8 |
| Int32Array | 1000000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | native | 14.88 | 15.88 | 8 |

Typed arrays are rejected by FJS; native serializes indexed objects. Each measured call includes Buffer.byteLength().
