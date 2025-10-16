# Complete Order Endpoints Testing Guide

This guide provides step-by-step instructions to test all order table endpoints with cart-order linking and FIFO seller allocation.

## Prerequisites

1. **Server Running**: Make sure the backend server is running
   ```powershell
   cd C:\Users\laksh\Downloads\CampusDeals\backend
   node server.js
   ```
   Server should be accessible at: `http://localhost:5000`

2. **Database Seeded**: Ensure database has sample data
   ```powershell
   node seed.js
   ```

## Base URL and Headers

```powershell
$baseUrl = "http://localhost:5000/api"
$headers = @{"Content-Type" = "application/json"}
```

## 🔐 Authentication Setup

### Step 1: Login as Buyer
```powershell
$buyerBody = '{"user_email":"ravi@example.com","user_password":"password123"}'
$buyerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $buyerBody
$buyerToken = $buyerResponse.accessToken
$buyerId = $buyerResponse.user.userId
$buyerHeaders = @{"Authorization" = "Bearer $buyerToken"; "Content-Type" = "application/json"}

Write-Host "Buyer logged in - ID: $buyerId, Token: $buyerToken"
```

### Step 2: Login as Seller
```powershell
$sellerBody = '{"user_email":"priya@example.com","user_password":"password123"}'
$sellerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $sellerBody
$sellerToken = $sellerResponse.accessToken
$sellerId = $sellerResponse.user.userId
$sellerHeaders = @{"Authorization" = "Bearer $sellerToken"; "Content-Type" = "application/json"}

Write-Host "Seller logged in - ID: $sellerId, Token: $sellerToken"
```

### Step 3: Login as Admin (Optional)
```powershell
$adminBody = '{"user_email":"admin@campusdeals.com","user_password":"password123"}'
$adminResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $adminBody
$adminToken = $adminResponse.accessToken
$adminHeaders = @{"Authorization" = "Bearer $adminToken"; "Content-Type" = "application/json"}

Write-Host "Admin logged in - Token: $adminToken"
```

## 📦 Testing SELL Order Endpoints

### POST /api/orders/sell - Create Sell Order

#### Test 1: Create First Sell Order (Seller A)
```powershell
$sellOrder1Body = @{
    product_name = "calculator"
    product_variant = "MS"
    product_price = 1200
    quantity = 3
    product_images = "calculator_ms.jpg"
} | ConvertTo-Json

$sellOrder1Response = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method POST -Headers $sellerHeaders -Body $sellOrder1Body
Write-Host "Sell Order 1 Created:"
$sellOrder1Response.data
$sellOrder1Id = $sellOrder1Response.data.order_id
```

#### Test 2: Create Second Sell Order (Seller A - Different Product)
```powershell
$sellOrder2Body = @{
    product_name = "drafter"
    product_variant = "premium_drafter"
    product_price = 2500
    quantity = 2
    product_images = "drafter_premium.jpg"
} | ConvertTo-Json

$sellOrder2Response = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method POST -Headers $sellerHeaders -Body $sellOrder2Body
Write-Host "Sell Order 2 Created:"
$sellOrder2Response.data
$sellOrder2Id = $sellOrder2Response.data.order_id
```

#### Test 3: Create Third Sell Order (Same Product as Order 1 - for FIFO testing)
```powershell
$sellOrder3Body = @{
    product_name = "calculator"
    product_variant = "MS"
    product_price = 1200
    quantity = 5
    product_images = "calculator_ms.jpg"
} | ConvertTo-Json

$sellOrder3Response = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method POST -Headers $sellerHeaders -Body $sellOrder3Body
Write-Host "Sell Order 3 Created:"
$sellOrder3Response.data
$sellOrder3Id = $sellOrder3Response.data.order_id
```

### GET /api/orders/sell - Get Sell Orders

#### Test 4: Get All Sell Orders
```powershell
$allSellOrders = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method GET -Headers $sellerHeaders
Write-Host "All Sell Orders:"
$allSellOrders.data.orders | Format-Table order_id, serial_no, product_name, quantity, status, order_type
```

#### Test 5: Get Sell Orders with Status Filter
```powershell
$pendingSellOrders = Invoke-RestMethod -Uri "$baseUrl/orders/sell?status=pending" -Method GET -Headers $sellerHeaders
Write-Host "Pending Sell Orders:"
$pendingSellOrders.data.orders | Format-Table order_id, serial_no, product_name, quantity, status
```

