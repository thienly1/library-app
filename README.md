# Library App 📚

A full-stack library management application built with **React** (Frontend) and **FastAPI** (Backend). This project demonstrates modern web development practices including testing, CI/CD, and code quality checks.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete books
- **Search**: Filter books by title, author, or genre
- **Responsive Design**: Works on desktop and mobile devices
- **Input Validation**: Both client-side and server-side validation
- **API Documentation**: Auto-generated Swagger/OpenAPI docs

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| Frontend     | React 18, React Router, Vite                  |
| Backend      | Python 3.11, FastAPI, SQLite                  |
| Testing      | Vitest (Unit), Playwright (E2E), Newman (API) |
| CI/CD        | GitHub Actions                                |
| Code Quality | ESLint, Pylint                                |
| Security     | npm audit, pip-audit                          |

## Project Structure

```
├── src/                  # Frontend (React)
│   ├── pages/            # Page components
│   ├── parts/            # Reusable components
│   └── utils/            # Helper functions
├── backend/              # Backend (FastAPI)
│   ├── main.py           # API endpoints
│   ├── databases/        # SQLite database
│   └── settings.json     # Configuration
├── tests-unit/           # Unit tests (Vitest)
├── tests-e2e/            # E2E tests (Playwright)
├── tests-api/            # API tests (Newman/Postman)
├── tests-backend/        # Python backend tests
└── .github/workflows/    # CI/CD pipeline
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd library-app
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd backend
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend development server**

   ```bash
   npm run dev
   ```

3. **Open in browser**
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:8000/docs

## Running Tests

### Unit Tests (Frontend)

```bash
npm run test          # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Backend Tests

```bash
pytest tests-backend/ -v
```

### API Tests

```bash
# Start backend first, then:
npm install -g newman
newman run tests-api/library-api.postman_collection.json
```

### E2E Tests

```bash
# Build and run against production build
npm run build
npx playwright install chromium
npm run test:e2e
```

## API Endpoints

| Method | Endpoint          | Description                           |
| ------ | ----------------- | ------------------------------------- |
| GET    | `/api/health`     | Health check                          |
| GET    | `/api/books`      | Get all books (with optional filters) |
| GET    | `/api/books/{id}` | Get single book                       |
| POST   | `/api/books`      | Create new book                       |
| PUT    | `/api/books/{id}` | Update book                           |
| DELETE | `/api/books/{id}` | Delete book                           |

### Query Parameters (GET /api/books)

- `search`: Search in title and author
- `genre`: Filter by genre
- `author`: Filter by author

### Request Body (POST/PUT)

```json
{
  "title": "string (required)",
  "author": "string (required)",
  "isbn": "string (optional)",
  "year": "integer 1000-2100 (optional)",
  "genre": "string (optional)"
}
```

## Code Quality

### Linting

```bash
# Frontend
npm run lint
npm run lint:fix

# Backend
pylint backend/
```

### Security Audit

```bash
# Frontend
npm audit

# Backend
pip-audit
```

## Production Build

```bash
# Build frontend for production
npm run build

# Preview production build
npm run preview
```

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:

1. **Code Quality**: ESLint and Pylint checks
2. **Security**: npm audit and pip-audit
3. **Unit Tests**: Vitest frontend tests
4. **API Tests**: Newman/Postman collection
5. **E2E Tests**: Playwright browser tests
6. **Build Check**: Production build verification

### Branch Protection

Configure branch protection rules in GitHub repository settings:

- Require status checks to pass before merging
- Require the CI, CD workflow to pass

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass: `npm test && pytest tests-backend/`
4. Ensure linting passes: `npm run lint && pylint backend/`
5. Create a Pull Request
