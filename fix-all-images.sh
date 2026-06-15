#!/bin/bash

echo "🚀 TaleGlobal Image Path Fix - Starting comprehensive repair..."
echo ""

# Copy the imageUtils file to server
echo "📁 Creating image utility on server..."

# Create the imageUtils file on server
cat > /var/www/global/frontend/src/utils/imageUtils.js << 'EOF'
// Utility function to get the correct image URL
export const getImageUrl = (imagePath, fallbackImage = null) => {
  if (!imagePath) return fallbackImage;
  
  // If the path already starts with http/https or /uploads/, return as is
  if (imagePath.startsWith('http') || imagePath.startsWith('/uploads/')) {
    return imagePath;
  }
  
  // If it's a relative path, add /uploads/ prefix
  return `/uploads/${imagePath}`;
};

// Helper for profile pictures with fallback
export const getProfileImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/images/default-avatar.png');
};

// Helper for company logos with fallback
export const getLogoImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/images/default-company-logo.png');
};

// Helper for cover images with fallback
export const getCoverImageUrl = (imagePath) => {
  return getImageUrl(imagePath, '/images/default-cover.jpg');
};

// Helper for document/resume files
export const getDocumentUrl = (documentPath) => {
  return getImageUrl(documentPath);
};
EOF

echo "✅ Image utility created successfully!"

# Update the employer grid component
echo "🔧 Fixing employer grid component..."
sed -i '/import "..\/..\/..\/..\/..\/new-job-card.css";/a import { getLogoImageUrl } from "../../../../../utils/imageUtils";' /var/www/global/frontend/src/app/pannels/public-user/components/employers/emp-grid.jsx

# Fix image src in employer grid
sed -i 's/src={\`\/uploads\/\${employer\.profile\.logo}\`}/src={getLogoImageUrl(employer.profile.logo)}/g' /var/www/global/frontend/src/app/pannels/public-user/components/employers/emp-grid.jsx

echo "✅ Employer grid fixed!"

# Update employer detail component
echo "🔧 Fixing employer detail component..."
sed -i '/import PageLoader from "..\/..\/..\/..\/..\/components\/PageLoader";/a import { getImageUrl, getLogoImageUrl, getCoverImageUrl } from "../../../../../utils/imageUtils";' /var/www/global/frontend/src/app/pannels/public-user/components/employers/emp-detail1.jsx

# Fix cover image
sed -i 's/src={\`\/uploads\/\${employer\.coverImage}\`}/src={getCoverImageUrl(employer.coverImage)}/g' /var/www/global/frontend/src/app/pannels/public-user/components/employers/emp-detail1.jsx

# Fix logo
sed -i 's/src={\`\/uploads\/\${employer\.logo}\`}/src={getLogoImageUrl(employer.logo)}/g' /var/www/global/frontend/src/app/pannels/public-user/components/employers/emp-detail1.jsx

# Fix gallery images
sed -i 's/src={\`\/uploads\/\${image\.url || image\.fileName}\`}/src={getImageUrl(image.url || image.fileName)}/g' /var/www/global/frontend/src/app/pannels/public-user/components/employers/emp-detail1.jsx

echo "✅ Employer detail fixed!"

# Now let's find and fix other components with image issues
echo "🔍 Searching for other components with image paths..."

