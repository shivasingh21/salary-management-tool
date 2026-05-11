require "rails_helper"

RSpec.describe "Api::V1::Employees", type: :request do
  let(:hr_user) { create(:user, :hr) }
  let(:employee_user) { create(:user, :employee) }
  let(:department) { create(:department, name: "Engineering") }
  let(:job_title) { create(:job_title, name: "Software Engineer") }
  let(:country) { create(:country, name: "India") }
  let(:headers) { auth_headers(hr_user) }

  def auth_headers(user)
    token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)

    { "Authorization" => "Bearer #{token}" }
  end

  describe "GET /api/v1/employees" do
    it "returns employees for HR users" do
      employee = create(:employee, department: department, job_title: job_title, country: country)
      create(:employee, deleted_at: Time.current)

      get "/api/v1/employees", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].size).to eq(1)
      expect(response.parsed_body["data"].first).to include(
        "id" => employee.id,
        "full_name" => employee.full_name,
        "email" => employee.email,
        "active" => true
      )
      expect(response.parsed_body["data"].first.dig("department", "name")).to eq("Engineering")
      expect(response.parsed_body["meta"]).to include(
        "page" => 1,
        "per_page" => 20,
        "total_count" => 1,
        "total_pages" => 1
      )
      expect(response.media_type).to eq("application/json")
    end

    it "paginates employees" do
      create_list(:employee, 31)

      get "/api/v1/employees", params: { page: 2, per_page: 20 }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].size).to eq(11)
      expect(response.parsed_body["meta"]).to include(
        "page" => 2,
        "per_page" => 20,
        "total_count" => 31,
        "total_pages" => 2
      )
    end

    it "returns the latest created employee first" do
      older_employee = create(:employee, created_at: 2.days.ago)
      latest_employee = create(:employee, created_at: 1.day.ago)

      get "/api/v1/employees", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].first["id"]).to eq(latest_employee.id)
      expect(response.parsed_body["data"].second["id"]).to eq(older_employee.id)
    end

    it "filters employees by fields" do
      engineer = create(:job_title, name: "Engineer")
      designer = create(:job_title, name: "Designer")
      finance = create(:department, name: "Finance")
      canada = create(:country, name: "Canada")
      matching_user = create(:user, :employee, first_name: "Mina", last_name: "Patel")
      matching = create(
        :employee,
        user: matching_user,
        department: finance,
        job_title: engineer,
        country: canada,
        salary: 75_000,
        joining_date: "2026-01-15"
      )
      create(:employee, job_title: designer, salary: 150_000, joining_date: "2026-01-15")

      get "/api/v1/employees", params: {
        name: "mina",
        joining_date: "2026-01-15",
        job_title_id: engineer.id,
        department_id: finance.id,
        country_id: canada.id,
        status: "active",
        salary_range: "50001-100000"
      }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["data"].pluck("id")).to eq([ matching.id ])
      expect(response.parsed_body["meta"]["total_count"]).to eq(1)
    end

    it "rejects unauthenticated requests" do
      get "/api/v1/employees"

      expect(response).to have_http_status(:unauthorized)
      expect(response.media_type).to eq("application/json")
    end

    it "rejects employee users" do
      get "/api/v1/employees", headers: auth_headers(employee_user)

      expect(response).to have_http_status(:forbidden)
      expect(response.parsed_body["error"]).to eq("Only HR users can access this resource")
    end
  end

  describe "GET /api/v1/employees/:id" do
    it "returns an employee" do
      employee = create(:employee, department: department, job_title: job_title, country: country)

      get "/api/v1/employees/#{employee.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include("id" => employee.id, "user_id" => employee.user_id)
    end

    it "returns not found for unknown employees" do
      get "/api/v1/employees/0", headers: headers

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("Employee not found")
    end

    it "returns not found for deleted employees" do
      employee = create(:employee, deleted_at: Time.current)

      get "/api/v1/employees/#{employee.id}", headers: headers

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("Employee not found")
    end
  end

  describe "POST /api/v1/employees" do
    it "creates an employee" do
      expect {
        post "/api/v1/employees", params: {
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
        }, headers: headers
      }.to change(Employee, :count).by(1)
        .and change { User.employee.count }.by(1)

      expect(response).to have_http_status(:created)
      created_user = User.find_by!(email: "priya.rao@example.com")
      expect(response.parsed_body).to include(
        "user_id" => created_user.id,
        "full_name" => "Priya Rao",
        "email" => "priya.rao@example.com",
        "active" => true
      )
      expect(created_user.first_name).to eq("Priya")
      expect(created_user.last_name).to eq("Rao")
      expect(created_user).to be_employee
    end

    it "allows reusing an email from a deleted employee" do
      user = create(:user, :employee)
      create(:employee, user: user, deleted_at: Time.current)
      user.reload

      expect {
        post "/api/v1/employees", params: {
          employee: {
            first_name: "Avery",
            last_name: "Stone",
            email: user.email,
            department_id: department.id,
            job_title_id: job_title.id,
            country_id: country.id,
            salary: "120000.00",
            joining_date: "2026-05-08"
          }
        }, headers: headers
      }.to change(Employee.not_deleted, :count).by(1)
        .and change { User.employee.count }.by(0)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["user_id"]).to eq(user.id)
    end

    it "returns validation errors" do
      post "/api/v1/employees", params: {
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
      }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body.dig("errors", "salary")).to include("must be greater than 0")
    end

    it "returns validation errors for invalid user fields" do
      post "/api/v1/employees", params: {
        employee: {
          first_name: "a" * 51,
          last_name: "b" * 51,
          email: "invalid-email",
          department_id: department.id,
          job_title_id: job_title.id,
          country_id: country.id,
          salary: "120000.00",
          joining_date: "2026-05-08"
        }
      }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body.dig("errors", "first_name")).to include("is too long (maximum is 50 characters)")
      expect(response.parsed_body.dig("errors", "last_name")).to include("is too long (maximum is 50 characters)")
      expect(response.parsed_body.dig("errors", "email")).to include("must be a valid email address")
    end

    it "does not accept user_id" do
      existing_user = create(:user, :employee)

      post "/api/v1/employees", params: {
        employee: {
          user_id: existing_user.id,
          department_id: department.id,
          job_title_id: job_title.id,
          country_id: country.id,
          salary: "120000.00",
          joining_date: "2026-05-08",
          first_name: "Nisha",
          last_name: "Shah",
          email: "nisha.shah@example.com"
        }
      }, headers: headers

      expect(response).to have_http_status(:created)
      expect(response.parsed_body["user_id"]).not_to eq(existing_user.id)
      expect(response.parsed_body["email"]).to eq("nisha.shah@example.com")
    end
  end

  describe "PATCH /api/v1/employees/:id" do
    it "updates an employee" do
      employee = create(:employee)
      new_department = create(:department, name: "Finance")
      new_country = create(:country, name: "Canada")
      other_user = create(:user, :employee)

      patch "/api/v1/employees/#{employee.id}", params: {
        employee: {
          user_id: other_user.id,
          department_id: new_department.id,
          country_id: new_country.id,
          salary: "130000.00",
          first_name: "Jordan",
          last_name: "Miles",
          email: "jordan.miles@example.com",
          active: false
        }
      }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body.dig("department", "name")).to eq("Finance")
      expect(response.parsed_body["salary"]).to eq("130000.0")
      expect(employee.reload.department).to eq(new_department)
      expect(employee.country).not_to eq(new_country)
      expect(employee.user).not_to eq(other_user)
      expect(employee.active).to be(true)
      expect(employee.user.reload.first_name).to eq("Jordan")
      expect(employee.user.last_name).to eq("Miles")
      expect(employee.user.email).to eq("jordan.miles@example.com")
    end

    it "returns validation errors for blank user fields" do
      employee = create(:employee)

      patch "/api/v1/employees/#{employee.id}", params: {
        employee: {
          first_name: "",
          last_name: "",
          email: "",
          salary: "130000.00",
          joining_date: "2026-05-08",
          department_id: employee.department_id,
          job_title_id: employee.job_title_id,
          status: "active"
        }
      }, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body.dig("errors", "first_name")).to include("can't be blank")
      expect(response.parsed_body.dig("errors", "last_name")).to include("can't be blank")
      expect(response.parsed_body.dig("errors", "email")).to include("can't be blank")
    end
  end

  describe "DELETE /api/v1/employees/:id" do
    it "soft deletes an employee" do
      employee = create(:employee, deleted_at: nil)

      expect {
        delete "/api/v1/employees/#{employee.id}", headers: headers
      }.to change { employee.reload.deleted_at }.from(nil)

      expect(response).to have_http_status(:no_content)
    end
  end
end