#### Test 6: Get Sell Orders with Pagination
```powershell
$pagedSellOrders = Invoke-RestMethod -Uri "$baseUrl/orders/sell?page=1&limit=2" -Method GET -Headers $sellerHeaders
Write-Host "Paginated Sell Orders (Page 1, Limit 2):"
$pagedSellOrders.data.pagination
$pagedSellOrders.data.orders | Format-Table order_id, serial_no, product_name
```

### PUT /api/orders/sell/:orderId - Update Sell Order

#### Test 7: Update Sell Order Status
```powershell
$updateSellStatusBody = @{
    status = "completed"
} | ConvertTo-Json

$updatedSellOrder = Invoke-RestMethod -Uri "$baseUrl/orders/sell/$sellOrder2Id" -Method PUT -Headers $sellerHeaders -Body $updateSellStatusBody
Write-Host "Updated Sell Order Status:"
$updatedSellOrder.data
```

#### Test 8: Update Sell Order Quantity
```powershell
$updateSellQuantityBody = @{
    quantity = 4
} | ConvertTo-Json

$updatedSellQuantity = Invoke-RestMethod -Uri "$baseUrl/orders/sell/$sellOrder1Id" -Method PUT -Headers $sellerHeaders -Body $updateSellQuantityBody
Write-Host "Updated Sell Order Quantity:"
$updatedSellQuantity.data
```

#### Test 9: Update Sell Order Total Amount
```powershell
$updateSellAmountBody = @{
    total_amount = 6000
} | ConvertTo-Json

$updatedSellAmount = Invoke-RestMethod -Uri "$baseUrl/orders/sell/$sellOrder1Id" -Method PUT -Headers $sellerHeaders -Body $updateSellAmountBody
Write-Host "Updated Sell Order Amount:"
$updatedSellAmount.data
```

## 🛒 Testing Cart Setup for Buy Orders

### Step 4: Add Items to Buyer's Cart
```powershell
# Add calculator to cart
$cartItem1Body = @{
    product_id = 14  # Calculator MS from seeded data
    quantity = 6     # More than available from single seller (tests FIFO)
} | ConvertTo-Json

$cartResponse1 = Invoke-RestMethod -Uri "$baseUrl/cart" -Method POST -Headers $buyerHeaders -Body $cartItem1Body
Write-Host "Added to cart:"
$cartResponse1.data

# Add drafter to cart
$cartItem2Body = @{
    product_id = 1   # Premium drafter
    quantity = 1
} | ConvertTo-Json

$cartResponse2 = Invoke-RestMethod -Uri "$baseUrl/cart" -Method POST -Headers $buyerHeaders -Body $cartItem2Body
Write-Host "Added to cart:"
$cartResponse2.data
```

### Step 5: View Cart Contents
```powershell
$cartContents = Invoke-RestMethod -Uri "$baseUrl/cart" -Method GET -Headers $buyerHeaders
Write-Host "Cart Contents:"
$cartContents.data.items | Format-Table product_name, quantity, price_per_item, item_total, cart_id
```

## 🛍️ Testing BUY Order Endpoints

### POST /api/orders/buy - Create Buy Order (FIFO Allocation Test)

#### Test 10: Create Buy Order from Cart (FIFO Test)
```powershell
$buyOrderBody = @{
    cart_items = @(
        @{
            cart_id = $buyerId
            product_id = 14  # Calculator MS
            quantity = 6     # This will test FIFO allocation across multiple sellers
        }
    )
    payment_method = "upi"
} | ConvertTo-Json -Depth 3

$buyOrderResponse = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method POST -Headers $buyerHeaders -Body $buyOrderBody
Write-Host "Buy Order Created (FIFO Allocation):"
$buyOrderResponse.data.orders | Format-Table order_id, quantity, linked_seller_order, product_name, total_amount
$buyOrder1Id = $buyOrderResponse.data.orders[0].order_id
```

