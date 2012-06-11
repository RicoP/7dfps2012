#!/bin/sh
interleave src/main.js -o _out.js

echo "var DEBUG = false;" > _pre.js

cat _pre.js _out.js | uglifyjs --unsafe > deploy/game.js

rm _pre.js _out.js

