# Quick Order Endpoints Test Script
# Run this script to test all order endpoints automatically

param(
    [string]$BaseUrl = "http://localhost:5000/api",
    [switch]$Verbose
)

# Color functions for better output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }

# Global variables
$global:buyerToken = ""
$global:sellerToken = ""
$global:adminToken = ""
$global:buyerId = ""
$global:sellerId = ""
$global:headers = @{"Content-Type" = "application/json"}
$global:testResults = @{
    total = 0
    passed = 0
    failed = 0
    errors = @()
}

function Test-EndpointWithErrorHandling {
    param(
        [string]$TestName,
        [scriptblock]$TestScript
    )
    
    $global:testResults.total++
    Write-Host "`n🧪 Testing: $TestName" -ForegroundColor Cyan
    
    try {
        & $TestScript
        $global:testResults.passed++
        Write-Success "$TestName - PASSED"
    }
    catch {
        $global:testResults.failed++
        $errorMsg = "$TestName - FAILED: $($_.Exception.Message)"
        $global:testResults.errors += $errorMsg
        Write-Error $errorMsg
        if ($Verbose) {
            Write-Host $_.Exception.StackTrace -ForegroundColor DarkRed
        }
    }
}

function Initialize-Authentication {
    Write-Host "🔐 Setting up authentication..." -ForegroundColor Yellow
    
    # Login as Buyer
    $buyerBody = '{"user_email":"ravi@example.com","user_password":"password123"}'
    $buyerResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Headers $global:headers -Body $buyerBody
    $global:buyerToken = $buyerResponse.accessToken
    $global:buyerId = $buyerResponse.user.userId
    Write-Success "Buyer logged in - ID: $global:buyerId"
    
    # Login as Seller
    $sellerBody = '{"user_email":"priya@example.com","user_password":"password123"}'
    $sellerResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Headers $global:headers -Body $sellerBody
    $global:sellerToken = $sellerResponse.accessToken
    $global:sellerId = $sellerResponse.user.userId
    Write-Success "Seller logged in - ID: $global:sellerId"
    
    # Login as Admin
    $adminBody = '{"user_email":"admin@campusdeals.com","user_password":"password123"}'
    $adminResponse = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method POST -Headers $global:headers -Body $adminBody
    $global:adminToken = $adminResponse.accessToken
    Write-Success "Admin logged in"
}

