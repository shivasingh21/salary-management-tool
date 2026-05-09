module Api
  module V1
    class DepartmentsController < Api::V1::BaseController
      before_action :authenticate_hr_user!
      before_action :set_department, only: :destroy

      def index
        render json: Department.order(:name).map { |department| department_response(department) }
      end

      def create
        department = Department.new(department_params)

        if department.save
          render json: department_response(department), status: :created
        else
          render json: { errors: department.errors.to_hash }, status: :unprocessable_content
        end
      end

      def destroy
        @department.destroy!

        head :no_content
      rescue ActiveRecord::DeleteRestrictionError
        render json: { error: "Department has employees" }, status: :conflict
      end

      private

      def set_department
        @department = Department.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Department not found" }, status: :not_found
      end

      def department_params
        params.fetch(:department, params).permit(:name)
      end

      def department_response(department)
        {
          id: department.id,
          name: department.name
        }
      end
    end
  end
end