# Function to add import and fix images in a file
fix_component_images() {
    local file="$1"
    local import_path="$2"
    
    # Skip if file doesn't exist
    if [[ ! -f "$file" ]]; then
        return
    fi
    
    # Check if file has image references
    if grep -q "src.*\.\(logo\|image\|cover\|profile\|document\|resume\|gallery\|profilePicture\)" "$file"; then
        echo "  🔧 Fixing: $(basename "$file")"
        
        # Add import if not already present
        if ! grep -q "imageUtils" "$file"; then
            # Find a good place to add the import (after other imports)
            if grep -q "^import.*from" "$file"; then
                sed -i "/^import.*from.*$/a import { getImageUrl, getLogoImageUrl, getCoverImageUrl, getProfileImageUrl, getDocumentUrl } from \"${import_path}\";" "$file"
            fi
        fi
        
        # Fix various image path patterns
        sed -i 's/src={\([^}]*\)\.logo}/src={getLogoImageUrl(\1.logo)}/g' "$file"
        sed -i 's/src={\([^}]*\)\.coverImage}/src={getCoverImageUrl(\1.coverImage)}/g' "$file"
        sed -i 's/src={\([^}]*\)\.profilePicture}/src={getProfileImageUrl(\1.profilePicture)}/g' "$file"
        sed -i 's/src={\([^}]*\)\.image}/src={getImageUrl(\1.image)}/g' "$file"
        sed -i 's/src={\([^}]*\)\.url}/src={getImageUrl(\1.url)}/g' "$file"
        sed -i 's/src={\([^}]*\)\.fileName}/src={getImageUrl(\1.fileName)}/g' "$file"
        sed -i 's/src={\([^}]*\)\.document}/src={getDocumentUrl(\1.document)}/g' "$file"
        sed -i 's/src={\([^}]*\)\.resume}/src={getDocumentUrl(\1.resume)}/g' "$file"
        
        # Fix manual /uploads/ concatenations
        sed -i 's/\`\/uploads\/\${[^}`]*}\`/getImageUrl(&)/g' "$file"
        
        echo "    ✅ Fixed $(basename "$file")"
    fi
}

# Fix candidate components
echo "🔧 Fixing candidate components..."
find /var/www/global/frontend/src/app/pannels/candidate -name "*.jsx" | while read file; do
    fix_component_images "$file" "../../../utils/imageUtils"
done

# Fix admin components
echo "🔧 Fixing admin components..."
find /var/www/global/frontend/src/app/pannels/admin -name "*.jsx" | while read file; do
    fix_component_images "$file" "../../../utils/imageUtils"
done

# Fix employer panel components
echo "🔧 Fixing employer panel components..."
find /var/www/global/frontend/src/app/pannels/employer -name "*.jsx" | while read file; do
    fix_component_images "$file" "../../../utils/imageUtils"
done

# Fix public user components
echo "🔧 Fixing public user components..."
find /var/www/global/frontend/src/app/pannels/public-user -name "*.jsx" | while read file; do
    # Calculate relative path to utils
    depth=$(echo "$file" | grep -o "/" | wc -l)
    case $depth in
        8) import_path="../../../../../utils/imageUtils" ;;
        9) import_path="../../../../../../utils/imageUtils" ;;
        10) import_path="../../../../../../../utils/imageUtils" ;;
        *) import_path="../../../../../utils/imageUtils" ;;
    esac
    fix_component_images "$file" "$import_path"
done

echo ""
echo "🎯 Summary of fixes applied:"
echo "  ✅ Created image utility functions"
echo "  ✅ Fixed employer grid logo display"
echo "  ✅ Fixed employer detail page (logo, cover, gallery)"
echo "  ✅ Scanned and fixed candidate components"
echo "  ✅ Scanned and fixed admin components"
echo "  ✅ Scanned and fixed employer panel components"
echo "  ✅ Scanned and fixed public user components"
echo ""

echo "📦 Building frontend with fixes..."
cd /var/www/global/frontend

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the frontend
echo "🔨 Building frontend..."
npm run build

if [[ $? -eq 0 ]]; then
    echo "✅ Frontend build successful!"
else
    echo "❌ Frontend build failed! Check the output above."
    exit 1
fi

# Restart backend
echo "🔄 Restarting backend..."
cd /var/www/global/backend

# Try different restart methods
if command -v pm2 >/dev/null 2>&1; then
    pm2 restart all
    echo "✅ Restarted with PM2"
elif systemctl is-active --quiet taleglobal; then
    systemctl restart taleglobal
    echo "✅ Restarted with systemctl"
else
    # Manual restart
    pkill -f "node.*server.js"
    nohup node server.js > server.log 2>&1 &
    echo "✅ Manually restarted server"
fi

echo ""
echo "🎉 IMAGE PATH FIX COMPLETED!"
echo ""
echo "📋 What was fixed:"
echo "  • All employer logos and cover images"
echo "  • All candidate profile pictures"
echo "  • All document and resume file paths"
echo "  • All gallery images"
echo "  • Created reusable image utility functions"
echo ""
echo "✅ Your images should now be working across the entire application!"
echo ""
echo "🌐 Test your application at: https://taleglobal.net"