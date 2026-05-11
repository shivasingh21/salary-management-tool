require "rails_helper"

module SwaggerAuthHelpers
  def bearer_token_for(user)
    token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
    "Bearer #{token}"
  end
end

RSpec.configure do |config|
  config.include SwaggerAuthHelpers

  config.openapi_root = Rails.root.join("swagger").to_s

  config.openapi_specs = {
    "v1/openapi.yaml" => {
      openapi: "3.0.3",
      info: {
        title: "Salary Management API",
        version: "v1",
        description: "OpenAPI documentation for HR salary management workflows."
      },
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local development"
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: :http,
            scheme: :bearer,
            bearerFormat: :JWT,
            description: "Paste the JWT returned by POST /api/v1/auth/sign_in. Swagger UI persists it and sends it on protected requests."
          }
        },
        schemas: {
          Error: {
            type: :object,
            properties: {
              error: { type: :string, example: "Only HR users can access this resource" }
            }
          },
          ValidationErrors: {
            type: :object,
            properties: {
              errors: {
                type: :object,
                additionalProperties: {
                  type: :array,
                  items: { type: :string }
                },
                example: { salary: [ "must be greater than 0" ] }
              }
            }
          },
          User: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              first_name: { type: :string, nullable: true, maxLength: 50, example: "Priya" },
              last_name: { type: :string, nullable: true, maxLength: 50, example: "Rao" },
              email: { type: :string, format: :email, maxLength: 50, example: "hr@example.com" },
              role: { type: :string, enum: %w[hr employee], example: "hr" },
              last_sign_in_at: { type: :string, format: "date-time", nullable: true }
            }
          },
          SignInRequest: {
            type: :object,
            required: %w[email password],
            properties: {
              email: { type: :string, format: :email, maxLength: 50, example: "hr@example.com" },
              password: { type: :string, format: :password, example: "password123" }
            }
          },
          SignInResponse: {
            type: :object,
            properties: {
              user: { "$ref" => "#/components/schemas/User" },
              token: { type: :string, example: "eyJhbGciOiJIUzI1NiJ9..." }
            }
          },
          Lookup: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              name: { type: :string, example: "Engineering" }
            }
          },
          Employee: {
            type: :object,
            properties: {
              id: { type: :integer, example: 1 },
              user_id: { type: :integer, example: 12 },
              first_name: { type: :string, nullable: true, maxLength: 50, example: "Priya" },
              last_name: { type: :string, nullable: true, maxLength: 50, example: "Rao" },
              full_name: { type: :string, example: "Priya Rao" },
              email: { type: :string, format: :email, nullable: true, maxLength: 50, example: "priya.rao@example.com" },
              department: { "$ref" => "#/components/schemas/Lookup" },
              job_title: { "$ref" => "#/components/schemas/Lookup" },
              country: { "$ref" => "#/components/schemas/Lookup" },
              salary: { type: :string, example: "120000.0" },
              joining_date: { type: :string, format: :date, example: "2026-05-08" },
              status: { type: :string, enum: %w[onboarding active inactive], example: "active" },
              active: { type: :boolean, example: true },
              deleted_at: { type: :string, format: "date-time", nullable: true },
              created_at: { type: :string, format: "date-time" },
              updated_at: { type: :string, format: "date-time" }
            }
          },
          EmployeeRequest: {
            type: :object,
            required: %w[first_name last_name email department_id job_title_id country_id salary joining_date],
            properties: {
              first_name: { type: :string, maxLength: 50, example: "Priya" },
              last_name: { type: :string, maxLength: 50, example: "Rao" },
              email: { type: :string, format: :email, maxLength: 50, example: "priya.rao@example.com" },
              department_id: { type: :integer, example: 1 },
              job_title_id: { type: :integer, example: 1 },
              country_id: { type: :integer, example: 1 },
              salary: { type: :string, example: "120000.00" },
              joining_date: { type: :string, format: :date, example: "2026-05-08" },
              status: { type: :string, enum: %w[onboarding active inactive], example: "active" },
              active: { type: :boolean, example: true }
            }
          },
          EmployeeUpdateRequest: {
            type: :object,
            required: %w[first_name last_name email department_id job_title_id salary joining_date status],
            properties: {
              first_name: { type: :string, maxLength: 50, example: "Priya" },
              last_name: { type: :string, maxLength: 50, example: "Rao" },
              email: { type: :string, format: :email, maxLength: 50, example: "priya.rao@example.com" },
              department_id: { type: :integer, example: 1 },
              job_title_id: { type: :integer, example: 1 },
              salary: { type: :string, example: "120000.00" },
              joining_date: { type: :string, format: :date, example: "2026-05-08" },
              status: { type: :string, enum: %w[onboarding active inactive], example: "active" }
            }
          },
          EmployeesIndex: {
            type: :object,
            properties: {
              data: {
                type: :array,
                items: { "$ref" => "#/components/schemas/Employee" }
              },
              meta: {
                type: :object,
                properties: {
                  page: { type: :integer, example: 1 },
                  per_page: { type: :integer, example: 20 },
                  total_count: { type: :integer, example: 1 },
                  total_pages: { type: :integer, example: 1 }
                }
              }
            }
          },
          InsightCollection: {
            type: :object,
            properties: {
              data: {
                type: :array,
                items: {
                  type: :object,
                  additionalProperties: true
                },
                example: [
                  {
                    country: "India",
                    min_salary: "40000.0",
                    max_salary: "150000.0",
                    avg_salary: "90000.0",
                    employee_count: 3
                  }
                ]
              }
            }
          },
          PayrollSummary: {
            type: :object,
            properties: {
              data: {
                type: :object,
                properties: {
                  total_payroll: { type: :string, example: "520000.0" },
                  total_employees: { type: :integer, example: 4 },
                  average_salary: { type: :string, example: "130000.0" },
                  highest_salary: { type: :string, example: "250000.0" },
                  lowest_salary: { type: :string, example: "40000.0" }
                }
              }
            }
          }
        }
      },
      paths: {}
    }
  }

  config.openapi_format = :yaml
end
