# Tale Global - Universal Setup Guide

## Quick Start (All Operating Systems)

### Windows Users:
1. Double-click `start-backend-universal.bat` to start the backend
2. Double-click `start-frontend-universal.bat` to start the frontend

### macOS/Linux Users:
1. Open Terminal and run: `chmod +x start-backend-universal.sh start-frontend-universal.sh`
2. Run: `./start-backend-universal.sh` to start the backend
3. Run: `./start-frontend-universal.sh` to start the frontend

## Manual Setup

### Prerequisites (All OS):
- Node.js 16+ installed from https://nodejs.org/

### Backend Setup:
```bash
cd backend
npm install
npm start
```

### Frontend Setup:
```bash
cd frontend
npm install
npm start
```

## Testing Backend Connection

### Health Check URLs:
- Root: http://localhost:5000/
- Health: http://localhost:5000/health
- API Health: http://localhost:5000/api/health

### Frontend URL:
- http://localhost:3000

## Troubleshooting

### 404 Errors:
1. Make sure backend is running on port 5000
2. Check if Node.js is installed: `node --version`
3. Check if npm is installed: `npm --version`

### Port Already in Use:
- Backend: Change PORT in backend/.env file
- Frontend: React will prompt to use different port

### CORS Issues:
- Make sure both frontend (3000) and backend (5000) are running
- Check browser console for detailed error messages

## Cross-Platform Compatibility

This setup works on:
- ✅ Windows 10/11
- ✅ macOS (Intel & Apple Silicon)
- ✅ Linux (Ubuntu, CentOS, etc.)
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)

## Production Deployment

For production, update the API URL in `frontend/.env`:
```
REACT_APP_API_URL=https://yourdomain.com/api
```