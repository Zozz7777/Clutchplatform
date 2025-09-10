# PowerShell script to fix theme issues and ensure light theme is properly applied
Write-Host "Starting theme fix for Clutch Admin..." -ForegroundColor Green

# Function to update a file
function Update-FileTheme {
    param([string]$FilePath)
    
    Write-Host "Updating theme in: $FilePath" -ForegroundColor Yellow
    
    # Read file content
    $content = Get-Content $FilePath -Raw
    
    # Remove hardcoded dark theme classes that might interfere
    $content = $content -replace 'dark:bg-slate-900', 'bg-white'
    $content = $content -replace 'dark:bg-slate-800', 'bg-slate-100'
    $content = $content -replace 'dark:text-white', 'text-slate-900'
    $content = $content -replace 'dark:text-slate-400', 'text-slate-600'
    $content = $content -replace 'dark:text-slate-300', 'text-slate-700'
    $content = $content -replace 'dark:border-slate-700', 'border-slate-200'
    $content = $content -replace 'dark:border-slate-800', 'border-slate-200'
    $content = $content -replace 'dark:hover:bg-slate-800', 'hover:bg-slate-50'
    $content = $content -replace 'dark:hover:bg-slate-700', 'hover:bg-slate-100'
    
    # Ensure proper Clutch red colors are used
    $content = $content -replace 'bg-gray-500', 'bg-red-500'
    $content = $content -replace 'text-gray-500', 'text-red-500'
    $content = $content -replace 'border-gray-500', 'border-red-500'
    
    # Write updated content back to file
    Set-Content $FilePath $content -Encoding UTF8
    
    Write-Host "Updated theme in: $FilePath" -ForegroundColor Green
}

# Get all TSX files that need updating
$filesToUpdate = Get-ChildItem -Recurse -Include "*.tsx" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    return $content -match "dark:" -or $content -match "bg-gray-" -or $content -match "text-gray-"
}

Write-Host "Found $($filesToUpdate.Count) files to update" -ForegroundColor Cyan

# Update each file
foreach ($file in $filesToUpdate) {
    try {
        Update-FileTheme -FilePath $file.FullName
    }
    catch {
        Write-Host "Error updating $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Theme fix completed!" -ForegroundColor Green
