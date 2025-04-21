$headers = @{
    'Content-Type' = 'application/json'
}
$body = @{
    username = "testadmin"
    password = "Test@123"
} | ConvertTo-Json

Write-Host "Sending request to login endpoint..."
Write-Host "Request body: $body"

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:3000/api/auth/login' -Method Post -Headers $headers -Body $body -UseBasicParsing
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response Body: $($response.Content)"
} catch {
    Write-Host "Error occurred:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    if ($_.Exception.Response) {
        $result = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($result)
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Error Response: $responseBody"
    } else {
        Write-Host "Error: $($_.Exception.Message)"
    }
} 