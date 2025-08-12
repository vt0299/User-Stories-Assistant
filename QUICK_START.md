# Quick Start Guide - User Stories Assistant

Get up and running with the User Stories Assistant in under 10 minutes!

## 🚀 Prerequisites

Before you begin, ensure you have:
- **Python 3.11+** installed
- **Node.js 20+** installed  
- **OpenAI API key** (get one at [platform.openai.com](https://platform.openai.com))

## ⚡ Quick Setup (5 minutes)

### 1. Download and Extract
Extract the project files to your desired location.

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env and add your OpenAI API key:
# OPENAI_API_KEY=your_actual_api_key_here
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory (new terminal)
cd frontend/user-stories-frontend

# Install dependencies
npm install
```

## 🏃‍♂️ Run the Application

### Start Backend (Terminal 1)
```bash
cd backend
python main.py
```
✅ Backend running at: `http://localhost:8000`

### Start Frontend (Terminal 2)
```bash
cd frontend/user-stories-frontend
npm run dev -- --host
```
✅ Frontend running at: `http://localhost:5173`

## 🎯 Test the Application

1. **Open your browser** to `http://localhost:5173`
2. **Click "Load Example"** to populate sample data
3. **Click "Transform to User Stories"** to see the magic happen!
4. **Explore the generated user stories** with INVEST criteria and Gherkin acceptance criteria

## 📋 What You'll See

The application will transform raw customer notes like:
> "Our e-commerce platform needs a better checkout experience..."

Into structured user stories like:
> **As a customer, I want a simplified checkout process so that I can complete purchases quickly**
> 
> - ✅ INVEST Compliant (6/6 criteria)
> - 📝 Clear Definition of Done
> - 🧪 Gherkin Acceptance Criteria
> - 🔍 Ambiguity Detection

## 🛠️ Troubleshooting

### Backend won't start?
- Check Python version: `python --version`
- Verify OpenAI API key in `.env` file
- Install dependencies: `pip install -r requirements.txt`

### Frontend won't start?
- Check Node.js version: `node --version`
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`

### API errors?
- Verify your OpenAI API key is valid
- Check your OpenAI account has credits
- Ensure internet connection is stable

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed features
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for comprehensive setup
- Explore [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for production deployment

## 💡 Pro Tips

- Use the "Load Example" button to quickly test functionality
- Try different types of requirements (mobile app, web platform, etc.)
- Export your user stories to JSON for use in other tools
- Track acceptance test status for each user story

---

**🎉 You're all set! Start transforming your customer notes into professional user stories!**

