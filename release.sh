#!/bin/sh
interleave src/main.js -o _out.js

echo "var DEBUG = false;" > _pre.js

cat _pre.js _out.js | java -jar /home/rico/apps/closure-compiler/compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --formatting PRETTY_PRINT > deploy/game.js

rm _pre.js _out.js

