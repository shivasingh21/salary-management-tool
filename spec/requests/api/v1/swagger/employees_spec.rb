require "swagger_helper"

RSpec.describe "Employees API", type: :request, swagger_doc: "v1/openapi.yaml" do
  let(:hr_user) { create(:user, :hr) }
  let(:Authorization) { bearer_token_for(hr_user) }
  let(:department) { create(:department, name: "Engineering") }
  let(:job_title) { create(:job_title, name: "Software Engineer") }
  let(:country) { create(:country, name: "India") }

  path "/api/v1/employees" do
    get "List employees" do
      tags "Employees"
      security [ bearerAuth: [] ]
      produces "application/json"
      parameter name: :page, in: :query, type: :integer, required: false, example: 1
      parameter name: :per_page, in: :query, type: :integer, required: false, example: 20, description: "Clamped from 1 to 100"
      parameter name: :id, in: :query, type: :integer, required: false
      parameter name: :name, in: :query, type: :string, required: false
      parameter name: :joining_date, in: :query, type: :string, format: :date, required: false
      parameter name: :job_title_id, in: :query, type: :integer, required: false
      parameter name: :department_id, in: :query, type: :integer, required: false
      parameter name: :country_id, in: :query, type: :integer, required: false
      parameter name: :status, in: :query, schema: { type: :string, enum: %w[onboarding active inactive] }, required: false
      parameter name: :salary_range, in: :query, schema: { type: :string, enum: [ "0-50000", "50001-100000", "100001-200000", "200000+" ] }, required: false

      response "200", "employees returned" do
        schema "$ref" => "#/components/schemas/EmployeesIndex"

        before do
          create(:employee, department: department, job_title: job_title, country: country)
        end

        run_test!
      end

      response "401", "not authenticated" do
        schema "$ref" => "#/components/schemas/Error"

        let(:Authorization) { nil }

        run_test!
      end
    end

    post "Create an employee" do
      tags "Employees"
      security [ bearerAuth: [] ]
      consumes "application/json"
      produces "application/json"
      parameter name: :employee, in: :body, schema: {
        type: :object,
        required: [ "employee" ],
        properties: {
          employee: { "$ref" => "#/components/schemas/EmployeeRequest" }
        }
      }

      response "201", "employee created" do
        schema "$ref" => "#/components/schemas/Employee"

        let(:employee) do
          {
            employee: {
              department_id: department.id,
              job_title_id: job_title.id,
              country_id: country.id,
              salary: "120000.00",
              joining_date: "2026-05-08",
              first_name: "Priya",
              last_name: "Rao",
              email: "priya.rao@example.com"
            }
          }
        end

        run_test!
      end

      response "422", "validation failed" do
        schema "$ref" => "#/components/schemas/ValidationErrors"

        let(:employee) do
          {
            employee: {
              department_id: department.id,
              job_title_id: job_title.id,
              country_id: country.id,
              salary: "0",
              joining_date: "2026-05-08",
              first_name: "Priya",
              last_name: "Rao",
              email: "priya.rao@example.com"
            }
          }
        end

        run_test!
      end
    end
  end

  path "/api/v1/employees/{id}" do
    parameter name: :id, in: :path, type: :integer, required: true

    get "Show an employee" do
      tags "Employees"
      security [ bearerAuth: [] ]
      produces "application/json"

      response "200", "employee returned" do
        schema "$ref" => "#/components/schemas/Employee"

        let(:record) { create(:employee, department: department, job_title: job_title, country: country) }
        let(:id) { record.id }

        run_test!
      end

      response "404", "employee not found" do
        schema "$ref" => "#/components/schemas/Error"

        let(:id) { 0 }

        run_test!
      end
    end

    patch "Update an employee" do
      tags "Employees"
      security [ bearerAuth: [] ]
      consumes "application/json"
      produces "application/json"
      parameter name: :employee, in: :body, schema: {
        type: :object,
        required: [ "employee" ],
        properties: {
          employee: { "$ref" => "#/components/schemas/EmployeeUpdateRequest" }
        }
      }

      response "200", "employee updated" do
        schema "$ref" => "#/components/schemas/Employee"

        let(:record) { create(:employee, department: department, job_title: job_title, country: country) }
        let(:id) { record.id }
        let(:employee) do
          {
            employee: {
              salary: "130000.00",
              joining_date: "2026-05-08",
              department_id: department.id,
              job_title_id: job_title.id,
              status: "active",
              first_name: "Jordan",
              last_name: "Miles",
              email: "jordan.miles@example.com"
            }
          }
        end

        run_test!
      end
    end

    delete "Soft delete an employee" do
      tags "Employees"
      security [ bearerAuth: [] ]

      response "204", "employee deleted" do
        let(:record) { create(:employee, department: department, job_title: job_title, country: country) }
        let(:id) { record.id }

        run_test!
      end
    end
  end
end