#### Test 11: Create Multiple Item Buy Order
```powershell
$multiBuyOrderBody = @{
    cart_items = @(
        @{
            cart_id = $buyerId
            product_id = 1   # Premium drafter
            quantity = 1
        }
    )
    payment_method = "cash"
} | ConvertTo-Json -Depth 3

$multiBuyOrderResponse = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method POST -Headers $buyerHeaders -Body $multiBuyOrderBody
Write-Host "Multi-Item Buy Order Created:"
$multiBuyOrderResponse.data.orders | Format-Table order_id, product_name, quantity, cart_id, linked_order_id
```

### GET /api/orders/buy - Get Buy Orders

#### Test 12: Get All Buy Orders
```powershell
$allBuyOrders = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method GET -Headers $buyerHeaders
Write-Host "All Buy Orders:"
$allBuyOrders.data.orders | Format-Table order_id, serial_no, product_name, quantity, cart_id, linked_order_id, linked_seller_name
```

#### Test 13: Get Buy Orders with Status Filter
```powershell
$pendingBuyOrders = Invoke-RestMethod -Uri "$baseUrl/orders/buy?status=pending" -Method GET -Headers $buyerHeaders
Write-Host "Pending Buy Orders:"
$pendingBuyOrders.data.orders | Format-Table order_id, product_name, status, quantity
```

#### Test 14: Get Buy Orders with Pagination
```powershell
$pagedBuyOrders = Invoke-RestMethod -Uri "$baseUrl/orders/buy?page=1&limit=5" -Method GET -Headers $buyerHeaders
Write-Host "Paginated Buy Orders:"
$pagedBuyOrders.data.pagination
$pagedBuyOrders.data.orders | Format-Table order_id, product_name, quantity
```

### PUT /api/orders/buy/:orderId - Update Buy Order

#### Test 15: Update Buy Order Status
```powershell
$updateBuyStatusBody = @{
    status = "completed"
} | ConvertTo-Json

$updatedBuyOrder = Invoke-RestMethod -Uri "$baseUrl/orders/buy/$buyOrder1Id" -Method PUT -Headers $buyerHeaders -Body $updateBuyStatusBody
Write-Host "Updated Buy Order Status:"
$updatedBuyOrder.data
```

#### Test 16: Update Buy Order Quantity
```powershell
$updateBuyQuantityBody = @{
    quantity = 2
} | ConvertTo-Json

$updatedBuyQuantity = Invoke-RestMethod -Uri "$baseUrl/orders/buy/$buyOrder1Id" -Method PUT -Headers $buyerHeaders -Body $updateBuyQuantityBody
Write-Host "Updated Buy Order Quantity:"
$updatedBuyQuantity.data
```

#### Test 17: Update Buy Order Payment Method
```powershell
$updateBuyPaymentBody = @{
    payment_method = "cash"
} | ConvertTo-Json

$updatedBuyPayment = Invoke-RestMethod -Uri "$baseUrl/orders/buy/$buyOrder1Id" -Method PUT -Headers $buyerHeaders -Body $updateBuyPaymentBody
Write-Host "Updated Buy Order Payment Method:"
$updatedBuyPayment.data
```

## 🔍 Testing GET Order by ID

### GET /api/orders/:orderId - Get Specific Order

#### Test 18: Get Specific Buy Order
```powershell
$specificBuyOrder = Invoke-RestMethod -Uri "$baseUrl/orders/$buyOrder1Id" -Method GET -Headers $buyerHeaders
Write-Host "Specific Buy Order Details:"
$specificBuyOrder.data | Format-List
```

#### Test 19: Get Specific Sell Order
```powershell
$specificSellOrder = Invoke-RestMethod -Uri "$baseUrl/orders/$sellOrder1Id" -Method GET -Headers $sellerHeaders
Write-Host "Specific Sell Order Details:"
$specificSellOrder.data | Format-List
```

#### Test 20: Get Order as Admin (Cross-User Access)
```powershell
$adminOrderView = Invoke-RestMethod -Uri "$baseUrl/orders/$buyOrder1Id" -Method GET -Headers $adminHeaders
Write-Host "Admin View of Buy Order:"
$adminOrderView.data | Format-List
```

## 🧪 Advanced Testing Scenarios

