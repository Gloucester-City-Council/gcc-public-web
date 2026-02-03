#!/bin/bash

# This script refactors the taxi pages to use site templates
# It updates links, header, footer, and removes standalone CSS/JS references

for file in drivers.html operators.html information.html; do
  echo "Refactoring $file..."
  
  # Fix asset paths - update to use site assets
  sed -i 's|<link rel="stylesheet" href="styles.css">|<link rel="preload" href="/assets/images/GCC_logo.svg" as="image">\n    <link rel="preload" href="/assets/css/styles.css" as="style">\n    <link rel="stylesheet" href="/assets/css/styles.css">\n    <link rel="stylesheet" href="/assets/css/service-landing.css">|g' "$file"
  
  # Fix relative links to absolute paths
  sed -i 's|href="index.html"|href="/licensing/taxis/index.html"|g' "$file"
  sed -i 's|href="drivers.html"|href="/licensing/taxis/drivers"|g' "$file"
  sed -i 's|href="vehicles.html"|href="/licensing/taxis/vehicles"|g' "$file"
  sed -i 's|href="operators.html"|href="/licensing/taxis/operators"|g' "$file"
  sed -i 's|href="information.html"|href="/licensing/taxis/information"|g' "$file"
  
  # Fix JavaScript references
  sed -i 's|<script src="main.js" type="module"></script>|<script src="/assets/js/config.js"></script>\n    <script src="/assets/js/main.js"></script>\n    <script type="module" src="/assets/js/search-api.js"></script>|g' "$file"
  
  echo "✓ Fixed $file"
done

echo "All pages refactored!"
