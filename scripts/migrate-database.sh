#!/bin/bash

# Supabase Database Migration Script
# Method 1: Using Supabase CLI
# 
# Usage:
#   chmod +x migrate-database.sh
#   ./migrate-database.sh

set -e  # Exit on error

echo "🚀 Supabase Database Migration Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if Supabase CLI is installed
echo "📦 Step 1: Checking Supabase CLI installation..."
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found!${NC}"
    echo "Installing Supabase CLI..."
    npm install -g supabase
    echo -e "${GREEN}✅ Supabase CLI installed${NC}"
else
    echo -e "${GREEN}✅ Supabase CLI is installed${NC}"
    supabase --version
fi
echo ""

# Step 2: Export from Source
echo "📤 Step 2: Exporting from SOURCE database"
echo "----------------------------------------"
read -p "Enter SOURCE project reference ID: " SOURCE_REF
read -p "Enter SOURCE database password: " -s SOURCE_PASSWORD
echo ""

echo "Logging in to Supabase..."
supabase login

echo "Linking to source project..."
supabase link --project-ref "$SOURCE_REF"

# Create backup directory
BACKUP_DIR="supabase_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Exporting schema..."
supabase db dump --schema public -f "$BACKUP_DIR/schema.sql" || {
    echo -e "${YELLOW}⚠️  Schema export failed, trying alternative method...${NC}"
    # Alternative: Use pg_dump directly
    pg_dump "postgresql://postgres:$SOURCE_PASSWORD@db.$SOURCE_REF.supabase.co:5432/postgres" \
        --schema-only --no-owner --no-acl -f "$BACKUP_DIR/schema.sql"
}

echo "Exporting data..."
supabase db dump --data-only -f "$BACKUP_DIR/data.sql" || {
    echo -e "${YELLOW}⚠️  Data export failed, trying alternative method...${NC}"
    # Alternative: Use pg_dump directly
    pg_dump "postgresql://postgres:$SOURCE_PASSWORD@db.$SOURCE_REF.supabase.co:5432/postgres" \
        --data-only --no-owner --no-acl -f "$BACKUP_DIR/data.sql"
}

echo -e "${GREEN}✅ Export complete! Files saved to: $BACKUP_DIR${NC}"
echo ""

# Step 3: Import to Target
echo "📥 Step 3: Importing to TARGET database"
echo "---------------------------------------"
read -p "Enter TARGET project reference ID: " TARGET_REF
read -p "Enter TARGET database password: " -s TARGET_PASSWORD
echo ""

echo "Logging out and switching to target account..."
supabase logout
supabase login

echo "Linking to target project..."
supabase link --project-ref "$TARGET_REF"

echo "Pushing schema to target database..."
supabase db push || {
    echo -e "${YELLOW}⚠️  Schema push failed, trying direct import...${NC}"
    psql "postgresql://postgres:$TARGET_PASSWORD@db.$TARGET_REF.supabase.co:5432/postgres" < "$BACKUP_DIR/schema.sql"
}

echo "Importing data to target database..."
psql "postgresql://postgres:$TARGET_PASSWORD@db.$TARGET_REF.supabase.co:5432/postgres" < "$BACKUP_DIR/data.sql" || {
    echo -e "${YELLOW}⚠️  Direct connection failed, trying pooled connection...${NC}"
    # Try pooled connection
    read -p "Enter TARGET region (e.g., us-east-1): " TARGET_REGION
    psql "postgresql://postgres.$TARGET_REF:$TARGET_PASSWORD@aws-0-$TARGET_REGION.pooler.supabase.com:6543/postgres" < "$BACKUP_DIR/data.sql"
}

echo -e "${GREEN}✅ Migration complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "1. Verify data in target database"
echo "2. Update environment variables with new API keys"
echo "3. Test your application"
echo ""
echo "Backup files are in: $BACKUP_DIR"









