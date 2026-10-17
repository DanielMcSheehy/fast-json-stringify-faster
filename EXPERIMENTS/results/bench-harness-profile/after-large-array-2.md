| Kind | Size | Mechanism | Median ops/sec | Latency RME % | Samples |
| --- | ---: | --- | ---: | ---: | ---: |
| integer | 1000 | default | 105730.60 | 1.31 | 28730 |
| integer | 1000 | json-stringify | 105263.16 | 0.62 | 29710 |
| integer | 1000 | native | 171438.37 | 0.44 | 50539 |
| number | 1000 | default | 23391.81 | 1.53 | 6316 |
| number | 1000 | json-stringify | 25183.84 | 1.23 | 6962 |
| number | 1000 | native | 55812.92 | 0.34 | 15427 |
| short-string | 1000 | default | 38035.83 | 1.08 | 11271 |
| short-string | 1000 | json-stringify | 37914.69 | 0.58 | 10938 |
| short-string | 1000 | native | 77172.40 | 0.45 | 21820 |
| long-string | 1000 | default | 6920.42 | 1.66 | 1939 |
| long-string | 1000 | json-stringify | 7004.25 | 1.83 | 1936 |
| long-string | 1000 | native | 9118.60 | 1.60 | 2506 |
| flat-object | 1000 | default | 16551.91 | 1.03 | 4690 |
| flat-object | 1000 | json-stringify | 16304.44 | 1.33 | 4453 |
| flat-object | 1000 | native | 15574.14 | 0.43 | 4548 |
| nested-object | 1000 | default | 4650.25 | 2.51 | 1269 |
| nested-object | 1000 | json-stringify | 4456.00 | 1.73 | 1242 |
| nested-object | 1000 | native | 4830.92 | 3.34 | 1299 |
| nullable-number | 1000 | default | 24439.72 | 1.39 | 6773 |
| nullable-number | 1000 | json-stringify | 24096.39 | 7.88 | 5794 |
| nullable-number | 1000 | native | 37037.04 | 1.18 | 10648 |
| Float64Array | 1000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000 | native | 14851.56 | 1.01 | 4314 |
| Int32Array | 1000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000 | native | 25641.03 | 0.50 | 7353 |
| integer | 20000 | default | 4853.87 | 8.61 | 1142 |
| integer | 20000 | json-stringify | 8327.57 | 11.11 | 1934 |
| integer | 20000 | native | 8374.02 | 3.48 | 2244 |
| number | 20000 | default | 930.34 | 6.18 | 235 |
| number | 20000 | json-stringify | 1961.59 | 3.47 | 569 |
| number | 20000 | native | 1945.68 | 2.24 | 551 |
| short-string | 20000 | default | 1507.16 | 7.70 | 402 |
| short-string | 20000 | json-stringify | 2830.52 | 8.06 | 677 |
| short-string | 20000 | native | 2831.52 | 5.75 | 699 |
| long-string | 20000 | default | 269.55 | 9.47 | 78 |
| long-string | 20000 | json-stringify | 338.05 | 6.80 | 92 |
| long-string | 20000 | native | 341.15 | 10.87 | 93 |
| flat-object | 20000 | default | 613.73 | 10.93 | 137 |
| flat-object | 20000 | json-stringify | 615.68 | 4.18 | 176 |
| flat-object | 20000 | native | 638.09 | 5.56 | 176 |
| nested-object | 20000 | default | 153.61 | 10.62 | 39 |
| nested-object | 20000 | json-stringify | 203.49 | 2.25 | 60 |
| nested-object | 20000 | native | 202.28 | 17.39 | 53 |
| nullable-number | 20000 | default | 1046.44 | 9.40 | 249 |
| nullable-number | 20000 | json-stringify | 1696.35 | 35.11 | 282 |
| nullable-number | 20000 | native | 1703.34 | 24.13 | 310 |
| Float64Array | 20000 | default | unsupported (TypeError) | — | — |
| Float64Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 20000 | native | 654.98 | 26.76 | 120 |
| Int32Array | 20000 | default | unsupported (TypeError) | — | — |
| Int32Array | 20000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 20000 | native | 1025.38 | 48.85 | 125 |
| integer | 100000 | default | 704.95 | 70.63 | 61 |
| integer | 100000 | json-stringify | 1563.42 | 42.75 | 161 |
| integer | 100000 | native | 1578.12 | 73.01 | 119 |
| number | 100000 | default | 151.02 | 113.93 | 13 |
| number | 100000 | json-stringify | 339.43 | 38.72 | 42 |
| number | 100000 | native | 382.05 | 60.80 | 35 |
| short-string | 100000 | default | 251.21 | 55.69 | 28 |
| short-string | 100000 | json-stringify | 524.66 | 70.78 | 39 |
| short-string | 100000 | native | 513.97 | 70.91 | 44 |
| long-string | 100000 | default | 18.23 | 46.08 | 8 |
| long-string | 100000 | json-stringify | 21.26 | 68.01 | 8 |
| long-string | 100000 | native | 29.49 | 33.89 | 10 |
| flat-object | 100000 | default | 49.65 | 46.11 | 11 |
| flat-object | 100000 | json-stringify | 50.21 | 26.19 | 16 |
| flat-object | 100000 | native | 106.39 | 63.23 | 14 |
| nested-object | 100000 | default | 13.07 | 17.09 | 8 |
| nested-object | 100000 | json-stringify | 20.89 | 21.72 | 8 |
| nested-object | 100000 | native | 22.84 | 19.31 | 8 |
| nullable-number | 100000 | default | 83.77 | 75.79 | 14 |
| nullable-number | 100000 | json-stringify | 283.17 | 63.66 | 27 |
| nullable-number | 100000 | native | 298.75 | 10.06 | 82 |
| Float64Array | 100000 | default | unsupported (TypeError) | — | — |
| Float64Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 100000 | native | 112.13 | 12.23 | 30 |
| Int32Array | 100000 | default | unsupported (TypeError) | — | — |
| Int32Array | 100000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 100000 | native | 181.31 | 4.71 | 52 |
| integer | 1000000 | default | 69.11 | 3.02 | 21 |
| integer | 1000000 | json-stringify | 158.17 | 1.37 | 47 |
| integer | 1000000 | native | 152.39 | 4.37 | 45 |
| number | 1000000 | default | 15.05 | 16.33 | 8 |
| number | 1000000 | json-stringify | 38.50 | 3.25 | 12 |
| number | 1000000 | native | 34.51 | 27.71 | 9 |
| short-string | 1000000 | default | 9.92 | 16.33 | 8 |
| short-string | 1000000 | json-stringify | 51.14 | 6.92 | 15 |
| short-string | 1000000 | native | 54.42 | 2.50 | 17 |
| long-string | 1000000 | default | 3.53 | 7.26 | 8 |
| long-string | 1000000 | json-stringify | 6.92 | 5.95 | 8 |
| long-string | 1000000 | native | 6.55 | 15.09 | 8 |
| flat-object | 1000000 | default | 4.23 | 13.81 | 8 |
| flat-object | 1000000 | json-stringify | 12.53 | 7.52 | 8 |
| flat-object | 1000000 | native | 14.63 | 2.70 | 8 |
| nested-object | 1000000 | default | 0.88 | 9.37 | 8 |
| nested-object | 1000000 | json-stringify | 3.43 | 21.34 | 8 |
| nested-object | 1000000 | native | 1.44 | 22.86 | 8 |
| nullable-number | 1000000 | default | 5.55 | 24.47 | 8 |
| nullable-number | 1000000 | json-stringify | 11.21 | 33.02 | 8 |
| nullable-number | 1000000 | native | 10.23 | 32.95 | 8 |
| Float64Array | 1000000 | default | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Float64Array | 1000000 | native | 5.65 | 32.29 | 8 |
| Int32Array | 1000000 | default | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | json-stringify | unsupported (TypeError) | — | — |
| Int32Array | 1000000 | native | 8.82 | 33.38 | 8 |

Typed arrays are rejected by FJS; native serializes indexed objects. Each measured call includes Buffer.byteLength().
