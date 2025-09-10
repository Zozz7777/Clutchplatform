# Comprehensive script to fix all legacy components to SnowUI
Write-Host "Starting comprehensive SnowUI migration..." -ForegroundColor Green

# Function to update a file
function Update-FileToSnowUI {
    param([string]$FilePath)
    
    Write-Host "Updating: $FilePath" -ForegroundColor Yellow
    
    # Read file content
    $content = Get-Content $FilePath -Raw
    
    # Replace Button imports
    $content = $content -replace 'import \{ Button \} from ''@/components/ui/button''', 'import { SnowButton } from ''@/components/ui/snow-button'''
    
    # Replace Card imports
    $content = $content -replace 'import \{ Card, CardContent, CardDescription, CardHeader, CardTitle \} from ''@/components/ui/card''', 'import { SnowCard, SnowCardContent, SnowCardDescription, SnowCardHeader, SnowCardTitle } from ''@/components/ui/snow-card'''
    
    # Replace Input imports
    $content = $content -replace 'import \{ Input \} from ''@/components/ui/input''', 'import { SnowInput } from ''@/components/ui/snow-input'''
    
    # Replace Button component usage (both opening and closing tags)
    $content = $content -replace '<Button', '<SnowButton'
    $content = $content -replace '</Button>', '</SnowButton>'
    
    # Replace Card component usage
    $content = $content -replace '<Card', '<SnowCard'
    $content = $content -replace '</Card>', '</SnowCard>'
    $content = $content -replace '<CardHeader', '<SnowCardHeader'
    $content = $content -replace '</CardHeader>', '</SnowCardHeader>'
    $content = $content -replace '<CardContent', '<SnowCardContent'
    $content = $content -replace '</CardContent>', '</SnowCardContent>'
    $content = $content -replace '<CardTitle', '<SnowCardTitle'
    $content = $content -replace '</CardTitle>', '</SnowCardTitle>'
    $content = $content -replace '<CardDescription', '<SnowCardDescription'
    $content = $content -replace '</CardDescription>', '</SnowCardDescription>'
    
    # Replace Input component usage
    $content = $content -replace '<Input', '<SnowInput'
    $content = $content -replace '</Input>', '</SnowInput>'
    
    # Write updated content back to file
    Set-Content $FilePath $content -Encoding UTF8
    
    Write-Host "Updated: $FilePath" -ForegroundColor Green
}

# Get all TSX files that need updating
$filesToUpdate = Get-ChildItem -Recurse -Include "*.tsx" | Where-Object {
    $content = Get-Content $_.FullName -Raw
    return $content -match "import.*Button.*from.*@/components/ui/button" -or
           $content -match "import.*Card.*from.*@/components/ui/card" -or
           $content -match "import.*Input.*from.*@/components/ui/input" -or
           $content -match "<Button" -or
           $content -match "<Card" -or
           $content -match "<Input"
}

Write-Host "Found $($filesToUpdate.Count) files to update" -ForegroundColor Cyan

# Update each file
foreach ($file in $filesToUpdate) {
    try {
        Update-FileToSnowUI -FilePath $file.FullName
    }
    catch {
        Write-Host "Error updating $($file.FullName): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Comprehensive SnowUI migration completed!" -ForegroundColor Green
