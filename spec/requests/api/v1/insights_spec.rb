require "rails_helper"

RSpec.describe "Api::V1::Insights", type: :request do
  let(:hr_user) { create(:user, :hr) }
  let(:employee_user) { create(:user, :employee) }
  let(:engineering) { create(:department, name: "Engineering") }
  let(:design_department) { create(:department, name: "Design") }
  let(:india) { create(:country, name: "India") }
  let(:usa) { create(:country, name: "United States") }
  let(:software_engineer) { create(:job_title, name: "Software Engineer") }
  let(:designer) { create(:job_title, name: "Designer") }
  let(:headers) { auth_headers(hr_user) }

  def auth_headers(user)
    token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)

    { "Authorization" => "Bearer #{token}" }
  end

  before do
    create(:employee, department: engineering, country: india, job_title: software_engineer, salary: 40_000)
    create(:employee, department: engineering, country: india, job_title: software_engineer, salary: 80_000)
    create(:employee, department: design_department, country: india, job_title: designer, salary: 150_000)
    create(:employee, department: engineering, country: usa, job_title: software_engineer, salary: 250_000)
    create(:employee, department: design_department, country: usa, job_title: designer, salary: 120_000, active: false)
  end

  describe "GET /api/v1/insights/country_salaries" do
    it "returns salary aggregates grouped by country" do
      get "/api/v1/insights/country_salaries", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      expect(response.parsed_body["data"]).to contain_exactly(
        {
          "country" => "India",
          "min_salary" => "40000.0",
          "max_salary" => "150000.0",
          "avg_salary" => "90000.0",
          "employee_count" => 3
        },
        {
          "country" => "United States",
          "min_salary" => "250000.0",
          "max_salary" => "250000.0",
          "avg_salary" => "250000.0",
          "employee_count" => 1
        }
      )
    end
  end

  describe "GET /api/v1/insights/department_average" do
    it "returns average salary grouped by department" do
      get "/api/v1/insights/department_average", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]).to contain_exactly(
        {
          "department" => "Design",
          "avg_salary" => "150000.0",
          "employee_count" => 1
        },
        {
          "department" => "Engineering",
          "avg_salary" => "123333.33",
          "employee_count" => 3
        }
      )
    end
  end

  describe "GET /api/v1/insights/job_title_average" do
    it "returns average salary grouped by country and job title" do
      get "/api/v1/insights/job_title_average", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]).to contain_exactly(
        {
          "country" => "India",
          "job_title" => "Designer",
          "avg_salary" => "150000.0",
          "employee_count" => 1
        },
        {
          "country" => "India",
          "job_title" => "Software Engineer",
          "avg_salary" => "60000.0",
          "employee_count" => 2
        },
        {
          "country" => "United States",
          "job_title" => "Software Engineer",
          "avg_salary" => "250000.0",
          "employee_count" => 1
        }
      )
    end
  end

  describe "GET /api/v1/insights/payroll_summary" do
    it "returns overall payroll KPIs" do
      get "/api/v1/insights/payroll_summary", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]).to eq(
        "total_payroll" => "520000.0",
        "total_employees" => 4,
        "average_salary" => "130000.0",
        "highest_salary" => "250000.0",
        "lowest_salary" => "40000.0"
      )
    end
  end

  describe "GET /api/v1/insights/salary_distribution" do
    it "returns all salary buckets in chart order" do
      get "/api/v1/insights/salary_distribution", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"]).to eq(
        [
          { "range" => "0-50000", "employee_count" => 1 },
          { "range" => "50001-100000", "employee_count" => 1 },
          { "range" => "100001-200000", "employee_count" => 1 },
          { "range" => "200000+", "employee_count" => 1 }
        ]
      )
    end
  end

  it "rejects unauthenticated requests" do
    get "/api/v1/insights/payroll_summary"

    expect(response).to have_http_status(:unauthorized)
    expect(response.media_type).to eq("application/json")
  end

  it "rejects employee users" do
    get "/api/v1/insights/payroll_summary", headers: auth_headers(employee_user)

    expect(response).to have_http_status(:forbidden)
    expect(response.parsed_body["error"]).to eq("Only HR users can access this resource")
  end
end
