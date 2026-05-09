require "rails_helper"

RSpec.describe Api::V1::JobTitlesController, type: :controller do
  before do
    allow(controller).to receive(:authenticate_hr_user!)
  end

  describe "GET #index" do
    it "returns job titles ordered by name" do
      create(:job_title, name: "Manager")
      engineer = create(:job_title, name: "Engineer")

      get :index

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq([
        { "id" => engineer.id, "name" => "Engineer" },
        { "id" => JobTitle.find_by!(name: "Manager").id, "name" => "Manager" }
      ])
    end
  end

  describe "POST #create" do
    it "creates a job title" do
      expect {
        post :create, params: { job_title: { name: "Designer" } }
      }.to change(JobTitle, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to include("name" => "Designer")
    end

    it "returns validation errors" do
      post :create, params: { job_title: { name: "" } }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body.dig("errors", "name")).to include("can't be blank")
    end
  end

  describe "DELETE #destroy" do
    it "deletes a job title" do
      job_title = create(:job_title)

      expect {
        delete :destroy, params: { id: job_title.id }
      }.to change(JobTitle, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns not found for unknown job titles" do
      delete :destroy, params: { id: 0 }

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("Job title not found")
    end

    it "returns conflict when employees use the job title" do
      job_title = create(:job_title)
      create(:employee, job_title: job_title)

      expect {
        delete :destroy, params: { id: job_title.id }
      }.not_to change(JobTitle, :count)

      expect(response).to have_http_status(:conflict)
      expect(response.parsed_body["error"]).to eq("Job title has employees")
    end
  end
end
