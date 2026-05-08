# Salary Management Tool API

Rails 8 API-only application for the salary management tool backend.

## Requirements

- Ruby 3.3.6
- PostgreSQL
- Bundler

## Setup

Install dependencies:

```sh
bundle install
```

Create and migrate the database:

```sh
bin/rails db:create db:migrate
```

Start the API server:

```sh
bin/rails server
```

The API will be available at `http://localhost:3000`.

## Environment Variables

Development and test use sensible local defaults. Configure these variables when needed:

| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_HOST` | PostgreSQL host | local socket |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_USERNAME` | PostgreSQL user | current OS user |
| `DATABASE_PASSWORD` | PostgreSQL password | none |
| `DATABASE_NAME` | Development database name | `salary_management_tool_development` |
| `DATABASE_TEST_NAME` | Test database name | `salary_management_tool_test` |
| `DATABASE_URL` | Production PostgreSQL connection URL | required in production |
| `FRONTEND_ORIGINS` | Comma-separated allowed React origins | `http://localhost:3000,http://localhost:5173` |
| `RAILS_MASTER_KEY` | Rails credentials key | required in production |

Example:

```sh
FRONTEND_ORIGINS=http://localhost:5173 DATABASE_HOST=localhost bin/rails server
```

Use `.env.example` as a reference for local environment configuration. Rails does not load `.env` files by default, so export variables in your shell or provide them through your process manager.

## API

Health check:

```sh
curl http://localhost:3000/api/v1/health
```

Response:

```json
{ "status": "ok" }
```

## Tests

```sh
bin/rails test
```
