# SmartPay FastAPI Project

A FastAPI-based payment processing API for SmartPay.

## Setup Instructions

1. **Install Python** (if not already installed)
   - Download from https://python.org
   - Make sure to check "Add Python to PATH" during installation

2. **Create and activate virtual environment**
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate it (Windows)
   venv\Scripts\activate
   
   # Activate it (Mac/Linux)
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   uvicorn main:app --reload
   ```

5. **Deactivate when done** (optional)
   ```bash
   deactivate
   ```

6. **Open your browser**
   - Go to http://localhost:8000
   - Go to http://localhost:8000/docs for interactive API documentation

## Available Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check

## Development Tips

- **Virtual Environment**: Always use `venv` to keep your project dependencies separate
- **Auto-reload**: The `--reload` flag makes the server restart automatically when you change code
- **Interactive Docs**: Visit `/docs` to see all endpoints and test them interactively
- **Start Building**: Add your payment processing endpoints here
