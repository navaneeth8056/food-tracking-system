# Food Tracking System

A web application for managing food delivery and tracking client food collection days.

## Features

- **Admin Login**: Full access to manage clients and track food delivery
- **Delivery Login**: View client details (name, phone, address)
- **Client Management**: Add, edit, delete clients with place-wise segregation
- **Calendar System**: Mark food received (green) or not received (red) for each date
- **Days Management**: Track total days and remaining days, add days when client pays

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/foodtracking
JWT_SECRET=your-secret-key-change-this
PORT=3000
```

### 3. Setup Database and Users

```bash
node setup.js
```

This creates default users:
- Admin: username=`admin`, password=`admin123`
- Delivery: username=`delivery`, password=`delivery123`

### 4. Run the Application

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

## Deployment to Render

### Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string (replace `<password>` with your password)
5. Add your IP to whitelist (or use 0.0.0.0/0 for all IPs)

### Step 2: Deploy to Render

1. Push your code to GitHub
2. Go to [Render](https://render.com)
3. Create new Web Service
4. Connect your GitHub repository
5. Configure:
   - **Name**: food-tracking-system
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A random secret string
   - `PORT`: 3000 (or leave empty, Render sets it automatically)
7. Deploy

### Step 3: Setup Users on Deployed App

After deployment, you need to run the setup script. You can:
- SSH into your Render instance, or
- Create a temporary endpoint in server.js to run setup, or
- Use MongoDB Compass to manually create users

## Default Login Credentials

- **Admin**: admin / admin123
- **Delivery**: delivery / delivery123

**Important**: Change these passwords after first login!

## Project Structure

```
Food tracking/
├── server.js          # Express server and API routes
├── setup.js           # Initial user setup script
├── package.json       # Dependencies
├── .env.example       # Environment variables template
├── public/
│   ├── index.html     # Login page
│   ├── admin.html     # Admin dashboard
│   ├── delivery.html  # Delivery dashboard
│   ├── styles.css     # All styles
│   ├── auth.js        # Authentication logic
│   ├── admin.js       # Admin functionality
│   └── delivery.js    # Delivery functionality
└── README.md          # This file
```

## API Endpoints

- `POST /api/login` - User login
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get client by ID
- `POST /api/clients` - Add new client (admin only)
- `PUT /api/clients/:id` - Update client (admin only)
- `DELETE /api/clients/:id` - Delete client (admin only)
- `POST /api/clients/:id/food-status` - Mark food status (admin only)
- `POST /api/clients/:id/add-days` - Add days to client (admin only)
- `GET /api/places` - Get all places
