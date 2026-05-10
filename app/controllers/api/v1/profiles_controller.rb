module Api
  module V1
    class ProfilesController < Api::V1::BaseController
      before_action :authenticate_hr_user!

      def show
        render json: profile_response(current_user)
      end

      def update
        if current_user.update(profile_params)
          render json: profile_response(current_user)
        else
          render json: { errors: current_user.errors.to_hash }, status: :unprocessable_content
        end
      end

      private

      def profile_params
        params.fetch(:profile, params).permit(:first_name, :last_name)
      end

      def profile_response(user)
        {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          last_sign_in_at: user.last_sign_in_at,
          created_at: user.created_at
        }
      end
    end
  end
end
