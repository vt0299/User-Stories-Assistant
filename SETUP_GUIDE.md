# User Stories Assistant - Complete Setup Guide

This guide provides step-by-step instructions for setting up and running the User Stories Assistant application locally.

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Python**: Version 3.11 or higher
- **Node.js**: Version 20 or higher
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space
- **Internet**: Stable connection for API calls

### Recommended Development Environment
- **IDE**: VS Code, PyCharm, or similar
- **Terminal**: Command line access
- **Git**: For version control
- **Package Managers**: pip for Python, npm/pnpm for Node.js

## Pre-Installation Checklist

### 1. Verify Python Installation

```bash
python --version
# or
python3 --version
```

Expected output: `Python 3.11.x` or higher

If Python is not installed:
- **Windows**: Download from [python.org](https://python.org)
- **macOS**: Use Homebrew: `brew install python@3.11`
- **Linux**: Use package manager: `sudo apt install python3.11`

### 2. Verify Node.js Installation

```bash
node --version
npm --version
```

Expected output: Node.js v20.x.x or higher

If Node.js is not installed:
- Download from [nodejs.org](https://nodejs.org)
- Or use a version manager like nvm

### 3. Obtain OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and securely store the key

## Installation Steps

### Step 1: Download the Project

#### Option A: Download ZIP
1. Download the project ZIP file
2. Extract to your desired location
3. Open terminal in the extracted folder

#### Option B: Clone Repository (if available)
```bash
git clone <repository-url>
cd user_stories_assistant
```

### Step 2: Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Create Virtual Environment (Recommended)**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install Python Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

   If you encounter errors, try:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env file with your settings
   ```

   Edit the `.env` file:
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=your_actual_api_key_here
   OPENAI_API_BASE=https://api.openai.com/v1
   
   # Application Configuration
   DEBUG=True
   HOST=0.0.0.0
   PORT=8000
   ```

5. **Test Backend Installation**
   ```bash
   python test_simple.py
   ```

   Expected output should show successful user story generation.

### Step 3: Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd ../frontend/user-stories-frontend
   ```

2. **Install Node.js Dependencies**
   
   Using npm:
   ```bash
   npm install
   ```
   
   Or using pnpm (faster):
   ```bash
   npm install -g pnpm
   pnpm install
   ```

3. **Verify Frontend Installation**
   ```bash
   npm run build
   ```

   This should complete without errors.

## Running the Application

### Step 1: Start the Backend Server

1. **Open Terminal 1**
   ```bash
   cd backend
   
   # Activate virtual environment if using one
   source venv/bin/activate  # macOS/Linux
   # or
   venv\Scripts\activate     # Windows
   
   # Start the server
   python main.py
   ```

2. **Verify Backend is Running**
   - Open browser to `http://localhost:8000`
   - You should see: `{"message":"User Stories Assistant API","status":"running","version":"1.0.0"}`

### Step 2: Start the Frontend Server

1. **Open Terminal 2**
   ```bash
   cd frontend/user-stories-frontend
   
   # Start development server
   npm run dev -- --host
   ```

2. **Access the Application**
   - Open browser to `http://localhost:5173`
   - You should see the User Stories Assistant interface

## Testing the Complete Setup

### 1. Basic Functionality Test

1. **Load Example Data**
   - Click "Load Example" button
   - Verify example text appears in the textarea

2. **Transform Notes**
   - Click "Transform to User Stories"
   - Wait for processing (should take 2-5 seconds)
   - Verify user stories appear below

3. **Interact with Results**
   - Expand acceptance criteria sections
   - Test the Pass/Fail/Reset buttons
   - Try the Export JSON functionality

### 2. API Endpoint Testing

Test individual API endpoints:

```bash
# Test health endpoint
curl http://localhost:8000/

# Test stats endpoint
curl http://localhost:8000/stats

# Test user stories endpoint
curl http://localhost:8000/user_stories
```

## Troubleshooting Common Issues

### Backend Issues

#### Issue: "ModuleNotFoundError"
**Solution:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### Issue: "OpenAI API Error"
**Possible Causes:**
- Invalid API key
- Insufficient credits
- Network connectivity

**Solution:**
1. Verify API key in `.env` file
2. Check OpenAI account balance
3. Test internet connection

#### Issue: "Port 8000 already in use"
**Solution:**
```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process or change port in main.py
```

### Frontend Issues

#### Issue: "npm install fails"
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Build errors"
**Solution:**
```bash
# Check Node.js version
node --version

# Update to Node.js 20+
# Clear and reinstall dependencies
```

#### Issue: "CORS errors in browser"
**Solution:**
- Ensure backend is running on port 8000
- Check browser console for specific error messages
- Verify API_BASE_URL in frontend code

### Network Issues

#### Issue: "Cannot connect to backend"
**Checklist:**
1. Backend server is running (`python main.py`)
2. No firewall blocking port 8000
3. Correct URL in frontend (`http://localhost:8000`)

#### Issue: "OpenAI API timeouts"
**Solutions:**
1. Check internet connection stability
2. Increase timeout in code if needed
3. Verify OpenAI service status

## Development Tips

### 1. Hot Reloading
- Backend: Use `uvicorn main:app --reload` for auto-restart
- Frontend: `npm run dev` provides hot module replacement

### 2. Debugging
- Enable debug logging in backend
- Use browser developer tools for frontend
- Check terminal outputs for error messages

### 3. Code Formatting
```bash
# Backend formatting
pip install black
black .

# Frontend formatting
npm install -g prettier
prettier --write .
```

### 4. Environment Management
- Use virtual environments for Python
- Consider using Docker for consistent environments
- Keep `.env` files secure and never commit them

## Performance Optimization

### Backend Optimization
- Use production ASGI server (Gunicorn + Uvicorn)
- Implement caching for repeated requests
- Add request rate limiting

### Frontend Optimization
- Build for production: `npm run build`
- Enable gzip compression
- Optimize bundle size

## Security Considerations

### API Key Security
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly
- Monitor API usage

### Network Security
- Use HTTPS in production
- Implement proper CORS policies
- Add authentication if needed

## Next Steps

After successful setup:

1. **Explore Features**: Test all application features thoroughly
2. **Customize**: Modify prompts, validation rules, or UI as needed
3. **Deploy**: Consider deployment options for production use
4. **Monitor**: Set up logging and monitoring for production environments

## Getting Help

If you encounter issues not covered in this guide:

1. Check the main README.md for additional information
2. Review error messages carefully
3. Search for similar issues online
4. Contact the development team

---

**Setup completed successfully? You're ready to transform customer notes into professional user stories!**

