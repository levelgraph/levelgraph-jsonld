#! /bin/sh

rm -rf build
mkdir build
./node_modules/.bin/browserify -s levelgraphJSONLD index.js > build/levelgraph-jsonld.js
./node_modules/.bin/uglifyjs build/levelgraph-jsonld.js > build/levelgraph-jsonld.min.js
du -h build/*
