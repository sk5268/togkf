for file in *.html; do
    [ -f "$file" ] || continue
    sed -i '' 's|href="/togkf/|href="/|g' "$file"
done
