# Vercel Deployment Setup

This document explains how to configure environment variables in Vercel for the DeWatt project.

## Required Environment Variables

The following environment variables must be configured in your Vercel project:

### 1. MongoDB Configuration
- **MONGODB_URI**: Your MongoDB connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/`
  - Get from: [MongoDB Atlas](https://cloud.mongodb.com/)

### 2. Database Configuration
- **DB_NAME**: Your database name (default: `dewatt`)

### 3. Solana Configuration
- **SOLANA_RPC_URL**: Solana RPC endpoint
  - Devnet: `https://api.devnet.solana.com`
  - Mainnet: `https://api.mainnet-beta.solana.com`

### 4. Treasury Configuration
- **TREASURY_SECRET_KEY**: Base58 encoded Solana private key
  - Generate using: `solana-keygen new`
  - Never commit this to git!

### 5. Admin Configuration
- **ADMIN_API_KEY**: Secret key for admin endpoints
  - Generate a secure random string
  - Minimum 32 characters recommended

### 6. Email Configuration (Optional)
- **CONTACT_RECIPIENTS**: Comma-separated list of email addresses
  - Example: `admin@example.com,support@example.com`

## How to Add Environment Variables to Vercel

### Method 1: Using Vercel Dashboard

1. Go to your project at [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (DeWatt)
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - **Key**: Variable name (e.g., `MONGODB_URI`)
   - **Value**: Your secret value
   - **Environment**: Select all environments (Production, Preview, Development)
5. Click **Save**

### Method 2: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add MONGODB_URI
# Paste your MongoDB URI when prompted

vercel env add DB_NAME
# Enter: dewatt

vercel env add SOLANA_RPC_URL
# Enter: https://api.devnet.solana.com

vercel env add TREASURY_SECRET_KEY
# Paste your base58 private key

vercel env add ADMIN_API_KEY
# Paste your admin API key

vercel env add CONTACT_RECIPIENTS
# Enter your email addresses
```

### Method 3: Bulk Import

Create a file `.env.production` (DO NOT commit this):

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=dewatt
SOLANA_RPC_URL=https://api.devnet.solana.com
TREASURY_SECRET_KEY=your_base58_secret_key_here
ADMIN_API_KEY=your_admin_api_key_here
CONTACT_RECIPIENTS=admin@example.com
```

Then import:

```bash
vercel env pull .env.local
```

## After Adding Variables

1. Redeploy your project:
   ```bash
   vercel --prod
   ```

2. Or trigger a new deployment from GitHub by pushing a commit:
   ```bash
   git commit --allow-empty -m "chore: trigger redeployment"
   git push origin main
   ```

## Security Best Practices

- ✅ Never commit `.env` files to git
- ✅ Use different credentials for development and production
- ✅ Rotate secrets regularly
- ✅ Use MongoDB IP allowlist (add Vercel's IPs)
- ✅ Enable MongoDB authentication
- ✅ Use read-only credentials where possible

## Vercel IP Addresses

For MongoDB Atlas IP allowlist, add these Vercel IP ranges:
- Check current IPs at: https://vercel.com/docs/concepts/functions/serverless-functions/edge-caching#ip-addresses

Or allow all IPs (less secure):
- `0.0.0.0/0` (not recommended for production)

## MongoDB Atlas Setup

1. Create a cluster at [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a database user:
   - Go to **Database Access**
   - Click **Add New Database User**
   - Choose username/password authentication
   - Save credentials securely
3. Whitelist Vercel IPs:
   - Go to **Network Access**
   - Click **Add IP Address**
   - Add `0.0.0.0/0` for testing (allow all)
   - For production, add specific Vercel IP ranges
4. Get connection string:
   - Go to **Clusters** → **Connect**
   - Choose **Connect your application**
   - Copy the connection string
   - Replace `<password>` with your actual password

## Troubleshooting

### Error: "Environment Variable references Secret which does not exist"
- The environment variable is defined in `vercel.json` but not set in Vercel dashboard
- Solution: Add the missing variable in Vercel settings

### Error: "MongoServerError: Authentication failed"
- Wrong username or password in MONGODB_URI
- Solution: Check credentials in MongoDB Atlas

### Error: "MongoServerError: IP not whitelisted"
- Vercel's IP is not allowed in MongoDB Atlas
- Solution: Add `0.0.0.0/0` to Network Access or specific Vercel IPs

### Build succeeds but runtime fails
- Environment variables are only available at runtime
- Solution: Check Vercel function logs for specific errors

## Quick Start Command

After setting all variables in Vercel:

```bash
# Trigger redeployment
git commit --allow-empty -m "chore: redeploy with environment variables"
git push origin main
```

Your deployment should now succeed!
