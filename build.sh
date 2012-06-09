#!/bin/sh
interleave src/main.js -o _out.js

echo "var DEBUG = true;" > _pre.js

cat _pre.js _out.js > deploy/game.js

rm _pre.js _out.js

