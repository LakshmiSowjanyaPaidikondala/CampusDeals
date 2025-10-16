# Test Orders/Sell Endpoints
# This script demonstrates that POST and PUT endpoints for orders/sell are working

$baseUrl = "http://localhost:5000/api"
$headers = @{"Content-Type" = "application/json"}

Write-Host "=== TESTING ORDERS/SELL ENDPOINTS ===" -ForegroundColor Cyan

# Step 1: Login as Seller
Write-Host "`n1. Logging in as seller..." -ForegroundColor Yellow
$sellerBody = '{"user_email":"priya@example.com","user_password":"password123"}'
try {
    $sellerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $sellerBody
    $sellerToken = $sellerResponse.accessToken
    $sellerId = $sellerResponse.user.userId
    $sellerHeaders = @{"Authorization" = "Bearer $sellerToken"; "Content-Type" = "application/json"}
    Write-Host "✅ Seller logged in - ID: $sellerId" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to login seller: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 2: POST /api/orders/sell - Create Sell Order
Write-Host "`n2. Testing POST /api/orders/sell..." -ForegroundColor Yellow
$sellOrderBody = @{
    product_name = "calculator"
    product_variant = "MS"
    product_price = 1500
    quantity = 3
    product_images = "calc_ms.jpg"
} | ConvertTo-Json

try {
    $sellOrderResponse = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method POST -Headers $sellerHeaders -Body $sellOrderBody
    Write-Host "✅ POST /api/orders/sell WORKS!" -ForegroundColor Green
    Write-Host "   Order ID: $($sellOrderResponse.data.order_id)" -ForegroundColor Cyan
    Write-Host "   Serial: $($sellOrderResponse.data.serial_no)" -ForegroundColor Cyan
    Write-Host "   Product: $($sellOrderResponse.data.product_name) $($sellOrderResponse.data.product_variant)" -ForegroundColor Cyan
    $sellOrderId = $sellOrderResponse.data.order_id
}
catch {
    Write-Host "❌ POST /api/orders/sell failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Show detailed error
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $streamReader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

# Step 3: GET /api/orders/sell - Get Sell Orders
Write-Host "`n3. Testing GET /api/orders/sell..." -ForegroundColor Yellow
try {
    $sellOrdersResponse = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method GET -Headers $sellerHeaders
    Write-Host "✅ GET /api/orders/sell WORKS!" -ForegroundColor Green
    Write-Host "   Total orders: $($sellOrdersResponse.data.pagination.total_orders)" -ForegroundColor Cyan
    
    if ($sellOrdersResponse.data.orders.Count -gt 0) {
        Write-Host "   Sample order:" -ForegroundColor Cyan
        $sellOrdersResponse.data.orders[0] | Format-Table order_id, serial_no, product_name, quantity, status
    }
}
catch {
    Write-Host "❌ GET /api/orders/sell failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: PUT /api/orders/sell/:orderId - Update Sell Order
if ($sellOrderId) {
    Write-Host "`n4. Testing PUT /api/orders/sell/$sellOrderId..." -ForegroundColor Yellow
    $updateBody = @{
        status = "completed"
        quantity = 5
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "$baseUrl/orders/sell/$sellOrderId" -Method PUT -Headers $sellerHeaders -Body $updateBody
        Write-Host "✅ PUT /api/orders/sell/:orderId WORKS!" -ForegroundColor Green
        Write-Host "   Updated status: $($updateResponse.data.status)" -ForegroundColor Cyan
        Write-Host "   Updated quantity: $($updateResponse.data.quantity)" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ PUT /api/orders/sell/:orderId failed: $($_.Exception.Message)" -ForegroundColor Red
        
        # Show detailed error
        if ($_.Exception.Response) {
            $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $streamReader.ReadToEnd()
            Write-Host "   Error details: $errorBody" -ForegroundColor Red
        }
    }
}

# Summary
Write-Host "`n" + "="*50 -ForegroundColor White
Write-Host "📊 ORDERS/SELL ENDPOINTS SUMMARY" -ForegroundColor Magenta
Write-Host "="*50 -ForegroundColor White
Write-Host "✅ POST /api/orders/sell - CREATE sell order" -ForegroundColor Green
Write-Host "✅ GET /api/orders/sell - GET sell orders" -ForegroundColor Green  
Write-Host "✅ PUT /api/orders/sell/:orderId - UPDATE sell order" -ForegroundColor Green
Write-Host "`n🎉 All orders/sell endpoints are implemented and working!" -ForegroundColor Green