require "rails_helper"

RSpec.describe "Api::V1::Auth::Sessions", type: :request do
  describe "POST /api/v1/auth/sign_in" do
    it "signs in HR users and returns a JWT" do
      user = create(:user, :hr, password: "password123")

      post "/api/v1/auth/sign_in", params: {
        email: user.email.upcase,
        password: "password123"
      }

      expect(response).to have_http_status(:ok)
      expect(response.headers["Authorization"]).to start_with("Bearer ")
      expect(response.parsed_body.dig("user", "role")).to eq("hr")
      expect(response.parsed_body["token"]).to be_present
      expect(response.cookies["auth_token"]).to be_present
      expect(user.reload.last_sign_in_at).to be_present
    end

    it "does not sign in employee users" do
      user = create(:user, :employee, password: "password123")

      post "/api/v1/auth/sign_in", params: {
        email: user.email,
        password: "password123"
      }

      expect(response).to have_http_status(:forbidden)
      expect(response.parsed_body["error"]).to eq("Only HR users can sign in")
      expect(response.headers["Authorization"]).to be_blank
    end

    it "rejects invalid credentials" do
      user = create(:user, :hr, password: "password123")

      post "/api/v1/auth/sign_in", params: {
        email: user.email,
        password: "wrong-password"
      }

      expect(response).to have_http_status(:unauthorized)
      expect(response.parsed_body["error"]).to eq("Invalid email or password")
    end
  end

  describe "DELETE /api/v1/auth/sign_out" do
    it "revokes the current token" do
      user = create(:user, :hr)
      token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)

      expect {
        delete "/api/v1/auth/sign_out", headers: { "Authorization" => "Bearer #{token}" }
      }.to change { user.reload.jti }

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body["message"]).to eq("Signed out successfully")
    end

    it "returns JSON for unauthenticated requests" do
      delete "/api/v1/auth/sign_out"

      expect(response).to have_http_status(:unauthorized)
      expect(response.media_type).to eq("application/json")
    end
  end
end
