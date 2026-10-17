# Isolated container benchmark (Docker, node 24 linux/arm64, cpuset 4-7, 5 rounds, alternating side order)

Produced by `benchmark/docker/run.sh` + `compare.js`. Lower CV than the host run in SUMMARY.md; this table supersedes it for regression calls.


base=5f69709bed95604c8a403cd217186b528cb2fdd9 head=529a108f3be7d8ac2579423ba13a32afdf0d9d31
rounds: large=5 compile=5 full=5

## Large arrays

| Case | base ops/s | head ops/s | Change | CV base / head |
| --- | ---: | ---: | ---: | ---: |
| integer / 1000 / default | 129032.26 | 163265.31 |   26.5% | 1.4% / 1.5% |
| integer / 1000 / json-stringify | 128353.23 | 126326.43 |   -1.6% | 0.9% / 2.4% |
| integer / 1000 / native | 226398.01 | 226398.01 |   -0.0% | 0.8% / 0.4% |
| number / 1000 / default | 28985.51 | 55172.41 |   90.3% | 0.9% / 1.0% |
| number / 1000 / json-stringify | 28915.94 | 28776.98 |   -0.5% | 0.9% / 1.2% |
| number / 1000 / native | 60302.72 | 59998.80 |   -0.5% | 0.9% / 0.6% |
| short-string / 1000 / default | 44610.99 | 42403.43 |   -4.9% | 4.6% / 3.9% |
| short-string / 1000 / json-stringify | 43010.75 | 45367.93 |    5.5% | 3.9% / 3.8% |
| short-string / 1000 / native | 103896.10 | 104351.46 |    0.4% | 1.4% / 1.0% |
| long-string / 1000 / default | 8253.21 | 8210.79 |   -0.5% | 1.1% / 0.7% |
| long-string / 1000 / json-stringify | 8233.23 | 8166.07 |   -0.8% | 1.9% / 1.0% |
| long-string / 1000 / native | 10743.10 | 10709.50 |   -0.3% | 1.5% / 0.6% |
| flat-object / 1000 / default | 14814.81 | 15989.51 |    7.9% | 2.6% / 2.3% |
| flat-object / 1000 / json-stringify | 15257.62 | 16053.43 |    5.2% | 4.1% / 1.9% |
| flat-object / 1000 / native | 20547.80 | 20390.69 |   -0.8% | 0.7% / 0.7% |
| nested-object / 1000 / default | 4845.57 | 5166.86 |    6.6% | 2.7% / 1.1% |
| nested-object / 1000 / json-stringify | 5016.81 | 5280.53 |    5.3% | 2.1% / 1.2% |
| nested-object / 1000 / native | 7117.44 | 7142.86 |    0.4% | 2.9% / 0.6% |
| nullable-number / 1000 / default | 33012.02 | 32697.90 |   -1.0% | 2.2% / 3.0% |
| nullable-number / 1000 / json-stringify | 32431.73 | 32742.87 |    1.0% | 1.4% / 0.7% |
| nullable-number / 1000 / native | 65573.77 | 65573.77 |    0.0% | 0.7% / 0.7% |
| Float64Array / 1000 / native | 23483.55 | 23300.79 |   -0.8% | 1.3% / 1.2% |
| Int32Array / 1000 / native | 42328.04 | 42030.93 |   -0.7% | 1.2% / 0.6% |
| integer / 20000 / default | 5939.21 | 7912.96 |   33.2% | 2.5% / 0.5% |
| integer / 20000 / json-stringify | 12084.59 | 12072.48 |   -0.1% | 0.5% / 0.4% |
| integer / 20000 / native | 12072.63 | 12072.48 |   -0.0% | 0.7% / 0.3% |
| number / 20000 / default | 1384.27 | 2672.90 |   93.1% | 2.5% / 1.3% |
| number / 20000 / json-stringify | 2965.35 | 2998.89 |    1.1% | 1.7% / 1.4% |
| number / 20000 / native | 3001.13 | 3042.21 |    1.4% | 1.7% / 1.2% |
| short-string / 20000 / default | 1893.94 | 3920.94 |  107.0% | 6.0% / 0.8% |
| short-string / 20000 / json-stringify | 4798.07 | 4729.07 |   -1.4% | 1.3% / 1.2% |
| short-string / 20000 / native | 4722.56 | 4706.81 |   -0.3% | 1.1% / 1.0% |
| long-string / 20000 / default | 419.61 | 569.76 |   35.8% | 2.6% / 2.6% |
| long-string / 20000 / json-stringify | 573.23 | 568.06 |   -0.9% | 2.6% / 2.6% |
| long-string / 20000 / native | 567.12 | 572.81 |    1.0% | 1.9% / 4.3% |
| flat-object / 20000 / default | 707.40 | 734.17 |    3.8% | 2.9% / 2.0% |
| flat-object / 20000 / json-stringify | 972.70 | 967.08 |   -0.6% | 1.4% / 2.4% |
| flat-object / 20000 / native | 970.35 | 950.38 |   -2.1% | 1.9% / 1.2% |
| nested-object / 20000 / default | 200.21 | 209.50 |    4.6% | 4.4% / 3.2% |
| nested-object / 20000 / json-stringify | 311.93 | 312.84 |    0.3% | 1.7% / 1.5% |
| nested-object / 20000 / native | 312.89 | 314.73 |    0.6% | 1.4% / 3.4% |
| nullable-number / 20000 / default | 1541.92 | 1519.81 |   -1.4% | 1.8% / 2.2% |
| nullable-number / 20000 / json-stringify | 3035.48 | 3032.27 |   -0.1% | 1.1% / 0.8% |
| nullable-number / 20000 / native | 3060.26 | 3022.10 |   -1.2% | 1.3% / 1.1% |
| Float64Array / 20000 / native | 1046.12 | 1046.57 |    0.0% | 1.5% / 3.6% |
| Int32Array / 20000 / native | 1763.31 | 1757.47 |   -0.3% | 2.1% / 2.3% |
| integer / 100000 / default | 1050.41 | 1544.80 |   47.1% | 1.4% / 3.5% |
| integer / 100000 / json-stringify | 2238.43 | 2226.56 |   -0.5% | 0.9% / 1.5% |
| integer / 100000 / native | 2228.45 | 2227.37 |   -0.0% | 0.6% / 0.9% |
| number / 100000 / default | 261.70 | 526.07 |  101.0% | 1.1% / 5.4% |
| number / 100000 / json-stringify | 583.72 | 580.88 |   -0.5% | 0.6% / 1.4% |
| number / 100000 / native | 580.90 | 582.19 |    0.2% | 0.6% / 1.1% |
| short-string / 100000 / default | 360.52 | 685.97 |   90.3% | 5.1% / 2.2% |
| short-string / 100000 / json-stringify | 931.64 | 928.74 |   -0.3% | 1.3% / 0.9% |
| short-string / 100000 / native | 940.44 | 938.68 |   -0.2% | 1.2% / 1.3% |
| long-string / 100000 / default | 81.55 | 110.63 |   35.7% | 6.5% / 3.2% |
| long-string / 100000 / json-stringify | 113.99 | 113.59 |   -0.3% | 1.5% / 3.4% |
| long-string / 100000 / native | 115.81 | 114.11 |   -1.5% | 1.3% / 2.4% |
| flat-object / 100000 / default | 127.14 | 135.80 |    6.8% | 3.1% / 3.7% |
| flat-object / 100000 / json-stringify | 189.05 | 189.27 |    0.1% | 1.2% / 0.8% |
| flat-object / 100000 / native | 189.43 | 188.67 |   -0.4% | 2.4% / 1.5% |
| nested-object / 100000 / default | 17.42 | 18.16 |    4.3% | 4.6% / 2.6% |
| nested-object / 100000 / json-stringify | 60.57 | 59.76 |   -1.3% | 3.0% / 2.1% |
| nested-object / 100000 / native | 60.54 | 60.56 |    0.0% | 1.8% / 1.0% |
| nullable-number / 100000 / default | 283.45 | 286.77 |    1.2% | 1.5% / 3.2% |
| nullable-number / 100000 / json-stringify | 543.76 | 544.50 |    0.1% | 0.8% / 1.2% |
| nullable-number / 100000 / native | 537.01 | 541.10 |    0.8% | 3.4% / 1.9% |
| Float64Array / 100000 / native | 195.03 | 196.31 |    0.7% | 1.3% / 1.9% |
| Int32Array / 100000 / native | 318.95 | 319.46 |    0.2% | 0.4% / 1.3% |
| integer / 1000000 / default | 93.66 | 149.57 |   59.7% | 0.9% / 4.0% |
| integer / 1000000 / json-stringify | 217.91 | 217.02 |   -0.4% | 0.8% / 2.1% |
| integer / 1000000 / native | 215.01 | 215.75 |    0.3% | 0.9% / 1.5% |
| number / 1000000 / default | 19.45 | 52.22 |  168.5% | 1.3% / 1.4% |
| number / 1000000 / json-stringify | 57.62 | 57.86 |    0.4% | 1.1% / 2.1% |
| number / 1000000 / native | 57.68 | 58.28 |    1.0% | 1.4% / 1.5% |
| short-string / 1000000 / default | 15.81 | 76.44 |  383.4% | 3.4% / 1.9% |
| short-string / 1000000 / json-stringify | 92.23 | 92.31 |    0.1% | 0.3% / 2.1% |
| short-string / 1000000 / native | 91.50 | 89.27 |   -2.4% | 1.9% / 1.0% |
| long-string / 1000000 / default | 5.65 | 9.56 |   69.3% | 1.9% / 1.3% |
| long-string / 1000000 / json-stringify | 9.95 | 9.81 |   -1.4% | 2.4% / 1.9% |
| long-string / 1000000 / native | 10.01 | 9.85 |   -1.6% | 2.2% / 2.7% |
| flat-object / 1000000 / default | 4.26 | 4.59 |    7.8% | 1.2% / 0.9% |
| flat-object / 1000000 / json-stringify | 17.89 | 18.12 |    1.2% | 1.7% / 1.5% |
| flat-object / 1000000 / native | 18.23 | 18.02 |   -1.1% | 1.2% / 0.9% |
| nested-object / 1000000 / default | 1.19 | 1.18 |   -1.1% | 6.8% / 6.5% |
| nested-object / 1000000 / json-stringify | 6.10 | 6.04 |   -1.1% | 0.4% / 0.7% |
| nested-object / 1000000 / native | 6.09 | 6.05 |   -0.6% | 0.6% / 1.3% |
| nullable-number / 1000000 / default | 28.44 | 28.28 |   -0.6% | 2.6% / 3.3% |
| nullable-number / 1000000 / json-stringify | 53.35 | 53.13 |   -0.4% | 0.6% / 1.3% |
| nullable-number / 1000000 / native | 53.33 | 53.45 |    0.2% | 0.6% / 2.0% |
| Float64Array / 1000000 / native | 14.31 | 14.37 |    0.4% | 0.5% / 1.0% |
| Int32Array / 1000000 / native | 31.08 | 31.31 |    0.7% | 1.8% / 0.9% |

