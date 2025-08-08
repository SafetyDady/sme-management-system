#!/bin/bash
echo "🚀 Setting up SME Management System..."
echo "====================================="

# Check prerequisites
echo "🔍 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required (https://nodejs.org)"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 required"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required (https://docker.com)"; exit 1; }

echo "✅ All prerequisites found!"

# Setup Frontend
echo "🎨 Setting up Frontend..."
cd frontend
npm install
echo "✅ Frontend dependencies installed"
cd ..

# Setup Backend
echo "⚡ Setting up Backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
echo "✅ Backend dependencies installed"
cd ..

echo ""
echo "🎉 SME Management System Setup Complete!"
echo "========================================"
echo ""
echo "🚀 Quick Start Options:"
echo ""
echo "1. 🐳 Docker (Recommended):"
echo "   docker-compose up --build"
echo ""
echo "2. 🏃‍♂️ Manual Development:"
echo "   Frontend: cd frontend && npm run dev"
echo "   Backend:  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "🌐 Access URLs:"
echo "   • Frontend: http://localhost:3001 (Docker) / http://localhost:5173 (Manual)"
echo "   • Backend:  http://localhost:8001 (Docker) / http://localhost:8000 (Manual)"
echo "   • API Docs: http://localhost:8001/docs (Docker) / http://localhost:8000/docs (Manual)"
echo "   • Database: postgresql://postgres:smepass123@localhost:5434/sme_management_dev"
echo ""
echo "🔐 Default Credentials:"
echo "   • SuperAdmin: superadmin / Admin123!"
echo "   • Admin: admin1 / Admin123!"
echo "   • User: user4 / User123!"
echo ""
echo "📚 Next Steps:"
echo "   1. Start the system with Docker or manual setup"
echo "   2. Access frontend and test login"
echo "   3. Customize for SME-specific features"
echo "   4. Add SME management modules"
echo ""
echo "🎯 Ready for SME Management Development!"
