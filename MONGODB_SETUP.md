# MongoDB Atlas Setup Guide

## Step-by-Step Instructions

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free" or "Sign Up"
3. Sign up with email or Google/GitHub account

### Step 2: Create a Free Cluster
1. After login, click "Build a Database"
2. Choose **"M0 FREE"** (Free tier)
3. Select Cloud Provider: **AWS** (recommended)
4. Choose Region closest to you (e.g., **Mumbai** for India)
5. Click **"Create"** (takes 3-5 minutes)

### Step 3: Create Database User
1. Go to **Security → Database Access**
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `foodtracking_admin` (or your choice)
5. Password: Create a strong password (SAVE THIS!)
6. Database User Privileges: **"Atlas admin"** or **"Read and write to any database"**
7. Click **"Add User"**

### Step 4: Configure Network Access
1. Go to **Security → Network Access**
2. Click **"Add IP Address"** button
3. In the modal that opens:
   - **Access List Entry**: Type `0.0.0.0/0` (this allows access from anywhere)
   - **Comment** (optional): Type "Allow from anywhere" or leave blank
4. Click **"Confirm"** button
   - ⚠️ For production, add only your specific server IPs instead of 0.0.0.0/0

### Step 5: Get Connection String
1. Go to **"Database"** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update .env File
Replace the connection string in your `.env` file:

**Format:**
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/foodtracking?retryWrites=true&w=majority
```

**Example:**
```
MONGODB_URI=mongodb+srv://foodtracking_admin:MyPassword123@cluster0.abc123.mongodb.net/foodtracking?retryWrites=true&w=majority
```

**Important:**
- Replace `<username>` with your database username
- Replace `<password>` with your database password
- Replace `cluster0.xxxxx` with your actual cluster address
- Add `/foodtracking` before the `?` to specify database name

### Step 7: Test Connection
1. Run setup script to create users:
   ```bash
   node setup.js
   ```
2. Start your server:
   ```bash
   npm start
   ```
3. Check console for "MongoDB Connected" message

### Troubleshooting

**Connection Error?**
- Check username/password are correct
- Verify IP address is whitelisted (0.0.0.0/0 for development)
- Ensure cluster is fully created (green status)
- Check connection string format is correct

**Password Special Characters?**
- If password has special characters like `@`, `#`, `%`, encode them:
  - `@` becomes `%40`
  - `#` becomes `%23`
  - `%` becomes `%25`
- Or use URL encoding tool
