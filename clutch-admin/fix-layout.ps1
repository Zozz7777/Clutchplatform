# Fix remaining Button and Input components in layout.tsx
$content = Get-Content "src/app/(dashboard)/layout.tsx" -Raw

# Replace all remaining Button components
$content = $content -replace '<Button', '<SnowButton'
$content = $content -replace '</Button>', '</SnowButton>'

# Replace all remaining Input components  
$content = $content -replace '<Input', '<SnowInput'
$content = $content -replace '</Input>', '</SnowInput>'

# Write back to file
Set-Content "src/app/(dashboard)/layout.tsx" $content -Encoding UTF8

Write-Host "Layout file fixed!" -ForegroundColor Green
