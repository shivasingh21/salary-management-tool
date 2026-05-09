require "rails_helper"

RSpec.describe Api::V1::DepartmentsController, type: :controller do
  before do
    allow(controller).to receive(:authenticate_hr_user!)
  end

  describe "GET #index" do
    it "returns departments ordered by name" do
      create(:department, name: "Sales")
      engineering = create(:department, name: "Engineering")

      get :index

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq([
        { "id" => engineering.id, "name" => "Engineering" },
        { "id" => Department.find_by!(name: "Sales").id, "name" => "Sales" }
      ])
    end
  end

  describe "POST #create" do
    it "creates a department" do
      expect {
        post :create, params: { department: { name: "Finance" } }
      }.to change(Department, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to include("name" => "Finance")
    end

    it "returns validation errors" do
      post :create, params: { department: { name: "" } }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body.dig("errors", "name")).to include("can't be blank")
    end
  end

  describe "DELETE #destroy" do
    it "deletes a department" do
      department = create(:department)

      expect {
        delete :destroy, params: { id: department.id }
      }.to change(Department, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns not found for unknown departments" do
      delete :destroy, params: { id: 0 }

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("Department not found")
    end

    it "returns conflict when employees use the department" do
      department = create(:department)
      create(:employee, department: department)

      expect {
        delete :destroy, params: { id: department.id }
      }.not_to change(Department, :count)

      expect(response).to have_http_status(:conflict)
      expect(response.parsed_body["error"]).to eq("Department has employees")
    end
  end
end
