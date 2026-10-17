# Isolated container benchmark (Docker, node 24 linux/arm64, cpuset 4-7, 5 rounds, alternating side order)

Produced by `benchmark/docker/run.sh` + `compare.js` on the final commit (after the ref-heavy compile fix). Lower CV than the host run in SUMMARY.md; this table supersedes it for regression calls. No case is below -2%.


base=5f69709bed95604c8a403cd217186b528cb2fdd9 head=3d2682117a3af6b4655790c674d5cac24321cb19
rounds: large=5 compile=5 full=5

## Large arrays

| Case | base ops/s | head ops/s | Change | CV base / head |
| --- | ---: | ---: | ---: | ---: |
| integer / 1000 / default | 127648.71 | 165508.11 |   29.7% | 1.1% / 1.0% |
| integer / 1000 / json-stringify | 126310.47 | 126310.47 |    0.0% | 1.8% / 1.7% |
| integer / 1000 / native | 224315.84 | 226398.01 |    0.9% | 0.5% / 0.4% |
| number / 1000 / default | 28845.88 | 55682.39 |   93.0% | 0.7% / 0.7% |
| number / 1000 / json-stringify | 28776.98 | 28998.96 |    0.8% | 0.4% / 0.5% |
| number / 1000 / native | 60302.72 | 60606.06 |    0.5% | 0.9% / 0.9% |
| short-string / 1000 / default | 42629.38 | 43635.73 |    2.4% | 4.9% / 4.0% |
| short-string / 1000 / json-stringify | 43478.26 | 43876.97 |    0.9% | 3.3% / 3.3% |
| short-string / 1000 / native | 104351.46 | 104799.83 |    0.4% | 0.5% / 1.2% |
| long-string / 1000 / default | 8171.67 | 8293.04 |    1.5% | 1.3% / 1.2% |
| long-string / 1000 / json-stringify | 8075.39 | 8241.78 |    2.1% | 0.9% / 1.7% |
| long-string / 1000 / native | 10633.21 | 10699.88 |    0.6% | 1.5% / 1.3% |
| flat-object / 1000 / default | 14953.27 | 16042.87 |    7.3% | 2.1% / 0.8% |
| flat-object / 1000 / json-stringify | 14925.37 | 16010.76 |    7.3% | 1.4% / 2.2% |
| flat-object / 1000 / native | 20495.16 | 20460.36 |   -0.2% | 0.8% / 1.4% |
| nested-object / 1000 / default | 4913.33 | 5175.77 |    5.3% | 1.7% / 2.0% |
| nested-object / 1000 / json-stringify | 4918.04 | 5273.00 |    7.2% | 1.7% / 1.6% |
| nested-object / 1000 / native | 7083.81 | 7087.98 |    0.1% | 0.7% / 0.5% |
| nullable-number / 1000 / default | 32966.31 | 32876.35 |   -0.3% | 1.4% / 1.5% |
| nullable-number / 1000 / json-stringify | 32564.80 | 32742.87 |    0.5% | 0.9% / 1.8% |
| nullable-number / 1000 / native | 66295.41 | 65397.95 |   -1.4% | 1.8% / 0.9% |
| Float64Array / 1000 / native | 23437.32 | 23121.39 |   -1.3% | 1.1% / 1.1% |
| Int32Array / 1000 / native | 42252.93 | 42178.08 |   -0.2% | 0.5% / 0.8% |
| integer / 20000 / default | 6013.48 | 7928.64 |   31.8% | 2.3% / 1.6% |
| integer / 20000 / json-stringify | 11964.16 | 12084.59 |    1.0% | 0.6% / 0.9% |
| integer / 20000 / native | 11946.29 | 12084.59 |    1.2% | 0.8% / 0.4% |
| number / 20000 / default | 1367.75 | 2672.02 |   95.4% | 1.7% / 0.5% |
| number / 20000 / json-stringify | 2993.27 | 3014.70 |    0.7% | 2.2% / 1.5% |
| number / 20000 / native | 3001.30 | 3033.73 |    1.1% | 0.2% / 1.2% |
| short-string / 20000 / default | 1920.31 | 3956.49 |  106.0% | 5.5% / 1.6% |
| short-string / 20000 / json-stringify | 4704.05 | 4705.90 |    0.0% | 1.0% / 1.7% |
| short-string / 20000 / native | 4708.50 | 4767.59 |    1.3% | 0.8% / 2.1% |
| long-string / 20000 / default | 414.42 | 561.97 |   35.6% | 1.2% / 3.9% |
| long-string / 20000 / json-stringify | 552.87 | 544.58 |   -1.5% | 2.4% / 4.8% |
| long-string / 20000 / native | 542.56 | 572.87 |    5.6% | 10.9% / 3.3% |
| flat-object / 20000 / default | 695.15 | 735.42 |    5.8% | 1.3% / 1.3% |
| flat-object / 20000 / json-stringify | 970.37 | 970.84 |    0.0% | 3.0% / 1.5% |
| flat-object / 20000 / native | 952.69 | 957.55 |    0.5% | 2.4% / 1.9% |
| nested-object / 20000 / default | 195.02 | 199.97 |    2.5% | 7.1% / 8.6% |
| nested-object / 20000 / json-stringify | 308.47 | 300.55 |   -2.6% | 2.2% / 3.5% |
| nested-object / 20000 / native | 309.39 | 311.27 |    0.6% | 1.3% / 1.6% |
| nullable-number / 20000 / default | 1506.78 | 1532.18 |    1.7% | 1.7% / 1.0% |
| nullable-number / 20000 / json-stringify | 3019.62 | 3013.93 |   -0.2% | 1.0% / 3.5% |
| nullable-number / 20000 / native | 3037.68 | 3037.02 |   -0.0% | 1.0% / 2.5% |
| Float64Array / 20000 / native | 1055.41 | 1035.60 |   -1.9% | 2.3% / 1.5% |
| Int32Array / 20000 / native | 1699.72 | 1744.95 |    2.7% | 3.0% / 2.7% |
| integer / 100000 / default | 1031.90 | 1534.82 |   48.7% | 1.1% / 1.6% |
| integer / 100000 / json-stringify | 2211.58 | 2236.02 |    1.1% | 1.5% / 1.5% |
| integer / 100000 / native | 2210.66 | 2240.61 |    1.4% | 1.5% / 0.9% |
| number / 100000 / default | 248.38 | 522.67 |  110.4% | 4.4% / 0.9% |
| number / 100000 / json-stringify | 579.73 | 583.12 |    0.6% | 4.1% / 0.7% |
| number / 100000 / native | 578.24 | 578.74 |    0.1% | 1.9% / 1.1% |
| short-string / 100000 / default | 372.54 | 687.71 |   84.6% | 5.8% / 1.1% |
| short-string / 100000 / json-stringify | 917.17 | 933.73 |    1.8% | 2.1% / 1.5% |
| short-string / 100000 / native | 921.41 | 934.95 |    1.5% | 1.6% / 1.4% |
| long-string / 100000 / default | 73.41 | 112.22 |   52.9% | 7.7% / 4.3% |
| long-string / 100000 / json-stringify | 112.89 | 116.20 |    2.9% | 3.4% / 3.9% |
| long-string / 100000 / native | 110.90 | 115.07 |    3.8% | 3.8% / 3.2% |
| flat-object / 100000 / default | 122.50 | 134.96 |   10.2% | 3.8% / 3.1% |
| flat-object / 100000 / json-stringify | 183.95 | 189.28 |    2.9% | 1.8% / 2.3% |
| flat-object / 100000 / native | 187.48 | 185.55 |   -1.0% | 2.7% / 2.6% |
| nested-object / 100000 / default | 17.16 | 17.20 |    0.3% | 2.7% / 4.6% |
| nested-object / 100000 / json-stringify | 58.97 | 60.70 |    2.9% | 3.2% / 1.0% |
| nested-object / 100000 / native | 59.02 | 59.98 |    1.6% | 3.4% / 2.1% |
| nullable-number / 100000 / default | 274.56 | 284.70 |    3.7% | 1.8% / 2.4% |
| nullable-number / 100000 / json-stringify | 530.79 | 540.19 |    1.8% | 1.2% / 1.9% |
| nullable-number / 100000 / native | 523.14 | 538.68 |    3.0% | 2.8% / 1.2% |
| Float64Array / 100000 / native | 193.20 | 194.68 |    0.8% | 3.7% / 3.1% |
| Int32Array / 100000 / native | 306.76 | 315.48 |    2.8% | 5.3% / 2.8% |
| integer / 1000000 / default | 91.65 | 144.81 |   58.0% | 7.0% / 2.8% |
| integer / 1000000 / json-stringify | 207.01 | 215.20 |    4.0% | 3.6% / 4.5% |
| integer / 1000000 / native | 212.70 | 212.18 |   -0.2% | 2.9% / 3.6% |
| number / 1000000 / default | 19.20 | 51.44 |  167.8% | 4.7% / 3.2% |
| number / 1000000 / json-stringify | 56.42 | 57.88 |    2.6% | 2.3% / 1.4% |
| number / 1000000 / native | 56.98 | 57.71 |    1.3% | 2.0% / 1.1% |
| short-string / 1000000 / default | 15.08 | 71.56 |  374.4% | 1.8% / 3.2% |
| short-string / 1000000 / json-stringify | 88.24 | 91.91 |    4.2% | 8.4% / 3.2% |
| short-string / 1000000 / native | 88.74 | 89.01 |    0.3% | 4.9% / 2.2% |
| long-string / 1000000 / default | 5.61 | 9.32 |   66.1% | 3.8% / 3.5% |
| long-string / 1000000 / json-stringify | 9.59 | 9.38 |   -2.2% | 2.6% / 3.2% |
| long-string / 1000000 / native | 9.93 | 9.63 |   -3.0% | 2.1% / 3.4% |
| flat-object / 1000000 / default | 4.15 | 4.50 |    8.6% | 3.3% / 3.7% |
| flat-object / 1000000 / json-stringify | 17.92 | 17.65 |   -1.5% | 1.7% / 2.3% |
| flat-object / 1000000 / native | 17.92 | 17.70 |   -1.2% | 1.8% / 1.8% |
| nested-object / 1000000 / default | 1.15 | 1.30 |   12.6% | 9.0% / 11.7% |
| nested-object / 1000000 / json-stringify | 5.93 | 6.04 |    1.8% | 3.4% / 2.6% |
| nested-object / 1000000 / native | 5.99 | 6.08 |    1.4% | 2.4% / 3.1% |
| nullable-number / 1000000 / default | 27.53 | 28.24 |    2.6% | 2.9% / 3.2% |
| nullable-number / 1000000 / json-stringify | 52.88 | 53.13 |    0.5% | 3.1% / 0.5% |
| nullable-number / 1000000 / native | 52.74 | 52.62 |   -0.2% | 4.7% / 3.0% |
| Float64Array / 1000000 / native | 14.05 | 14.25 |    1.4% | 1.2% / 2.5% |
| Int32Array / 1000000 / native | 30.82 | 30.84 |    0.0% | 6.4% / 3.7% |

