# Cart-Order Linking Test Script
Write-Host "=== TESTING CART-ORDER LINKING SYSTEM ===" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"

# Step 1: Login as Buyer
Write-Host "`n1. Login as Buyer..." -ForegroundColor Yellow
try {
    $buyerBody = '{"user_email":"ravi@example.com","user_password":"password123"}'
    $buyerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $buyerBody
    $buyerToken = $buyerResponse.accessToken
    $buyerId = $buyerResponse.user.userId
    Write-Host "✅ Buyer logged in - ID: $buyerId" -ForegroundColor Green
} catch {
    Write-Host "❌ Buyer login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Login as Seller
Write-Host "`n2. Login as Seller..." -ForegroundColor Yellow
try {
    $sellerBody = '{"user_email":"priya@example.com","user_password":"password123"}'
    $sellerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $sellerBody
    $sellerToken = $sellerResponse.accessToken
    $sellerId = $sellerResponse.user.userId
    Write-Host "✅ Seller logged in - ID: $sellerId" -ForegroundColor Green
} catch {
    Write-Host "❌ Seller login failed: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Create Sell Orders (FIFO test setup)
Write-Host "`n3. Creating Sell Orders..." -ForegroundColor Yellow
$sellerHeaders = @{"Authorization" = "Bearer $sellerToken"; "Content-Type" = "application/json"}

# Seller A - First sell order (will be allocated first due to FIFO)
try {
    $sellOrder1Body = '{"product_name":"calculator","product_variant":"MS","product_price":1200,"quantity":2,"product_images":"calc.jpg"}'
    $sellOrder1 = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method POST -Headers $sellerHeaders -Body $sellOrder1Body
    Write-Host "✅ Sell Order 1 created - Order ID: $($sellOrder1.data.order_id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Sell order 1 failed: $_" -ForegroundColor Red
}

# Seller B - Second sell order 
try {
    $sellOrder2Body = '{"product_name":"calculator","product_variant":"MS","product_price":1200,"quantity":3,"product_images":"calc.jpg"}'
    $sellOrder2 = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method POST -Headers $sellerHeaders -Body $sellOrder2Body
    Write-Host "✅ Sell Order 2 created - Order ID: $($sellOrder2.data.order_id)" -ForegroundColor Green
} catch {
    Write-Host "❌ Sell order 2 failed: $_" -ForegroundColor Red
}

# Step 4: Add items to buyer's cart
Write-Host "`n4. Adding items to buyer's cart..." -ForegroundColor Yellow
$buyerHeaders = @{"Authorization" = "Bearer $buyerToken"; "Content-Type" = "application/json"}

try {
    $cartBody = '{"product_id":1,"quantity":4}'
    $cartResponse = Invoke-RestMethod -Uri "$baseUrl/cart" -Method POST -Headers $buyerHeaders -Body $cartBody
    Write-Host "✅ Added to cart: $($cartResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Add to cart failed: $_" -ForegroundColor Red
}

# Step 5: Create Buy Order (triggers FIFO allocation)
Write-Host "`n5. Creating Buy Order (FIFO allocation)..." -ForegroundColor Yellow
try {
    $buyOrderBody = @{
        cart_items = @(@{
            cart_id = $buyerId
            product_id = 1
            quantity = 4
        })
        payment_method = "upi"
    } | ConvertTo-Json -Depth 3
    
    $buyOrderResponse = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method POST -Headers $buyerHeaders -Body $buyOrderBody
    Write-Host "✅ Buy Order created successfully!" -ForegroundColor Green
    Write-Host "📊 Orders created: $($buyOrderResponse.data.total_orders)" -ForegroundColor Cyan
    
    foreach ($order in $buyOrderResponse.data.orders) {
        Write-Host "   Order ID: $($order.order_id) | Quantity: $($order.quantity) | Linked to Seller Order: $($order.linked_seller_order)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Buy order failed: $_" -ForegroundColor Red
}

# Step 6: Check buyer's orders
Write-Host "`n6. Checking buyer's orders..." -ForegroundColor Yellow
try {
    $buyerOrders = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method GET -Headers $buyerHeaders
    Write-Host "✅ Retrieved $($buyerOrders.data.pagination.total_orders) buy orders" -ForegroundColor Green
    
    foreach ($order in $buyerOrders.data.orders) {
        Write-Host "   Order: $($order.serial_no) | Product: $($order.product_name) | Qty: $($order.quantity) | Cart ID: $($order.cart_id) | Linked: $($order.linked_order_id)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Get buyer orders failed: $_" -ForegroundColor Red
}

# Step 7: Check seller's orders
Write-Host "`n7. Checking seller's orders..." -ForegroundColor Yellow
try {
    $sellerOrders = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method GET -Headers $sellerHeaders
    Write-Host "✅ Retrieved $($sellerOrders.data.pagination.total_orders) sell orders" -ForegroundColor Green
    
    foreach ($order in $sellerOrders.data.orders) {
        Write-Host "   Order: $($order.serial_no) | Product: $($order.product_name) | Qty: $($order.quantity) | Status: $($order.status)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Get seller orders failed: $_" -ForegroundColor Red
}

Write-Host "`n=== CART-ORDER LINKING TEST COMPLETED ===" -ForegroundColor Cyan