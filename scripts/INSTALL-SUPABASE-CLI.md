# Installing Supabase CLI on Windows

Supabase CLI **does not support** global npm installation anymore. Use one of these methods:

---

## Method 1: Using Scoop (Recommended for Windows)

### Step 1: Install Scoop (if not installed)

Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Step 2: Install Supabase CLI

```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### Step 3: Verify Installation

```powershell
supabase --version
```

---

## Method 2: Using Chocolatey

### Step 1: Install Chocolatey (if not installed)

Open PowerShell as Administrator and run:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Step 2: Install Supabase CLI

```powershell
choco install supabase
```

### Step 3: Verify Installation

```powershell
supabase --version
```

---

## Method 3: Direct Download (Manual)

### Step 1: Download Binary

1. Go to: https://github.com/supabase/cli/releases/latest
2. Download: `supabase_windows_amd64.zip` (or appropriate for your architecture)
3. Extract the ZIP file

### Step 2: Add to PATH

1. Copy `supabase.exe` to a folder (e.g., `C:\Tools\supabase\`)
2. Add folder to PATH:
   - Open "Environment Variables"
   - Edit "Path" variable
   - Add: `C:\Tools\supabase\`
   - Click OK

### Step 3: Verify Installation

Open new PowerShell window:

```powershell
supabase --version
```

---

## Method 4: Using npx (No Installation Needed)

You can use Supabase CLI without installing it globally:

```powershell
# Instead of: supabase login
npx supabase login

# Instead of: supabase link
npx supabase link --project-ref YOUR_REF

# Instead of: supabase db dump
npx supabase db dump --schema public -f schema.sql
```

**Note:** This downloads the CLI each time, so it's slower but works without installation.

---

## Recommended: Use Method 1 (Scoop) or Method 4 (npx)

- **Scoop**: Best for permanent installation
- **npx**: Best if you don't want to install anything

---

## After Installation

Once Supabase CLI is installed, proceed with migration:

1. See `QUICK-START-MIGRATION.md` for migration steps
2. Or use `migrate-database.ps1` script (will be updated to use npx if needed)

---

## Troubleshooting

### "supabase: command not found"
- Make sure Supabase CLI is in your PATH
- Restart PowerShell/terminal after installation
- Verify with: `supabase --version`

### "Permission denied"
- Run PowerShell as Administrator
- Check PATH environment variable

---

**Next Step:** Once installed, proceed with `QUICK-START-MIGRATION.md`





