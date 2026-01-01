for file in *.html; do
    [ -f "$file" ] || continue.
    sed -i '' 's|"\([^"]*\)\.html"|"/togkf/\1"|g' "$file"
done
