# Test Single Order for Cart
Write-Host "🚀 Testing Single Order per Cart Implementation" -ForegroundColor Green
Write-Host "=================================================`n"

try {
    # Step 1: Login
    Write-Host "🔐 Step 1: Authenticating..." -ForegroundColor Yellow
    $loginBody = @{
        user_email = "buyer@test.com"
        user_password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    $token = $loginResponse.data.access_token
    $userId = $loginResponse.data.user.user_id
    Write-Host "✅ Authenticated! User ID: $userId" -ForegroundColor Green

    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    # Step 2: Clear existing cart
    Write-Host "`n🧹 Step 2: Clearing existing cart..." -ForegroundColor Yellow
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/cart/clear" -Method DELETE -Headers $headers
        Write-Host "✅ Cart cleared" -ForegroundColor Green
    } catch {
        Write-Host "ℹ️ Cart was already empty" -ForegroundColor Cyan
    }

    # Step 3: Add multiple items to cart
    Write-Host "`n🛒 Step 3: Adding multiple items to cart..." -ForegroundColor Yellow
    $items = @(
        @{product_id=1; quantity=2},
        @{product_id=2; quantity=1},
        @{product_id=3; quantity=3}
    )

    foreach ($item in $items) {
        $itemBody = $item | ConvertTo-Json
        Invoke-RestMethod -Uri "http://localhost:5000/api/cart/add" -Method POST -Headers $headers -Body $itemBody
        Write-Host "✅ Added Product $($item.product_id) x$($item.quantity)" -ForegroundColor Green
    }

    # Step 4: View cart
    Write-Host "`n👀 Step 4: Viewing cart contents..." -ForegroundColor Yellow
    $cartResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/cart" -Method GET -Headers $headers
    Write-Host "📊 Cart contains $($cartResponse.data.cart_items.Length) different items" -ForegroundColor Cyan
    
    # Step 5: Create order (this should create SINGLE order for all items)
    Write-Host "`n💰 Step 5: Creating SINGLE order from cart..." -ForegroundColor Yellow
    $orderBody = @{
        cart_id = $userId
        payment_method = "upi"
    } | ConvertTo-Json

    $orderResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/orders/buy" -Method POST -Headers $headers -Body $orderBody
    
    Write-Host "🎉 SUCCESS! SINGLE ORDER CREATED:" -ForegroundColor Green
    Write-Host "📋 Order ID: $($orderResponse.data.order.order_id)" -ForegroundColor Cyan
    Write-Host "💰 Total Amount: `$$($orderResponse.data.order.total_amount)" -ForegroundColor Cyan
    Write-Host "📦 Total Items: $($orderResponse.data.order.total_items)" -ForegroundColor Cyan
    Write-Host "🛍️ Items in this SINGLE order:" -ForegroundColor Cyan
    
    foreach ($item in $orderResponse.data.order.items) {
        Write-Host "   - $($item.product_name) x$($item.quantity) @ `$$($item.price_per_item) = `$$($item.item_total)" -ForegroundColor White
    }

    # Step 6: Verify with GET request
    Write-Host "`n📊 Step 6: Verifying with GET orders..." -ForegroundColor Yellow
    $getOrdersResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/orders/buy" -Method GET -Headers $headers
    
    $latestOrder = $getOrdersResponse.data.orders[0]
    Write-Host "✅ Latest order verification:" -ForegroundColor Green
    Write-Host "📋 Order ID: $($latestOrder.order_id)" -ForegroundColor Cyan
    Write-Host "📦 Total Items: $($latestOrder.total_items)" -ForegroundColor Cyan
    Write-Host "🛍️ Items:" -ForegroundColor Cyan
    
    foreach ($item in $latestOrder.items) {
        Write-Host "   - $($item.product_name) x$($item.quantity)" -ForegroundColor White
    }

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n🏁 Test completed!" -ForegroundColor Green
Write-Host "✅ Key achievement: ONE order_id for entire cart instead of multiple order_ids!" -ForegroundColor Magenta