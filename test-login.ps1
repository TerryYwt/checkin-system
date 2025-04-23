# Load environment variables from .env file if it exists
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $key = $matches[1]
            $value = $matches[2]
            Set-Item "env:$key" $value
        }
    }
}

# Use environment variable for password, fallback to default if not set
$password = $env:TEST_USER_PASSWORD
if (-not $password) {
    Write-Warning "TEST_USER_PASSWORD environment variable not set. Please set it in your .env file."
    exit 1
}

$body = @{
    email = "test@example.com"
    password = $password
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $body -Headers $headers
    Write-Output "Login successful!"
    Write-Output $response
} catch {
    Write-Error "Login failed: $_"
    exit 1
} 