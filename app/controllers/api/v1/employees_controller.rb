module Api
  module V1
    class EmployeesController < Api::V1::BaseController
      before_action :authenticate_hr_user!
      before_action :set_employee, only: %i[show update destroy]

      def index
        render json: Employee.includes(:user, :department, :job_title, :country).map { |employee| employee_response(employee) }
      end

      def show
        render json: employee_response(@employee)
      end

      def create
        employee = Employee.new(employee_params)

        if employee.save
          render json: employee_response(employee), status: :created
        else
          render json: { errors: employee.errors.to_hash }, status: :unprocessable_content
        end
      end

      def update
        if @employee.update(employee_params)
          render json: employee_response(@employee)
        else
          render json: { errors: @employee.errors.to_hash }, status: :unprocessable_content
        end
      end

      def destroy
        @employee.update!(status: :inactive)

        head :no_content
      end

      private

      def set_employee
        @employee = Employee.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Employee not found" }, status: :not_found
      end

      def employee_params
        params.fetch(:employee, params).permit(
          :user_id,
          :department_id,
          :job_title_id,
          :country_id,
          :salary,
          :joining_date,
          :status,
          :active
        )
      end

      def employee_response(employee)
        {
          id: employee.id,
          user_id: employee.user_id,
          full_name: employee.full_name,
          email: employee.email,
          department: lookup_response(employee.department),
          job_title: lookup_response(employee.job_title),
          country: lookup_response(employee.country),
          salary: employee.salary.to_s,
          joining_date: employee.joining_date,
          status: employee.status,
          active: employee.active,
          created_at: employee.created_at,
          updated_at: employee.updated_at
        }
      end

      def lookup_response(record)
        {
          id: record.id,
          name: record.name
        }
      end
    end
  end
end