## Compilation

| Case | base ops/s | head ops/s | Change | CV base / head |
| --- | ---: | ---: | ---: | ---: |
| tiny | 18740.63 | 189735.32 |  912.4% | 2.5% / 2.6% |
| wide | 3613.09 | 6772.02 |   87.4% | 2.7% / 3.9% |
| deep | 8193.93 | 16534.53 |  101.8% | 1.1% / 3.2% |
| refs | 2249.50 | 2774.25 |   23.3% | 5.5% / 3.4% |
| array-of-objects | 15089.56 | 60606.06 |  301.6% | 3.3% / 7.8% |
| oneOf-anyOf | 7960.17 | 7960.17 |    0.0% | 14.2% / 12.0% |
| standalone | 3665.68 | 6687.02 |   82.4% | 3.5% / 2.5% |

## Full benchmark/bench.js

| Case | base ops/s | head ops/s | Change | CV base / head |
| --- | ---: | ---: | ---: | ---: |
| short string | 19792361.00 | 19802475.00 |    0.1% | 0.9% / 2.7% |
| unsafe short string | 21424236.00 | 21651327.00 |    1.1% | 0.2% / 0.7% |
| short string with double quote | 14063143.00 | 14343175.00 |    2.0% | 1.8% / 1.9% |
| long string without double quotes | 44975.00 | 48168.00 |    7.1% | 6.6% / 3.4% |
| unsafe long string without double quotes | 402142.00 | 406711.00 |    1.1% | 0.7% / 0.5% |
| long string | 39929.00 | 39549.00 |   -1.0% | 2.2% / 2.5% |
| unsafe long string | 405712.00 | 406257.00 |    0.1% | 0.4% / 0.5% |
| number | 25048340.00 | 25036360.00 |   -0.0% | 1.5% / 1.4% |
| integer | 24306987.00 | 24234116.00 |   -0.3% | 0.6% / 0.5% |
| formatted date-time | 3086882.00 | 3077074.00 |   -0.3% | 1.3% / 1.6% |
| formatted date | 2883172.00 | 2862451.00 |   -0.7% | 0.8% / 0.7% |
| formatted time | 2887879.00 | 2877073.00 |   -0.4% | 1.5% / 1.0% |
| short array of numbers | 106622.00 | 140447.00 |   31.7% | 1.3% / 1.4% |
| short array of integers | 106886.00 | 144039.00 |   34.8% | 2.0% / 1.4% |
| short array of short strings | 36619.00 | 37488.00 |    2.4% | 4.4% / 3.8% |
| short array of long strings | 36811.00 | 36202.00 |   -1.7% | 2.6% / 2.5% |
| object with number property | 23756137.00 | 23557491.00 |   -0.8% | 0.7% / 0.9% |
| object with integer property | 24146741.00 | 24219713.00 |    0.3% | 0.6% / 0.7% |
| object with short string property | 17415745.00 | 17761049.00 |    2.0% | 4.1% / 1.0% |
| object with long string property | 38029.00 | 38200.00 |    0.4% | 1.4% / 1.6% |
| object with properties of different types | 3063131.00 | 3089757.00 |    0.9% | 1.9% / 1.3% |
| simple object | 9950116.00 | 10630504.00 |    6.8% | 2.0% / 0.8% |
| simple object with required fields | 9861701.00 | 10800322.00 |    9.5% | 2.3% / 1.0% |
| oneOf external refs compile and first stringify | 1604.00 | 1749.00 |    9.0% | 6.1% / 3.0% |
| object with const string property | 23354838.00 | 24363792.00 |    4.3% | 0.9% / 1.1% |
| object with const number property | 24585639.00 | 24385441.00 |   -0.8% | 1.6% / 1.4% |
| object with const bool property | 24319679.00 | 24228750.00 |   -0.4% | 0.9% / 1.8% |
| object with const object property | 23374260.00 | 24363516.00 |    4.2% | 0.4% / 1.7% |
| object with const null property | 24524054.00 | 24362051.00 |   -0.7% | 0.3% / 1.4% |
