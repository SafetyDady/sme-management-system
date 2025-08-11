# 🏢 SME Management System

A comprehensive Small and Medium Enterprise management system built with modern technologies. **Now with complete HR Employee Management!** ⭐

## ✨ Current Features

### 🔐 Authentication & Security
- JWT-based authentication with role management
- Secure password hashing and validation
- Admin user auto-creation and management
- Production-ready security headers and CORS

### 👨‍💼 HR Employee Management ⭐ **NEW!**
- Complete employee CRUD operations  
- Department and position management
- Employment type classification (full-time/part-time/contract)
- Salary base tracking and contact management
- Advanced search and filtering capabilities
- Unicode support for international names
- Admin-only access controls

### 👥 User Management
- Role-based access control (SuperAdmin/Admin/User)
- User profile management and password updates
- User status management and oversight

## 📦 Tech Stack

### Frontend
- **React 19** with Vite
- **TailwindCSS** for styling
- **Shadcn/UI** components
- **React Router** for navigation
- **JWT Authentication**

### Backend
- **FastAPI** with Python 3.11+
- **PostgreSQL** database
- **Alembic** for migrations
- **JWT** authentication
- **Role-based access control**

### Infrastructure
- **Docker** for containerization
- **PostgreSQL** for data persistence
- **Nginx** for production deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL (if running locally)

### 1. Setup
```bash
./setup.sh
```

### 2. Start Development (Docker - Recommended)
```bash
docker-compose up --build
```

### 3. Access Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8001
- **API Documentation**: http://localhost:8001/docs

### 4. Default Login
- **SuperAdmin**: `superadmin` / `Admin123!`
- **Admin**: `admin1` / `Admin123!`

## 🏗️ Project Structure

```
sme-management/
├── 📁 frontend/              # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities & API
│   └── public/              # Static assets
│
├── 📁 backend/               # FastAPI backend
│   ├── app/
│   │   ├── routers/         # API routes
│   │   ├── models.py        # Database models
│   │   └── schemas.py       # Pydantic schemas
│   ├── alembic/             # Database migrations
│   └── main.py              # FastAPI app
│
├── 🐳 docker-compose.yml     # Development environment
├── 📋 README.md              # This file
└── 🚀 setup.sh               # Setup script
```

## 📚 SME Management Features

### 🏢 Core Features
- [ ] **Company Management**
- [ ] **Employee Management**
- [ ] **Department Structure**
- [ ] **Role & Permission System**

### 💰 Financial Management
- [ ] **Budget Planning**
- [ ] **Expense Tracking**
- [ ] **Revenue Monitoring**
- [ ] **Financial Reports**

### 📊 Analytics & Reports
- [ ] **Business Metrics Dashboard**
- [ ] **Performance Analytics**
- [ ] **Custom Report Builder**
- [ ] **Data Export/Import**

### 👥 Human Resources
- [ ] **Employee Profiles**
- [ ] **Attendance Management**
- [ ] **Leave Management**
- [ ] **Performance Reviews**

### 📋 Project Management
- [ ] **Project Tracking**
- [ ] **Task Assignment**
- [ ] **Timeline Management**
- [ ] **Resource Allocation**

## 🔧 Development

### Adding New Features

#### Frontend
```bash
cd frontend/src/pages
# Create new page component
# Add route in App.jsx
# Add to navigation menu
```

#### Backend
```bash
cd backend/app/routers
# Create new router file
# Add endpoints
# Update main.py imports
```

#### Database Changes
```bash
cd backend
alembic revision --autogenerate -m "Add new table"
alembic upgrade head
```

### Environment Configuration

#### Development (.env files already created)
- Database: `postgresql://postgres:smepass123@localhost:5434/sme_management_dev`
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:8001`

#### Production
```bash
# Copy and customize
cp .env.development .env.production
# Update with production values
```

## 🚀 Deployment

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Setup backend: `cd backend && pip install -r requirements.txt`
3. Run migrations: `alembic upgrade head`
4. Start services

## 🛡️ Security Features

- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ Password Hashing
- ✅ CORS Protection
- ✅ Input Validation
- ✅ SQL Injection Protection

## 📞 Support & Contributing

### Getting Help
1. Check documentation in `/docs`
2. Review API documentation at `/docs`
3. Check environment configuration

### Development Guidelines
1. Follow existing code structure
2. Add tests for new features
3. Update documentation
4. Follow commit message conventions

## 🎯 Roadmap

### Phase 1: Foundation ✅
- [x] Authentication system
- [x] Basic UI framework
- [x] Database setup
- [x] Docker configuration

### Phase 2: Core SME Features 🚧
- [ ] Company profile management
- [ ] Employee directory
- [ ] Basic financial tracking
- [ ] Dashboard metrics

### Phase 3: Advanced Features 📋
- [ ] Advanced analytics
- [ ] Report generation
- [ ] Third-party integrations
- [ ] Mobile responsiveness

### Phase 4: Enterprise Features 🎯
- [ ] Multi-company support
- [ ] Advanced permissions
- [ ] Audit logging
- [ ] API for integrations

---

**🏢 Built for Small & Medium Enterprises**
**🚀 Ready to scale with your business!**
