# Quick Cart-Order Fix Test
$baseUrl = "http://localhost:5000/api"
$headers = @{"Content-Type" = "application/json"}

Write-Host "=== TESTING CART-ORDER FIX ===" -ForegroundColor Cyan

# Step 1: Login as Buyer
Write-Host "`n1. Logging in as buyer..." -ForegroundColor Yellow
$buyerBody = '{"user_email":"ravi@example.com","user_password":"password123"}'
try {
    $buyerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Headers $headers -Body $buyerBody
    $buyerToken = $buyerResponse.accessToken
    $buyerId = $buyerResponse.user.userId
    $buyerHeaders = @{"Authorization" = "Bearer $buyerToken"; "Content-Type" = "application/json"}
    Write-Host "✅ Buyer logged in - ID: $buyerId" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to login buyer: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 2: Add items to cart
Write-Host "`n2. Adding items to cart..." -ForegroundColor Yellow
$cartItem1Body = @{
    product_id = 14  # Calculator MS
    quantity = 2
} | ConvertTo-Json

try {
    $cartResponse = Invoke-RestMethod -Uri "$baseUrl/cart" -Method POST -Headers $buyerHeaders -Body $cartItem1Body
    Write-Host "✅ Added calculator to cart" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Note: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 3: View cart contents
Write-Host "`n3. Viewing cart contents..." -ForegroundColor Yellow
try {
    $cartContents = Invoke-RestMethod -Uri "$baseUrl/cart" -Method GET -Headers $buyerHeaders
    Write-Host "✅ Cart Contents:" -ForegroundColor Green
    $cartContents.data.items | Format-Table product_name, quantity, cart_id
    Write-Host "Cart ID from response: $($cartContents.data.items[0].cart_id)" -ForegroundColor Cyan
    Write-Host "User ID from login: $buyerId" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Failed to get cart: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 4: Create buy order using user's ID as cart_id
Write-Host "`n4. Creating buy order using cart_id = user_id..." -ForegroundColor Yellow
$buyOrderBody = @{
    cart_id = $buyerId  # Use user ID as cart ID
    payment_method = "upi"
} | ConvertTo-Json

Write-Host "Request body: $buyOrderBody" -ForegroundColor Gray

try {
    $buyOrderResponse = Invoke-RestMethod -Uri "$baseUrl/orders/buy" -Method POST -Headers $buyerHeaders -Body $buyOrderBody
    Write-Host "✅ Buy Order Created Successfully!" -ForegroundColor Green
    $buyOrderResponse.data.orders | Format-Table order_id, product_name, quantity, cart_id, total_amount
}
catch {
    Write-Host "❌ Failed to create buy order:" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try to get more details
    if ($_.Exception.Response) {
        $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $streamReader.ReadToEnd()
        Write-Host "   Response: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Cart-Order fix test complete!" -ForegroundColor Green