function Test-SellOrderEndpoints {
    $sellerHeaders = @{"Authorization" = "Bearer $global:sellerToken"; "Content-Type" = "application/json"}
    
    Test-EndpointWithErrorHandling "POST /orders/sell - Create sell order" {
        $sellOrderBody = @{
            product_name = "test_calculator"
            product_variant = "scientific"
            product_price = 1500
            quantity = 5
            product_images = "calc_sci.jpg"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BaseUrl/orders/sell" -Method POST -Headers $sellerHeaders -Body $sellOrderBody
        if (-not $response.data.order_id) { throw "No order_id returned" }
        $script:sellOrderId = $response.data.order_id
        Write-Info "Created sell order ID: $script:sellOrderId"
    }
    
    Test-EndpointWithErrorHandling "GET /orders/sell - Get all sell orders" {
        $response = Invoke-RestMethod -Uri "$BaseUrl/orders/sell" -Method GET -Headers $sellerHeaders
        if (-not $response.data.orders) { throw "No orders returned" }
        Write-Info "Retrieved $($response.data.orders.Count) sell orders"
    }
    
    Test-EndpointWithErrorHandling "GET /orders/sell?status=pending - Filter by status" {
        $response = Invoke-RestMethod -Uri "$BaseUrl/orders/sell?status=pending" -Method GET -Headers $sellerHeaders
        Write-Info "Retrieved $($response.data.orders.Count) pending sell orders"
    }
    
    Test-EndpointWithErrorHandling "GET /orders/sell?page=1&limit=2 - Pagination" {
        $response = Invoke-RestMethod -Uri "$BaseUrl/orders/sell?page=1&limit=2" -Method GET -Headers $sellerHeaders
        if (-not $response.data.pagination) { throw "No pagination info returned" }
        Write-Info "Pagination: Page $($response.data.pagination.current_page) of $($response.data.pagination.total_pages)"
    }
    
    if ($script:sellOrderId) {
        Test-EndpointWithErrorHandling "PUT /orders/sell/:id - Update sell order" {
            $updateBody = @{ status = "completed" } | ConvertTo-Json
            $response = Invoke-RestMethod -Uri "$BaseUrl/orders/sell/$script:sellOrderId" -Method PUT -Headers $sellerHeaders -Body $updateBody
            if ($response.data.status -ne "completed") { throw "Status not updated" }
            Write-Info "Updated sell order status to completed"
        }
    }
}

function Test-CartSetup {
    $buyerHeaders = @{"Authorization" = "Bearer $global:buyerToken"; "Content-Type" = "application/json"}
    
    Test-EndpointWithErrorHandling "POST /cart - Add items to cart" {
        $cartBody = @{
            product_id = 14
            quantity = 3
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$BaseUrl/cart" -Method POST -Headers $buyerHeaders -Body $cartBody
        if (-not $response.data) { throw "Failed to add to cart" }
        Write-Info "Added product to cart"
    }
    
    Test-EndpointWithErrorHandling "GET /cart - View cart contents" {
        $response = Invoke-RestMethod -Uri "$BaseUrl/cart" -Method GET -Headers $buyerHeaders
        if (-not $response.data.items) { throw "No cart items found" }
        Write-Info "Cart contains $($response.data.items.Count) items"
    }
}

function Test-BuyOrderEndpoints {
    $buyerHeaders = @{"Authorization" = "Bearer $global:buyerToken"; "Content-Type" = "application/json"}
    
    Test-EndpointWithErrorHandling "POST /orders/buy - Create buy order with FIFO allocation" {
        $buyOrderBody = @{
            cart_items = @(
                @{
                    cart_id = $global:buyerId
                    product_id = 14
                    quantity = 2
                }
            )
            payment_method = "upi"
        } | ConvertTo-Json -Depth 3
        
        $response = Invoke-RestMethod -Uri "$BaseUrl/orders/buy" -Method POST -Headers $buyerHeaders -Body $buyOrderBody
        if (-not $response.data.orders) { throw "No buy orders created" }
        $script:buyOrderId = $response.data.orders[0].order_id
        Write-Info "Created buy order ID: $script:buyOrderId with FIFO allocation"
    }
    
    Test-EndpointWithErrorHandling "GET /orders/buy - Get all buy orders" {
        $response = Invoke-RestMethod -Uri "$BaseUrl/orders/buy" -Method GET -Headers $buyerHeaders
        if (-not $response.data.orders) { throw "No buy orders returned" }
        Write-Info "Retrieved $($response.data.orders.Count) buy orders"
    }
    
    Test-EndpointWithErrorHandling "GET /orders/buy?status=pending - Filter buy orders" {
        $response = Invoke-RestMethod -Uri "$BaseUrl/orders/buy?status=pending" -Method GET -Headers $buyerHeaders
        Write-Info "Retrieved $($response.data.orders.Count) pending buy orders"
    }
    
    if ($script:buyOrderId) {
        Test-EndpointWithErrorHandling "PUT /orders/buy/:id - Update buy order" {
            $updateBody = @{ payment_method = "cash" } | ConvertTo-Json
            $response = Invoke-RestMethod -Uri "$BaseUrl/orders/buy/$script:buyOrderId" -Method PUT -Headers $buyerHeaders -Body $updateBody
            if ($response.data.payment_method -ne "cash") { throw "Payment method not updated" }
            Write-Info "Updated buy order payment method"
        }
    }
}

function Test-OrderByIdEndpoints {
    $buyerHeaders = @{"Authorization" = "Bearer $global:buyerToken"; "Content-Type" = "application/json"}
    $sellerHeaders = @{"Authorization" = "Bearer $global:sellerToken"; "Content-Type" = "application/json"}
    $adminHeaders = @{"Authorization" = "Bearer $global:adminToken"; "Content-Type" = "application/json"}
    
    if ($script:buyOrderId) {
        Test-EndpointWithErrorHandling "GET /orders/:id - Get specific buy order" {
            $response = Invoke-RestMethod -Uri "$BaseUrl/orders/$script:buyOrderId" -Method GET -Headers $buyerHeaders
            if (-not $response.data.order_id) { throw "Order not found" }
            Write-Info "Retrieved buy order details"
        }
    }
    
    if ($script:sellOrderId) {
        Test-EndpointWithErrorHandling "GET /orders/:id - Get specific sell order" {
            $response = Invoke-RestMethod -Uri "$BaseUrl/orders/$script:sellOrderId" -Method GET -Headers $sellerHeaders
            if (-not $response.data.order_id) { throw "Order not found" }
            Write-Info "Retrieved sell order details"
        }
    }
    
    if ($script:buyOrderId) {
        Test-EndpointWithErrorHandling "GET /orders/:id - Admin access to any order" {
            $response = Invoke-RestMethod -Uri "$BaseUrl/orders/$script:buyOrderId" -Method GET -Headers $adminHeaders
            if (-not $response.data.order_id) { throw "Order not found" }
            Write-Info "Admin retrieved order details"
        }
    }
}

function Test-ErrorHandling {
    $buyerHeaders = @{"Authorization" = "Bearer $global:buyerToken"; "Content-Type" = "application/json"}
    
    Test-EndpointWithErrorHandling "Error: Invalid order ID" {
        try {
            Invoke-RestMethod -Uri "$BaseUrl/orders/99999" -Method GET -Headers $buyerHeaders
            throw "Should have failed with invalid order ID"
        }
        catch {
            if ($_.Exception.Response.StatusCode -eq 404) {
                Write-Info "Correctly returned 404 for invalid order ID"
            } else {
                throw $_.Exception.Message
            }
        }
    }
    
    Test-EndpointWithErrorHandling "Error: Empty cart items" {
        try {
            $emptyCartBody = @{
                cart_items = @()
                payment_method = "upi"
            } | ConvertTo-Json -Depth 3
            
            Invoke-RestMethod -Uri "$BaseUrl/orders/buy" -Method POST -Headers $buyerHeaders -Body $emptyCartBody
            throw "Should have failed with empty cart items"
        }
        catch {
            if ($_.Exception.Response.StatusCode -eq 400) {
                Write-Info "Correctly returned 400 for empty cart items"
            } else {
                throw $_.Exception.Message
            }
        }
    }
}

function Test-CartOrderLinking {
    $buyerHeaders = @{"Authorization" = "Bearer $global:buyerToken"; "Content-Type" = "application/json"}
    
    Test-EndpointWithErrorHandling "Verify cart-order linking" {
        $orders = Invoke-RestMethod -Uri "$BaseUrl/orders/buy" -Method GET -Headers $buyerHeaders
        $linkedOrders = $orders.data.orders | Where-Object { $_.cart_id -ne $null }
        
        if ($linkedOrders.Count -eq 0) {
            throw "No orders found with cart_id linking"
        }
        
        Write-Info "Found $($linkedOrders.Count) orders with cart_id linking"
    }
    
    Test-EndpointWithErrorHandling "Verify FIFO seller allocation" {
        $orders = Invoke-RestMethod -Uri "$BaseUrl/orders/buy" -Method GET -Headers $buyerHeaders
        $allocatedOrders = $orders.data.orders | Where-Object { $_.linked_order_id -ne $null }
        
        if ($allocatedOrders.Count -eq 0) {
            throw "No orders found with seller allocation (linked_order_id)"
        }
        
        Write-Info "Found $($allocatedOrders.Count) orders with FIFO seller allocation"
    }
}

# Main execution
Write-Host "🚀 Starting Order Endpoints Comprehensive Test" -ForegroundColor Magenta
Write-Host "Base URL: $BaseUrl" -ForegroundColor Gray

try {
    Initialize-Authentication
    
    Write-Host "`n📦 Testing SELL Order Endpoints..." -ForegroundColor Yellow
    Test-SellOrderEndpoints
    
    Write-Host "`n🛒 Testing Cart Setup..." -ForegroundColor Yellow
    Test-CartSetup
    
    Write-Host "`n🛍️ Testing BUY Order Endpoints..." -ForegroundColor Yellow
    Test-BuyOrderEndpoints
    
    Write-Host "`n🔍 Testing Order by ID Endpoints..." -ForegroundColor Yellow
    Test-OrderByIdEndpoints
    
    Write-Host "`n❌ Testing Error Handling..." -ForegroundColor Yellow
    Test-ErrorHandling
    
    Write-Host "`n🔗 Testing Cart-Order Linking..." -ForegroundColor Yellow
    Test-CartOrderLinking
}
catch {
    Write-Error "Critical error in test execution: $($_.Exception.Message)"
}

# Test Summary
Write-Host "`n" + "="*60 -ForegroundColor White
Write-Host "📊 TEST SUMMARY" -ForegroundColor Magenta
Write-Host "="*60 -ForegroundColor White
Write-Host "Total Tests: $($global:testResults.total)" -ForegroundColor White
Write-Success "Passed: $($global:testResults.passed)"
Write-Error "Failed: $($global:testResults.failed)"

if ($global:testResults.failed -gt 0) {
    Write-Host "`n❌ Failed Tests:" -ForegroundColor Red
    $global:testResults.errors | ForEach-Object { Write-Host "   • $_" -ForegroundColor Red }
}

$successRate = [math]::Round(($global:testResults.passed / $global:testResults.total) * 100, 2)
Write-Host "`nSuccess Rate: $successRate%" -ForegroundColor $(if ($successRate -eq 100) { "Green" } elseif ($successRate -ge 80) { "Yellow" } else { "Red" })

Write-Host "`n🎉 Order endpoints testing complete!" -ForegroundColor Green