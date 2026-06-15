#!/bin/bash

echo "🔧 Fixing image paths across the entire application..."

# Frontend directory
FRONTEND_DIR="/var/www/global/frontend/src"

# Function to add image utility import to a file if not already present
add_import_if_missing() {
    local file="$1"
    local import_line="import { getImageUrl, getLogoImageUrl, getCoverImageUrl, getProfileImageUrl, getDocumentUrl } from \"../../../../../utils/imageUtils\";"
    
    if ! grep -q "imageUtils" "$file"; then
        # Find the last import line and add after it
        sed -i "/^import.*from/a\\$import_line" "$file"
        echo "  ✅ Added imageUtils import to $(basename "$file")"
    fi
}

# Function to fix image paths in a file
fix_image_paths() {
    local file="$1"
    
    # Fix various image path patterns
    sed -i 's/src={\([^}]*\)\.logo}/src={getLogoImageUrl(\1.logo)}/g' "$file"
    sed -i 's/src={\([^}]*\)\.coverImage}/src={getCoverImageUrl(\1.coverImage)}/g' "$file"
    sed -i 's/src={\([^}]*\)\.profilePicture}/src={getProfileImageUrl(\1.profilePicture)}/g' "$file"
    sed -i 's/src={\([^}]*\)\.image}/src={getImageUrl(\1.image)}/g' "$file"
    sed -i 's/src={\([^}]*\)\.url}/src={getImageUrl(\1.url)}/g' "$file"
    sed -i 's/src={\([^}]*\)\.fileName}/src={getImageUrl(\1.fileName)}/g' "$file"
    
    # Fix manual /uploads/ concatenations
    sed -i 's/src={`\/uploads\/\${[^}`]*}`}/src={getImageUrl(&)}/g' "$file"
    
    echo "  ✅ Fixed image paths in $(basename "$file")"
}

# Find all JSX files that might contain image references
echo "🔍 Finding files with image references..."

jsx_files=$(find "$FRONTEND_DIR" -name "*.jsx" -exec grep -l "src=.*\(logo\|image\|cover\|profile\|document\|resume\|gallery\)" {} \;)

echo "📄 Found $(echo "$jsx_files" | wc -l) files to fix"

for file in $jsx_files; do
    echo "🔧 Processing: $file"
    add_import_if_missing "$file"
    fix_image_paths "$file"
done

echo ""
echo "🎉 Image path fixing completed!"
echo ""
echo "📋 Summary of common patterns fixed:"
echo "  • employer.profile.logo → getLogoImageUrl(employer.profile.logo)"
echo "  • employer.coverImage → getCoverImageUrl(employer.coverImage)"
echo "  • candidate.profilePicture → getProfileImageUrl(candidate.profilePicture)"
echo "  • document.fileName → getDocumentUrl(document.fileName)"
echo "  • \`/uploads/\${filename}\` → getImageUrl(filename)"
echo ""
echo "🚀 Next steps:"
echo "  1. cd /var/www/global/frontend && npm run build"
echo "  2. pm2 restart all"
echo "  3. Test your application"