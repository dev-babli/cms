# Supabase Database Migration Script (PowerShell)
# Method 1: Using Supabase CLI
# 
# Usage:
#   .\migrate-database.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Supabase Database Migration Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Supabase CLI is installed
Write-Host "📦 Step 1: Checking Supabase CLI installation..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✅ Supabase CLI is installed: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    npm install -g supabase
    Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Export from Source
Write-Host "📤 Step 2: Exporting from SOURCE database" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$sourceRef = Read-Host "Enter SOURCE project reference ID"
$sourcePassword = Read-Host "Enter SOURCE database password" -AsSecureString
$sourcePasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sourcePassword)
)

Write-Host "Logging in to Supabase..." -ForegroundColor Yellow
supabase login

Write-Host "Linking to source project..." -ForegroundColor Yellow
supabase link --project-ref $sourceRef

# Create backup directory
$backupDir = "supabase_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "Exporting schema..." -ForegroundColor Yellow
try {
    supabase db dump --schema public -f "$backupDir\schema.sql"
    Write-Host "✅ Schema exported" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Schema export failed, trying alternative method..." -ForegroundColor Yellow
    # Alternative: Use pg_dump directly
    $sourceConn = "postgresql://postgres:$sourcePasswordPlain@db.$sourceRef.supabase.co:5432/postgres"
    pg_dump $sourceConn --schema-only --no-owner --no-acl -f "$backupDir\schema.sql"
}

Write-Host "Exporting data..." -ForegroundColor Yellow
try {
    supabase db dump --data-only -f "$backupDir\data.sql"
    Write-Host "✅ Data exported" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Data export failed, trying alternative method..." -ForegroundColor Yellow
    # Alternative: Use pg_dump directly
    $sourceConn = "postgresql://postgres:$sourcePasswordPlain@db.$sourceRef.supabase.co:5432/postgres"
    pg_dump $sourceConn --data-only --no-owner --no-acl -f "$backupDir\data.sql"
}

Write-Host "✅ Export complete! Files saved to: $backupDir" -ForegroundColor Green
Write-Host ""

# Step 3: Import to Target
Write-Host "📥 Step 3: Importing to TARGET database" -ForegroundColor Yellow
Write-Host "---------------------------------------" -ForegroundColor Yellow

$targetRef = Read-Host "Enter TARGET project reference ID"
$targetPassword = Read-Host "Enter TARGET database password" -AsSecureString
$targetPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($targetPassword)
)

Write-Host "Logging out and switching to target account..." -ForegroundColor Yellow
supabase logout
supabase login

Write-Host "Linking to target project..." -ForegroundColor Yellow
supabase link --project-ref $targetRef

Write-Host "Pushing schema to target database..." -ForegroundColor Yellow
try {
    supabase db push
    Write-Host "✅ Schema imported" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Schema push failed, trying direct import..." -ForegroundColor Yellow
    $targetConn = "postgresql://postgres:$targetPasswordPlain@db.$targetRef.supabase.co:5432/postgres"
    Get-Content "$backupDir\schema.sql" | psql $targetConn
}

Write-Host "Importing data to target database..." -ForegroundColor Yellow
try {
    $targetConn = "postgresql://postgres:$targetPasswordPlain@db.$targetRef.supabase.co:5432/postgres"
    Get-Content "$backupDir\data.sql" | psql $targetConn
    Write-Host "✅ Data imported" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Direct connection failed, trying pooled connection..." -ForegroundColor Yellow
    $targetRegion = Read-Host "Enter TARGET region (e.g., us-east-1)"
    $pooledConn = "postgresql://postgres.$targetRef:$targetPasswordPlain@aws-0-$targetRegion.pooler.supabase.com:6543/postgres"
    Get-Content "$backupDir\data.sql" | psql $pooledConn
}

Write-Host ""
Write-Host "✅ Migration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify data in target database"
Write-Host "2. Update environment variables with new API keys"
Write-Host "3. Test your application"
Write-Host ""
Write-Host "Backup files are in: $backupDir" -ForegroundColor Yellow





