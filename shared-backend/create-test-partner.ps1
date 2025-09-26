# Wait for server to start
Start-Sleep -Seconds 5

# Create test partner data
$body = @{
    partnerId = "CLT123456TEST"
    email = "test@clutch.com"
    phone = "+201234567890"
    password = "test123"
    businessName = "Test Auto Shop"
    ownerName = "Ahmed Test"
    partnerType = "repair_center"
    businessAddress = @{
        street = "123 Test Street"
        city = "Cairo"
        state = "Cairo"
        zipCode = "11511"
    }
} | ConvertTo-Json -Depth 3

Write-Host "Creating test partner..."
Write-Host "Request body: $body"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/partners/signup" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Test partner created successfully!"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Error creating test partner: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}

Write-Host ""
Write-Host "🔐 Test Partner Login Credentials:"
Write-Host "   Email: test@clutch.com"
Write-Host "   Phone: +201234567890"
Write-Host "   Password: test123"
Write-Host "   Partner ID: CLT123456TEST"
Write-Host ""
Write-Host "📱 You can now test signup and signin in the mobile app!"
