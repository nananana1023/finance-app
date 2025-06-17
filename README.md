# MoneySavvy 💸

**MoneySavvy** is a Finance Manager Web Application designed to help users manage their income, expenses, and savings. It promotes better financial habits by offering visual insights and easy transaction tracking to support users in reaching their financial goals.

## Key Features

- **Transactions Overview**: Add/edit/delete transactions, upload bank files, set recurring entries, convert currencies, use calculator, filter, and export data.
- **Charts**: Visualize cash flow, total expenses over months, and category-based spending.
- **Insights**: Show warnings when spending exceeds goals or habits change.
- **User Authentication**: Email verification, financial profile setup, and secure login.

## Installation Guide

### Prerequisites
- Python 3.10  
- Node.js 18.x and npm 9.x  
- PostgreSQL 14  
- Git  

### Backend (Django)
```bash
git clone https://github.com/nananana1023/finance-app.git
cd finance-app/backend
python -m venv venv
venv\Scripts\activate  # or 'source venv/bin/activate' on macOS/Linux
pip install -r requirements.txt
```

Set up PostgreSQL and update backend_settings.py:
```bash
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': '<your_database_name>',
        'USER': 'postgres',
        'PASSWORD': '<your_password>',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
Run backend:
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver  # at http://127.0.0.1:8000
```

### Frontend (React)
```bash
cd ../frontend
npm install
npm start  # at http://localhost:3000
```

## Technologies Used
- Backend: Django, Python, PostgreSQL, Celery, Redis
- Frontend: React, Recharts, Bootstrap, Axios
- External API: OpenExchangeRates API
