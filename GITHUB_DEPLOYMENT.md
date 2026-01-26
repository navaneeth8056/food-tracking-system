# GitHub & Render Deployment Guide

## Step 1: Initialize Git Repository (if not already done)

Open terminal/PowerShell in your project folder and run:

```bash
cd "c:\Users\ADMIN\Documents\Food tracking"
git init
```

## Step 2: Create .gitignore (if not exists)

Make sure `.gitignore` includes:
- `node_modules/`
- `.env` (IMPORTANT - don't commit your MongoDB password!)
- `*.log`

## Step 3: Add Files to Git

```bash
git add .
```

This adds all files except those in `.gitignore`.

## Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: Food tracking system"
```

## Step 5: Create GitHub Repository

1. Go to https://github.com
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository name: `food-tracking-system` (or your choice)
4. Description: "Food delivery tracking system for home food provider"
5. Choose: **Public** or **Private**
6. **DO NOT** check "Initialize with README" (we already have files)
7. Click **"Create repository"**

## Step 6: Connect Local Repository to GitHub

After creating the repository, GitHub will show commands. Use these:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/food-tracking-system.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

**If you need to authenticate:**
- GitHub may ask for username and password
- For password, use a **Personal Access Token** (not your GitHub password)
- To create token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
- Give it `repo` permissions

## Step 7: Verify Push

1. Go to your GitHub repository page
2. You should see all your files there
3. Make sure `.env` is **NOT** visible (it should be ignored)

## Step 8: Deploy to Render

### 8.1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. Connect your GitHub account if using email

### 8.2: Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click **"Connect account"** if not connected
   - Select your repository: `food-tracking-system`
   - Click **"Connect"**

### 8.3: Configure Service

Fill in the details:

- **Name**: `food-tracking-system` (or your choice)
- **Environment**: `Node`
- **Region**: Choose closest to you (e.g., `Singapore` for India)
- **Branch**: `main`
- **Root Directory**: Leave empty (or `./` if needed)
- **Build Command**: `npm install`
- **Start Command**: `node server.js`

### 8.4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add:

1. **MONGODB_URI**
   - Value: Your MongoDB Atlas connection string
   - Example: `mongodb+srv://foodtracking_admin:YOUR_PASSWORD@cluster0.zkhh3uc.mongodb.net/foodtracking?retryWrites=true&w=majority`

2. **JWT_SECRET**
   - Value: A random secret string (e.g., `my-super-secret-jwt-key-2024`)
   - Generate a strong random string

3. **PORT**
   - Value: `3000` (or leave empty - Render sets it automatically)

### 8.5: Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait 2-5 minutes for deployment
4. You'll see build logs in real-time

### 8.6: Setup Users After Deployment

After deployment is complete:

1. Your app will be live at: `https://food-tracking-system.onrender.com` (or your custom name)
2. You need to run the setup script to create admin/delivery users
3. Options:
   
   **Option A: Add setup endpoint (temporary)**
   - Add this to `server.js` temporarily:
   ```javascript
   app.post('/api/setup-users', async (req, res) => {
     // Copy code from setup.js
     // Run once, then remove this endpoint
   });
   ```
   - Call it once via Postman or browser
   - Remove the endpoint after setup
   
   **Option B: Use MongoDB Compass**
   - Connect to your MongoDB Atlas cluster
   - Manually create users in the `users` collection
   
   **Option C: SSH into Render (if available)**
   - Run `node setup.js` via Render's shell

## Step 9: Access Your Deployed App

1. Once deployed, Render gives you a URL like:
   - `https://food-tracking-system.onrender.com`
2. Visit the URL in your browser
3. Login with:
   - Admin: `admin` / `admin123`
   - Delivery: `delivery` / `delivery123`

## Step 10: Custom Domain (Optional)

1. In Render dashboard → Your service → Settings
2. Scroll to "Custom Domains"
3. Add your domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails?
- Check build logs in Render dashboard
- Ensure `package.json` has all dependencies
- Verify Node version compatibility

### App Crashes?
- Check logs in Render dashboard
- Verify environment variables are set correctly
- Check MongoDB connection string format

### Can't Connect to MongoDB?
- Verify IP whitelist in MongoDB Atlas (should have `0.0.0.0/0` for Render)
- Check username/password in connection string
- Ensure database user has correct permissions

### Environment Variables Not Working?
- Make sure variable names match exactly (case-sensitive)
- Redeploy after adding/changing variables
- Check for typos in values

## Important Notes

1. **Never commit `.env` file** - it contains sensitive data
2. **Free tier limitations**: Render free tier spins down after 15 mins of inactivity
3. **First request may be slow** - free tier has cold starts
4. **MongoDB Atlas free tier** - 512MB storage, suitable for small apps
5. **Change default passwords** after first login!

## Quick Command Reference

```bash
# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Your commit message"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/food-tracking-system.git

# Push to GitHub
git push -u origin main

# Future updates
git add .
git commit -m "Update description"
git push
```
