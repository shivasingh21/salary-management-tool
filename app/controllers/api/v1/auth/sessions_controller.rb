module Api
  module V1
    module Auth
      class SessionsController < Api::V1::BaseController
        before_action :authenticate_user!, only: :destroy

        def create
          user = User.find_for_database_authentication(email: sign_in_params[:email])

          return render_invalid_credentials unless user&.valid_password?(sign_in_params[:password])
          return render_login_not_allowed unless user.hr?

          token, = Warden::JWTAuth::UserEncoder.new.call(user, :user, nil)
          user.update!(last_sign_in_at: Time.current)

          response.set_header("Authorization", "Bearer #{token}")
          render json: { user: user_response(user), token: token }, status: :ok
        end

        def destroy
          current_user.update!(jti: SecureRandom.uuid)

          render json: { message: "Signed out successfully" }, status: :ok
        end

        private

        def sign_in_params
          params.fetch(:user, params).permit(:email, :password)
        end

        def user_response(user)
          {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            last_sign_in_at: user.last_sign_in_at
          }
        end

        def render_invalid_credentials
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end

        def render_login_not_allowed
          render json: { error: "Only HR users can sign in" }, status: :forbidden
        end
      end
    end
  end
end
