module Api
  module V1
    class BaseController < Api::BaseController
      private

      def authenticate_hr_user!
        authenticate_user!
        return if current_user.hr?

        render json: { error: "Only HR users can access this resource" }, status: :forbidden
      end
    end
  end
end
