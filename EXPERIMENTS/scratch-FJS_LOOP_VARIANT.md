# Scratch notes: temporary FJS_LOOP_VARIANT switch

Applied during measurement only; removed before commit of permanent `index.js`.

Env: `FJS_LOOP_VARIANT=peel|if-i|sep|addComma` (default peel).

Helpers inserted above `buildArray`, used by both homogeneous-array codegen sites:

- if-i: `for (i=0..n) { if (i!==0) json+=','; value=obj[i]; <item> }`
- sep: `let sep=''; for (...) { json+=sep; sep=','; value=obj[i]; <item> }`
- addComma: `let addComma=false; for (...) { !addComma&&(addComma=true)||(json+=','); ... }`
- peel: baseline first-element peel

Re-run: temporarily restore helpers, then `VARIANT_RUNS=3 node benchmark/bench-loop-variants.js`.
