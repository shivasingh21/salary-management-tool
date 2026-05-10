module Api
  module V1
    class DepartmentsController < Api::V1::BaseController
      before_action :authenticate_hr_user!
      before_action :set_department, only: %i[update destroy]

      def index
        render json: Department.left_joins(:employees)
          .select("departments.*, COUNT(employees.id) AS employees_count")
          .group("departments.id")
          .order(:name)
          .map { |department| department_response(department) }
      end

      def update
        if @department.update(department_params)
          render json: department_response(@department)
        else
          render json: { errors: @department.errors.to_hash }, status: :unprocessable_content
        end
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
          name: department.name,
          employee_count: department.try(:employees_count).to_i
        }
      end
    end
  end
end
