#!/bin/sh

for file in *.html; do
    [ -f "$file" ] || continue
    sed -i '' 's|"\([^"]*\)\.html"|"/\1"|g' "$file"
done
