# Salary Management System

A full-stack salary management and HR analytics application. The backend is a Rails API that manages employees, lookup data, authentication, soft deletes, and aggregate salary insights. The frontend is a React dashboard built with Material UI and Recharts for employee operations and salary analytics.

## Features

- HR-only JWT authentication with login and logout.
- Employee CRUD with first name, last name, email, department, job title, country, salary, date of joining, and status.
- Soft delete support using `employees.deleted_at`; deleted employees are hidden from normal listings and cannot be viewed or edited.
- Paginated employee index with filters for ID, date of joining, name, job title, department, country, status, and salary range.
- Lookup management for departments, job titles, and countries, including employee counts.
- Dashboard KPIs for total employees, total payroll, average salary, highest salary, and lowest salary.
- Salary analytics by country, department, job title, and salary distribution.
- Responsive React UI using Material UI cards, tables, dialogs, filters, and Recharts visualizations.
- Request specs and model specs for API behavior, authorization, filtering, pagination, and soft delete flows.

## Architecture Decisions

- **Rails API + React SPA:** The backend exposes versioned JSON APIs under `/api/v1`; the frontend consumes those APIs through Axios.
- **JWT-based HR access:** Devise and Devise JWT protect API endpoints. Business endpoints require an HR user through `authenticate_hr_user!`.
- **Thin controllers, service-backed analytics:** Salary insights are delegated to service objects under `app/services/insights`, keeping controllers focused on authorization and response rendering.
- **Database-first aggregation:** Analytics endpoints use SQL aggregations for counts, averages, minimums, maximums, and payroll totals instead of calculating in React.
- **Soft deletes for employees:** Employee deletion updates `deleted_at` rather than removing records, preserving historical data while keeping default listings clean.
- **Frontend-local state:** React hooks manage page-level loading, error, filter, pagination, and dialog state without introducing global state management.
- **Frontend-friendly JSON:** Collection endpoints return structured JSON with clear data objects and pagination metadata where needed.

## Tech Stack

**Backend**

- Ruby 3.3.6
- Rails 8.1
- PostgreSQL
- Devise
- Devise JWT
- RSpec, FactoryBot, Shoulda Matchers, SimpleCov
- Faker for seed data

**Frontend**

- React 18
- Vite
- Material UI
- Recharts
- Axios
- React Router

## Project Structure

```text
.
├── app/                    # Rails controllers, models, services, serializers
├── config/                 # Rails routes, database, credentials, environment config
├── db/                     # Migrations, schema, seed data
├── spec/                   # RSpec request/model/controller specs
└── frontend/               # React + Vite frontend application
```

## Setup Instructions

### Prerequisites

- Ruby 3.3.6
- Bundler
- PostgreSQL
- Node.js and npm

### Backend Setup

Install Ruby dependencies from the project root:

```sh
bundle install
```

Create and migrate the database:

```sh
bin/rails db:create db:migrate
```

Seed local data:

```sh
bin/rails db:seed
```

Start the Rails API on port `3001`:

```sh
bin/rails server -p 3001
```

### Frontend Setup

Install frontend dependencies:

```sh
cd frontend
npm install
```

Start the Vite dev server:

```sh
npm run dev
```

The frontend runs at `http://localhost:3000`. Vite proxies `/api` requests to the Rails API at `http://localhost:3001`.

# OpenAPI Documentation

Swagger UI is mounted at `/api-docs`.

Generate the OpenAPI document with:

```sh
bundle exec rails rswag:specs:swaggerize
```

Authentication flow:

1. Run `POST /api/v1/auth/sign_in` with HR credentials.
2. The API stores an HttpOnly JWT cookie for the browser.
3. Swagger UI also stores the returned JWT in local browser storage when it can.
4. If you are already signed in through the frontend app, Swagger UI can reuse
   the API cookie and call protected endpoints without manually authorizing.
5. Protected requests automatically authenticate with the cookie or
   `Authorization: Bearer <token>`.

## Environment Configuration

Development and test environments use local defaults where possible.

| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_HOST` | PostgreSQL host | local socket |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USERNAME` | PostgreSQL user | current OS user |
| `DATABASE_PASSWORD` | PostgreSQL password | none |
| `DATABASE_NAME` | Development database name | `salary_management_tool_development` |
| `DATABASE_TEST_NAME` | Test database name | `salary_management_tool_test` |
| `DATABASE_URL` | Production PostgreSQL URL | required in production |
| `FRONTEND_ORIGINS` | Allowed frontend origins for CORS | app defaults |
| `RAILS_MASTER_KEY` | Rails credentials key | required where encrypted credentials are used |
| `VITE_API_BASE_URL` | Frontend API base URL | `/api/v1` |

Frontend development currently uses `frontend/.env.development`:

```sh
VITE_API_BASE_URL=/api/v1
```

## Database Setup

Run the full local database setup:

```sh
bin/rails db:create db:migrate db:seed
```

Reset local data when needed:

```sh
bin/rails db:drop db:create db:migrate db:seed
```

Key data model concepts:

- `users` store authentication, names, email, role, and JWT revocation ID.
- `employees` store salary, joining date, status, lookup references, and `deleted_at`.
- `departments`, `job_titles`, and `countries` are lookup tables with restricted deletion when employees exist.

## Seed Instructions