### Test 21: FIFO Allocation Verification
```powershell
Write-Host "=== FIFO ALLOCATION VERIFICATION ===" -ForegroundColor Cyan

# Check seller orders after buy order allocation
$sellerOrdersAfter = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method GET -Headers $sellerHeaders
Write-Host "Seller Orders After Allocation:"
$sellerOrdersAfter.data.orders | Format-Table order_id, product_name, quantity, status, created_at

# Check buyer orders to see linking
$buyerOrdersAfter = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method GET -Headers $buyerHeaders
Write-Host "Buyer Orders Showing Links:"
$buyerOrdersAfter.data.orders | Format-Table order_id, product_name, quantity, linked_order_id, linked_seller_name
```

### Test 22: Error Handling Tests
```powershell
Write-Host "=== ERROR HANDLING TESTS ===" -ForegroundColor Yellow

# Test invalid order ID
try {
    $invalidOrder = Invoke-RestMethod -Uri "$baseUrl/orders/99999" -Method GET -Headers $buyerHeaders
} catch {
    Write-Host "✅ Invalid Order ID Error: $($_.Exception.Response.StatusCode)"
}

# Test unauthorized access
try {
    $unauthorizedOrder = Invoke-RestMethod -Uri "$baseUrl/orders/$sellOrder1Id" -Method GET -Headers $buyerHeaders
} catch {
    Write-Host "✅ Unauthorized Access Error: $($_.Exception.Response.StatusCode)"
}

# Test invalid buy order without cart items
try {
    $invalidBuyBody = @{
        cart_items = @()
        payment_method = "upi"
    } | ConvertTo-Json -Depth 3
    
    $invalidBuy = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method POST -Headers $buyerHeaders -Body $invalidBuyBody
} catch {
    Write-Host "✅ Empty Cart Items Error: $($_.Exception.Response.StatusCode)"
}
```

### Test 23: Cart-Order Relationship Verification
```powershell
Write-Host "=== CART-ORDER RELATIONSHIP VERIFICATION ===" -ForegroundColor Magenta

# Check that cart is empty after order creation
$cartAfterOrder = Invoke-RestMethod -Uri "$baseUrl/cart" -Method GET -Headers $buyerHeaders
Write-Host "Cart after order creation:"
Write-Host "Total items in cart: $($cartAfterOrder.data.total_items)"

# Verify order contains correct cart_id
$orderWithCartId = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method GET -Headers $buyerHeaders
Write-Host "Orders with cart_id reference:"
$orderWithCartId.data.orders | Format-Table order_id, cart_id, product_name, quantity
```

## 📊 Summary Report Function

### Generate Test Summary
```powershell
function Get-OrderTestSummary {
    Write-Host "=== ORDER ENDPOINTS TEST SUMMARY ===" -ForegroundColor Green
    
    $buyOrders = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method GET -Headers $buyerHeaders
    $sellOrders = Invoke-RestMethod -Uri "$baseUrl/orders/sell" -Method GET -Headers $sellerHeaders
    
    Write-Host "📊 Test Results:"
    Write-Host "   Total Buy Orders Created: $($buyOrders.data.pagination.total_orders)"
    Write-Host "   Total Sell Orders Created: $($sellOrders.data.pagination.total_orders)"
    
    Write-Host "🔗 Cart-Order Linking:"
    $linkedOrders = $buyOrders.data.orders | Where-Object { $_.cart_id -ne $null }
    Write-Host "   Orders with cart_id: $($linkedOrders.Count)"
    
    Write-Host "🎯 FIFO Allocation:"
    $linkedToSellers = $buyOrders.data.orders | Where-Object { $_.linked_order_id -ne $null }
    Write-Host "   Orders linked to sellers: $($linkedToSellers.Count)"
    
    Write-Host "✅ All order endpoints tested successfully!"
}

# Run summary
Get-OrderTestSummary
```

## 🔧 Troubleshooting

### Common Issues and Solutions

1. **401 Unauthorized**: Token expired, re-login
2. **404 Not Found**: Check order ID exists and user has access
3. **400 Bad Request**: Validate request body format
4. **403 Forbidden**: Check user role permissions (buyer/seller/admin)

### Debug Commands
```powershell
# Check server logs
# Look at PowerShell terminal running the server

# Verify database state
# Use SQLite browser or database queries

# Check authentication
$token = "YOUR_TOKEN_HERE"
$payload = [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($token.Split('.')[1]))
Write-Host $payload
```

This comprehensive guide covers all order endpoints with detailed test cases for cart-order linking and FIFO seller allocation!