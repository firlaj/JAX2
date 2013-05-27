#!/bin/sh
# Zretezeni vsech knihoven do jedne
cd src

cat core.js > ../lib/jax.js
cat node.js >> ../lib/jax.js
cat nodearray.js >> ../lib/jax.js
cat event.js >> ../lib/jax.js
cat dombuilder.js >> ../lib/jax.js
cat fx.js >> ../lib/jax.js
cat report.js >> ../lib/jax.js
echo "" >> ../lib/jax.js

cp ../dependencies/jak.js ../lib/jak.js
cp ../dependencies/interpolator.js ../lib/interpolator.js

cat ../lib/jak.js > ../lib/jax-all.js
cat ../lib/interpolator.js >> ../lib/jax-all.js
cat ../lib/jax.js >> ../lib/jax-all.js

java -jar ../bin/compiler.jar --js ../lib/jax-all.js  --js_output_file ../lib/jax-all-minified.js

cd ..