The seed file creates:

- 2 HR users
- 10,000 employee users
- 10,000 employee records
- 30 departments
- 30 job titles
- 30 countries
- Mixed employee statuses: Onboarding, Active, and Inactive

Default HR credentials:

```text
Email: hr1@example.com
Password: Password@123
```

```text
Email: hr2@example.com
Password: Password@123
```

Seed data uses deterministic Faker configuration so development data is consistent across runs.

## Running Tests

Run the Rails test suite:

```sh
bundle exec rspec
```

Run a focused spec file:

```sh
bundle exec rspec spec/requests/api/v1/employees_spec.rb
```

Run frontend production build verification:

```sh
cd frontend
npm run build
```

## API Authentication

Login returns a JWT token in both the JSON response and the `Authorization` response header. Send the token on protected requests:

```http
Authorization: Bearer <token>
```

Only users with the `hr` role can access protected HR resources.

## API Endpoints

Base URL:

```text
/api/v1
```

### Health

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | API health check |

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/sign_in` | Log in HR user |
| `DELETE` | `/auth/sign_out` | Revoke current JWT session |

Login payload:

```json
{
  "email": "hr1@example.com",
  "password": "Password@123"
}
```

### Profile

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/profile` | Get current HR profile |
| `PATCH` | `/profile` | Update current HR profile name fields |

### Employees

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/employees` | List non-deleted employees with pagination and filters |
| `POST` | `/employees` | Create employee |
| `GET` | `/employees/:id` | Show employee |
| `PATCH` | `/employees/:id` | Update employee |
| `PUT` | `/employees/:id` | Update employee |
| `DELETE` | `/employees/:id` | Soft delete employee |

Employee list query parameters:

| Parameter | Description |
| --- | --- |
| `page` | Page number, default `1` |
| `per_page` | Records per page, default `20`, maximum `100` |
| `id` | Exact employee ID |
| `joining_date` | Exact date of joining |
| `name` | Partial first or last name match |
| `job_title_id` | Job title filter |
| `department_id` | Department filter |
| `country_id` | Country filter |
| `status` | `onboarding`, `active`, or `inactive` |
| `salary_range` | `0-50000`, `50001-100000`, `100001-200000`, or `200000+` |

Employee list response:

```json
{
  "data": [
    {
      "id": 1,
      "full_name": "Example Employee",
      "email": "employee@example.com",
      "department": { "id": 1, "name": "Engineering" },
      "job_title": { "id": 1, "name": "Software Engineer" },
      "country": { "id": 1, "name": "India" },
      "salary": "120000.0",
      "joining_date": "2024-01-01",
      "status": "active"
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total_count": 10000,
    "total_pages": 500
  }
}
```

### Departments, Job Titles, and Countries

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/departments` | List departments with employee counts |
| `POST` | `/departments` | Create department |
| `PATCH` | `/departments/:id` | Update department |
| `DELETE` | `/departments/:id` | Delete department if unused |
| `GET` | `/job_titles` | List job titles with employee counts |
| `POST` | `/job_titles` | Create job title |
| `PATCH` | `/job_titles/:id` | Update job title |
| `DELETE` | `/job_titles/:id` | Delete job title if unused |
| `GET` | `/countries` | List countries with employee counts |
| `POST` | `/countries` | Create country |
| `PATCH` | `/countries/:id` | Update country |
| `DELETE` | `/countries/:id` | Delete country if unused |

Lookup response shape:

```json
[
  {
    "id": 1,
    "name": "Engineering",
    "employee_count": 350
  }
]
```

### Insights

All insight endpoints are HR-only and return `{ "data": ... }`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/insights/payroll_summary` | Total payroll, total employees, average, highest, and lowest salary |
| `GET` | `/insights/salary_distribution` | Employee counts by salary bucket |
| `GET` | `/insights/country_salaries` | Min, max, average salary, and employee count by country |
| `GET` | `/insights/country_salary_stats` | Country salary statistics for analytics tables/charts |
| `GET` | `/insights/department_average` | Average salary by department |
| `GET` | `/insights/job_title_average` | Average salary by country and job title |
| `GET` | `/insights/job_title_salary_stats?country_id=:id` | Min, max, average salary by job title within a country |

Payroll summary response:

```json
{
  "data": {
    "total_payroll": "1200000000.00",
    "total_employees": 10000,
    "average_salary": "120000.00",
    "highest_salary": "200000.00",
    "lowest_salary": "45000.00"
  }
}
```

Salary distribution response:

```json
{
  "data": [
    { "range": "0-50000", "employee_count": 300 },
    { "range": "50001-100000", "employee_count": 3500 },
    { "range": "100001-200000", "employee_count": 6200 },
    { "range": "200000+", "employee_count": 0 }
  ]
}
```

Country salary stats response:

```json
{
  "data": [
    {
      "country": "India",
      "min_salary": "45000.00",
      "max_salary": "200000.00",
      "avg_salary": "121500.25",
      "employee_count": 340
    }
  ]
}
```

Job title salary stats response:

```json
{
  "data": [
    {
      "country": "India",
      "job_title": "Software Engineer",
      "min_salary": "60000.00",
      "max_salary": "180000.00",
      "avg_salary": "115000.00",
      "employee_count": 42
    }
  ]
}
```
