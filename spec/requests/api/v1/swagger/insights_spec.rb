require "swagger_helper"

RSpec.describe "Insights API", type: :request, swagger_doc: "v1/openapi.yaml" do
  let(:hr_user) { create(:user, :hr) }
  let(:Authorization) { bearer_token_for(hr_user) }
  let(:engineering) { create(:department, name: "Engineering") }
  let(:india) { create(:country, name: "India") }
  let(:software_engineer) { create(:job_title, name: "Software Engineer") }

  before do
    create(:employee, department: engineering, country: india, job_title: software_engineer, salary: 40_000)
    create(:employee, department: engineering, country: india, job_title: software_engineer, salary: 80_000)
  end

  def self.protected_insight(path, summary, schema_ref = "#/components/schemas/InsightCollection")
    path path do
      get summary do
        tags "Insights"
        security [ bearerAuth: [] ]
        produces "application/json"

        response "200", "insight returned" do
          schema "$ref" => schema_ref

          run_test!
        end

        response "401", "not authenticated" do
          schema "$ref" => "#/components/schemas/Error"

          let(:Authorization) { nil }

          run_test!
        end
      end
    end
  end

  protected_insight "/api/v1/insights/country_salaries", "Salary aggregates by country"
  protected_insight "/api/v1/insights/country_salary_stats", "Salary stats by country"
  protected_insight "/api/v1/insights/department_average", "Average salary by department"
  protected_insight "/api/v1/insights/job_title_average", "Average salary by country and job title"
  protected_insight "/api/v1/insights/payroll_summary", "Overall payroll KPIs", "#/components/schemas/PayrollSummary"
  protected_insight "/api/v1/insights/salary_distribution", "Salary distribution buckets"

  path "/api/v1/insights/job_title_salary_stats" do
    get "Salary stats by job title for a country" do
      tags "Insights"
      security [ bearerAuth: [] ]
      produces "application/json"
      parameter name: :country_id, in: :query, type: :integer, required: true

      response "200", "insight returned" do
        schema "$ref" => "#/components/schemas/InsightCollection"

        let(:country_id) { india.id }

        run_test!
      end

      response "400", "country_id is required" do
        schema "$ref" => "#/components/schemas/Error"

        let(:country_id) { nil }

        run_test!
      end
    end
  end
end