## Compilation

| Case | base ops/s | head ops/s | Change | CV base / head |
| --- | ---: | ---: | ---: | ---: |
| tiny | 18677.10 | 193573.36 |  936.4% | 3.0% / 2.1% |
| wide | 3739.69 | 6580.77 |   76.0% | 3.9% / 2.3% |
| deep | 8178.62 | 16967.27 |  107.5% | 2.6% / 4.5% |
| refs | 2348.38 | 2177.99 |   -7.3% | 1.6% / 1.1% |
| array-of-objects | 15655.58 | 62342.20 |  298.2% | 1.9% / 2.2% |
| oneOf-anyOf | 7965.49 | 8306.41 |    4.3% | 2.2% / 1.0% |
| standalone | 3823.48 | 6722.12 |   75.8% | 3.2% / 1.1% |

## Full benchmark/bench.js

| Case | base ops/s | head ops/s | Change | CV base / head |
| --- | ---: | ---: | ---: | ---: |
| short string | 19913979.00 | 19667464.00 |   -1.2% | 3.4% / 2.2% |
| unsafe short string | 21604424.00 | 21562383.00 |   -0.2% | 1.9% / 0.6% |
| short string with double quote | 14155693.00 | 14016038.00 |   -1.0% | 4.9% / 2.5% |
| long string without double quotes | 46550.00 | 45524.00 |   -2.2% | 3.1% / 2.5% |
| unsafe long string without double quotes | 408668.00 | 407817.00 |   -0.2% | 0.5% / 0.6% |
| long string | 40533.00 | 39580.00 |   -2.4% | 2.2% / 5.2% |
| unsafe long string | 406440.00 | 406888.00 |    0.1% | 0.4% / 1.4% |
| number | 24876181.00 | 24842189.00 |   -0.1% | 1.7% / 1.4% |
| integer | 24274742.00 | 24345690.00 |    0.3% | 1.1% / 1.1% |
| formatted date-time | 3130594.00 | 3122408.00 |   -0.3% | 1.1% / 1.0% |
| formatted date | 2896980.00 | 2865773.00 |   -1.1% | 1.1% / 1.6% |
| formatted time | 2910092.00 | 2887162.00 |   -0.8% | 1.2% / 0.7% |
| short array of numbers | 107301.00 | 142904.00 |   33.2% | 1.0% / 0.9% |
| short array of integers | 106652.00 | 145540.00 |   36.5% | 1.3% / 1.6% |
| short array of short strings | 37833.00 | 37457.00 |   -1.0% | 1.8% / 2.0% |
| short array of long strings | 36387.00 | 36130.00 |   -0.7% | 3.0% / 4.0% |
| object with number property | 23833170.00 | 23849345.00 |    0.1% | 0.5% / 0.4% |
| object with integer property | 24094207.00 | 24124612.00 |    0.1% | 0.2% / 0.5% |
| object with short string property | 17513508.00 | 17565549.00 |    0.3% | 3.7% / 1.0% |
| object with long string property | 39220.00 | 38297.00 |   -2.4% | 1.8% / 1.8% |
| object with properties of different types | 3056799.00 | 3099194.00 |    1.4% | 0.5% / 1.3% |
| simple object | 10180655.00 | 10510879.00 |    3.2% | 1.7% / 1.5% |
| simple object with required fields | 9920603.00 | 10608161.00 |    6.9% | 1.1% / 0.9% |
| oneOf external refs compile and first stringify | 1707.00 | 1587.00 |   -7.0% | 2.4% / 5.7% |
| object with const string property | 23445384.00 | 24271401.00 |    3.5% | 0.7% / 0.5% |
| object with const number property | 24645469.00 | 24257386.00 |   -1.6% | 1.7% / 2.2% |
| object with const bool property | 24632133.00 | 24562983.00 |   -0.3% | 0.6% / 1.2% |
| object with const object property | 23452627.00 | 24271116.00 |    3.5% | 0.9% / 1.1% |
| object with const null property | 24481295.00 | 24636080.00 |    0.6% | 0.4% / 0.8% |
