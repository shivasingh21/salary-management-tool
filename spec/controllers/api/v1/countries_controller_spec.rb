require "rails_helper"

RSpec.describe Api::V1::CountriesController, type: :controller do
  before do
    allow(controller).to receive(:authenticate_hr_user!)
  end

  describe "GET #index" do
    it "returns countries ordered by name" do
      create(:country, name: "Zimbabwe")
      india = create(:country, name: "India")

      get :index

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq([
        { "id" => india.id, "name" => "India", "employee_count" => 0 },
        { "id" => Country.find_by!(name: "Zimbabwe").id, "name" => "Zimbabwe", "employee_count" => 0 }
      ])
    end
  end

  describe "POST #create" do
    it "creates a country" do
      expect {
        post :create, params: { country: { name: "Canada" } }
      }.to change(Country, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to include("name" => "Canada")
    end

    it "returns validation errors" do
      post :create, params: { country: { name: "" } }

      expect(response).to have_http_status(:unprocessable_content)
      expect(response.parsed_body.dig("errors", "name")).to include("can't be blank")
    end
  end

  describe "DELETE #destroy" do
    it "deletes a country" do
      country = create(:country)

      expect {
        delete :destroy, params: { id: country.id }
      }.to change(Country, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it "returns not found for unknown countries" do
      delete :destroy, params: { id: 0 }

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body["error"]).to eq("Country not found")
    end

    it "returns conflict when employees use the country" do
      country = create(:country)
      create(:employee, country: country)

      expect {
        delete :destroy, params: { id: country.id }
      }.not_to change(Country, :count)

      expect(response).to have_http_status(:conflict)
      expect(response.parsed_body["error"]).to eq("Country has employees")
    end
  end
end
