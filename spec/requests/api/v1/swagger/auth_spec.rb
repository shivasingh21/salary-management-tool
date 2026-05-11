require "swagger_helper"

RSpec.describe "Authentication API", type: :request, swagger_doc: "v1/openapi.yaml" do
  path "/api/v1/auth/sign_in" do
    post "Sign in as an HR user" do
      tags "Authentication"
      consumes "application/json"
      produces "application/json"
      parameter name: :credentials, in: :body, schema: { "$ref" => "#/components/schemas/SignInRequest" }

      response "200", "signed in" do
        schema "$ref" => "#/components/schemas/SignInResponse"
        header "Authorization", schema: { type: :string }, description: "Bearer JWT for protected requests"

        let(:user) { create(:user, :hr, email: "hr@example.com", password: "password123") }
        let(:credentials) { { email: user.email, password: "password123" } }

        run_test!
      end

      response "401", "invalid credentials" do
        schema "$ref" => "#/components/schemas/Error"

        let(:credentials) { { email: "missing@example.com", password: "wrong-password" } }

        run_test!
      end

      response "403", "employee users cannot sign in" do
        schema "$ref" => "#/components/schemas/Error"

        let(:user) { create(:user, :employee, email: "employee@example.com", password: "password123") }
        let(:credentials) { { email: user.email, password: "password123" } }

        run_test!
      end
    end
  end

  path "/api/v1/auth/sign_out" do
    delete "Sign out the current user" do
      tags "Authentication"
      security [ bearerAuth: [] ]
      produces "application/json"

      response "200", "signed out" do
        schema type: :object, properties: { message: { type: :string, example: "Signed out successfully" } }

        let(:user) { create(:user, :hr) }
        let(:Authorization) { bearer_token_for(user) }

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
