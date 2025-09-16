# PowerShell script to update ziad@yourclutch.com with all necessary roles
# Run this after the backend is deployed with the new auth endpoint

$BACKEND_URL = "https://clutch-main-nk7x.onrender.com"

Write-Host "🚀 Updating user roles for ziad@yourclutch.com..." -ForegroundColor Green

# All the roles needed based on the requireRole checks in the codebase
$ALL_ROLES = @(
    "admin",
    "hr_manager",
    "fleet_manager", 
    "enterprise_manager",
    "sales_manager",
    "analytics",
    "management",
    "cto",
    "operations",
    "sales_rep",
    "manager",
    "analyst",
    "super_admin",
    "finance_manager",
    "marketing_manager",
    "legal_manager",
    "partner_manager",
    "hr",
    "fleet_admin",
    "driver",
    "accountant"
)

$headers = @{
    "Content-Type" = "application/json"
}

# Try with ziad@yourclutch.com
Write-Host "📧 Trying ziad@yourclutch.com..." -ForegroundColor Yellow
$body1 = @{
    email = "ziad@yourclutch.com"
    roles = $ALL_ROLES
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/update-user-roles" -Method PUT -Headers $headers -Body $body1
    Write-Host "✅ Success: $($response1.message)" -ForegroundColor Green
    Write-Host "📧 Email: $($response1.data.email)" -ForegroundColor Cyan
    Write-Host "👑 Roles: $($response1.data.roles -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error with ziad@yourclutch.com: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Try with ziad@clutchapp.one
Write-Host "📧 Trying ziad@clutchapp.one..." -ForegroundColor Yellow
$body2 = @{
    email = "ziad@clutchapp.one"
    roles = $ALL_ROLES
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/update-user-roles" -Method PUT -Headers $headers -Body $body2
    Write-Host "✅ Success: $($response2.message)" -ForegroundColor Green
    Write-Host "📧 Email: $($response2.data.email)" -ForegroundColor Cyan
    Write-Host "👑 Roles: $($response2.data.roles -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error with ziad@clutchapp.one: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Script completed!" -ForegroundColor Green
Write-Host "📧 Email: ziad@yourclutch.com" -ForegroundColor Cyan
Write-Host "🔑 Password: 4955698*Z*z" -ForegroundColor Cyan
