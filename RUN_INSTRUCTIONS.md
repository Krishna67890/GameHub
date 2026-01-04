# GameHub - Running Instructions

## Prerequisites

Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

## Running the Application

### 1. Development Mode (Hot Reload)
```bash
npm install
npm run dev
```
This will start the development server with hot reload at http://localhost:5173

### 2. Production Mode
```bash
npm install
npm run build
npm run serve
```
This will:
- Install all dependencies
- Build the application for production
- Start the production server at http://localhost:3000

## Troubleshooting

### Demo Account Login Issues
If demo account login is not working:

1. Clear your browser's localStorage:
   - Open browser developer tools (F12)
   - Go to Application/Storage tab
   - Find Local Storage
   - Right-click and clear all entries

2. Or hard refresh the page with Ctrl+Shift+R

### 404 Errors on Refresh
This application uses client-side routing. When running in production mode:

1. Always run `npm run build` before `npm run serve`
2. Access the application through the server (port 3000), not the development server
3. The server automatically redirects all routes to index.html

### If you encounter any issues:
1. Make sure you've run `npm install`
2. For production, always run `npm run build` before `npm run serve`
3. Clear browser cache and localStorage if login issues persist