# Supabase Database Migration Script (Using npx - No Installation Required)
# 
# Usage:
#   .\migrate-with-npx.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 Supabase Database Migration Script (npx method)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Node.js
Write-Host "📦 Step 1: Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
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
npx supabase login

Write-Host "Linking to source project..." -ForegroundColor Yellow
npx supabase link --project-ref $sourceRef

# Create backup directory
$backupDir = "supabase_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

Write-Host "Exporting schema..." -ForegroundColor Yellow
try {
    npx supabase db dump --schema public -f "$backupDir\schema.sql"
    Write-Host "✅ Schema exported" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Schema export failed, trying alternative method..." -ForegroundColor Yellow
    # Alternative: Use pg_dump directly
    $sourceConn = "postgresql://postgres:$sourcePasswordPlain@db.$sourceRef.supabase.co:5432/postgres"
    if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
        pg_dump $sourceConn --schema-only --no-owner --no-acl -f "$backupDir\schema.sql"
    } else {
        Write-Host "❌ pg_dump not found. Please install PostgreSQL client tools." -ForegroundColor Red
        Write-Host "   Or manually export schema from Supabase Dashboard → SQL Editor" -ForegroundColor Yellow
    }
}

Write-Host "Exporting data..." -ForegroundColor Yellow
try {
    npx supabase db dump --data-only -f "$backupDir\data.sql"
    Write-Host "✅ Data exported" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Data export failed, trying alternative method..." -ForegroundColor Yellow
    # Alternative: Use pg_dump directly
    $sourceConn = "postgresql://postgres:$sourcePasswordPlain@db.$sourceRef.supabase.co:5432/postgres"
    if (Get-Command pg_dump -ErrorAction SilentlyContinue) {
        pg_dump $sourceConn --data-only --no-owner --no-acl -f "$backupDir\data.sql"
    } else {
        Write-Host "❌ pg_dump not found. Please install PostgreSQL client tools." -ForegroundColor Red
        Write-Host "   Or manually export data from Supabase Dashboard → SQL Editor" -ForegroundColor Yellow
    }
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
npx supabase logout
npx supabase login

Write-Host "Linking to target project..." -ForegroundColor Yellow
npx supabase link --project-ref $targetRef

Write-Host "Pushing schema to target database..." -ForegroundColor Yellow
try {
    npx supabase db push
    Write-Host "✅ Schema imported" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Schema push failed, trying direct import..." -ForegroundColor Yellow
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        $targetConn = "postgresql://postgres:$targetPasswordPlain@db.$targetRef.supabase.co:5432/postgres"
        Get-Content "$backupDir\schema.sql" | psql $targetConn
    } else {
        Write-Host "❌ psql not found. Please install PostgreSQL client tools." -ForegroundColor Red
        Write-Host "   Or manually import schema from Supabase Dashboard → SQL Editor" -ForegroundColor Yellow
    }
}

Write-Host "Importing data to target database..." -ForegroundColor Yellow
try {
    if (Get-Command psql -ErrorAction SilentlyContinue) {
        $targetConn = "postgresql://postgres:$targetPasswordPlain@db.$targetRef.supabase.co:5432/postgres"
        Get-Content "$backupDir\data.sql" | psql $targetConn
        Write-Host "✅ Data imported" -ForegroundColor Green
    } else {
        Write-Host "⚠️  psql not found, trying pooled connection..." -ForegroundColor Yellow
        $targetRegion = Read-Host "Enter TARGET region (e.g., us-east-1)"
        $pooledConn = "postgresql://postgres.$targetRef:$targetPasswordPlain@aws-0-$targetRegion.pooler.supabase.com:6543/postgres"
        Get-Content "$backupDir\data.sql" | psql $pooledConn
    }
} catch {
    Write-Host "❌ Data import failed. Please check connection string and try again." -ForegroundColor Red
    Write-Host "   You can also import manually from Supabase Dashboard → SQL Editor" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Migration complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify data in target database" -ForegroundColor White
Write-Host "2. Update environment variables with new API keys" -ForegroundColor White
Write-Host "3. Test your application" -ForegroundColor White
Write-Host ""
Write-Host "Backup files are in: $backupDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Tip: If you encounter connection issues, use the Supabase Dashboard SQL Editor" -ForegroundColor Cyan
Write-Host "   to manually run the SQL files from the backup directory." -ForegroundColor Cyan





