| Kind | Size | Mechanism | Median ops/sec | Latency RME % | Samples |
| --- | ---: | --- | ---: | ---: | ---: |
| integer | 1000 | default | 120598.17 | 0.68 | 34177 |
| integer | 1000 | json-stringify | 117647.06 | 0.53 | 33598 |
| integer | 1000 | native | 212404.42 | 0.26 | 62203 |
| number | 1000 | default | 25289.57 | 1.28 | 6981 |
| number | 1000 | json-stringify | 25369.76 | 1.28 | 7061 |
| number | 1000 | native | 57142.86 | 0.28 | 16646 |
| short-string | 1000 | default | 39215.69 | 0.52 | 11477 |
| short-string | 1000 | json-stringify | 38647.34 | 0.60 | 11252 |
| short-string | 1000 | native | 81913.50 | 0.36 | 23043 |
| long-string | 1000 | default | 7298.15 | 2.77 | 1878 |
| long-string | 1000 | json-stringify | 7077.59 | 2.59 | 1851 |
| long-string | 1000 | native | 9135.92 | 2.31 | 2393 |
| flat-object | 1000 | default | 16854.03 | 1.08 | 4837 |
| flat-object | 1000 | json-stringify | 17167.38 | 1.60 | 4809 |
| flat-object | 1000 | native | 18018.02 | 0.80 | 5117 |
| nested-object | 1000 | default | 5499.55 | 1.31 | 1527 |
| nested-object | 1000 | json-stringify | 5538.91 | 1.15 | 1579 |
| nested-object | 1000 | native | 5901.88 | 0.61 | 1670 |
| nullable-number | 1000 | default | 31087.76 | 1.13 | 8730 |
| nullable-number | 1000 | json-stringify | 31331.27 | 1.11 | 8796 |
| nullable-number | 1000 | native | 50846.60 | 0.26 | 15094 |
| Float64Array | 1000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000 | native | 20548.23 | 0.32 | 6005 |
| Int32Array | 1000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000 | native | 33802.06 | 0.24 | 9973 |
| integer | 20000 | default | 5896.07 | 1.44 | 1670 |
| integer | 20000 | json-stringify | 11168.07 | 0.47 | 3259 |
| integer | 20000 | native | 11024.26 | 0.50 | 3214 |
| number | 20000 | default | 1081.56 | 2.89 | 328 |
| number | 20000 | json-stringify | 2824.86 | 1.28 | 755 |
| number | 20000 | native | 2933.09 | 1.34 | 796 |
| short-string | 20000 | default | 1780.55 | 1.70 | 510 |
| short-string | 20000 | json-stringify | 3802.89 | 1.72 | 1009 |
| short-string | 20000 | native | 3764.42 | 1.77 | 1012 |
| long-string | 20000 | default | 332.08 | 2.69 | 98 |
| long-string | 20000 | json-stringify | 443.02 | 2.61 | 129 |
| long-string | 20000 | native | 454.90 | 1.25 | 135 |
| flat-object | 20000 | default | 801.63 | 4.99 | 211 |
| flat-object | 20000 | json-stringify | 859.88 | 1.31 | 246 |
| flat-object | 20000 | native | 830.79 | 1.29 | 239 |
| nested-object | 20000 | default | 205.82 | 8.34 | 54 |
| nested-object | 20000 | json-stringify | 271.99 | 1.96 | 80 |
| nested-object | 20000 | native | 275.24 | 1.35 | 82 |
| nullable-number | 20000 | default | 1374.49 | 2.46 | 383 |
| nullable-number | 20000 | json-stringify | 2213.72 | 1.00 | 634 |
| nullable-number | 20000 | native | 2165.48 | 1.01 | 606 |
| Float64Array | 20000 | default | unsupported (TypeError) | — | — |
| Float64Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 20000 | native | 805.40 | 2.34 | 231 |
| Int32Array | 20000 | default | unsupported (TypeError) | — | — |
| Int32Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 20000 | native | 1356.32 | 2.05 | 368 |
| integer | 100000 | default | 1056.25 | 3.44 | 287 |
| integer | 100000 | json-stringify | 2103.70 | 1.38 | 578 |
| integer | 100000 | native | 2087.32 | 1.75 | 563 |
| number | 100000 | default | 213.03 | 4.64 | 61 |
| number | 100000 | json-stringify | 516.94 | 2.95 | 145 |
| number | 100000 | native | 531.46 | 2.52 | 151 |
| short-string | 100000 | default | 334.15 | 3.22 | 95 |
| short-string | 100000 | json-stringify | 637.64 | 3.12 | 191 |
| short-string | 100000 | native | 676.29 | 1.86 | 202 |
| long-string | 100000 | default | 58.59 | 6.21 | 19 |
| long-string | 100000 | json-stringify | 86.11 | 49.51 | 18 |
| long-string | 100000 | native | 85.83 | 53.96 | 16 |
| flat-object | 100000 | default | 141.76 | 13.32 | 34 |
| flat-object | 100000 | json-stringify | 158.82 | 2.11 | 48 |
| flat-object | 100000 | native | 155.86 | 1.72 | 48 |
| nested-object | 100000 | default | 17.78 | 14.90 | 8 |
| nested-object | 100000 | json-stringify | 46.59 | 2.01 | 15 |
| nested-object | 100000 | native | 50.89 | 2.24 | 16 |
| nullable-number | 100000 | default | 252.67 | 4.00 | 73 |
| nullable-number | 100000 | json-stringify | 397.78 | 1.72 | 115 |
| nullable-number | 100000 | native | 365.76 | 2.14 | 109 |
| Float64Array | 100000 | default | unsupported (TypeError) | — | — |
| Float64Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 100000 | native | 138.85 | 5.21 | 41 |
| Int32Array | 100000 | default | unsupported (TypeError) | — | — |
| Int32Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 100000 | native | 228.04 | 2.94 | 67 |
| integer | 1000000 | default | 83.32 | 2.91 | 25 |
| integer | 1000000 | json-stringify | 185.59 | 3.12 | 54 |
| integer | 1000000 | native | 165.11 | 3.45 | 50 |
| number | 1000000 | default | 15.22 | 14.22 | 8 |
| number | 1000000 | json-stringify | 45.63 | 6.90 | 14 |
| number | 1000000 | native | 47.36 | 3.13 | 15 |
| short-string | 1000000 | default | 14.51 | 6.79 | 8 |
| short-string | 1000000 | json-stringify | 57.46 | 2.71 | 18 |
| short-string | 1000000 | native | 66.09 | 2.84 | 20 |
| long-string | 1000000 | default | 4.54 | 9.41 | 8 |
| long-string | 1000000 | json-stringify | 8.47 | 4.38 | 8 |
| long-string | 1000000 | native | 8.78 | 2.97 | 8 |
| flat-object | 1000000 | default | 4.19 | 8.03 | 8 |
| flat-object | 1000000 | json-stringify | 14.67 | 3.64 | 8 |
| flat-object | 1000000 | native | 14.97 | 2.94 | 8 |
| nested-object | 1000000 | default | 1.16 | 10.77 | 8 |
| nested-object | 1000000 | json-stringify | 4.97 | 3.08 | 8 |
| nested-object | 1000000 | native | 4.91 | 2.28 | 8 |
| nullable-number | 1000000 | default | 23.21 | 6.09 | 8 |
| nullable-number | 1000000 | json-stringify | 35.31 | 2.50 | 11 |
| nullable-number | 1000000 | native | 36.26 | 2.56 | 11 |
| Float64Array | 1000000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | native | 11.39 | 10.12 | 8 |
| Int32Array | 1000000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | native | 22.37 | 18.12 | 8 |

Typed arrays are rejected by FJS; native serializes indexed objects. Each measured call includes Buffer.byteLength().
