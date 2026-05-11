module Api
  module V1
    class EmployeesController < Api::V1::BaseController
      before_action :authenticate_hr_user!
      before_action :set_employee, only: %i[show update destroy]

      def index
        employees = filtered_employees
        total_count = employees.count
        page = current_page
        per_page = current_per_page

        render json: {
          data: employees.includes(:user, :department, :job_title, :country)
            .order(created_at: :desc, id: :desc)
            .offset((page - 1) * per_page)
            .limit(per_page)
            .map { |employee| employee_response(employee) },
          meta: {
            page: page,
            per_page: per_page,
            total_count: total_count,
            total_pages: (total_count.to_f / per_page).ceil
          }
        }
      end

      def show
        render json: employee_response(@employee)
      end

      def create
        employee = Employee.new(create_employee_params)

        if create_employee(employee)
          render json: employee_response(employee), status: :created
        else
          render json: { errors: validation_errors(employee) }, status: :unprocessable_content
        end
      end

      def update
        if save_employee(@employee, update_employee_params)
          render json: employee_response(@employee)
        else
          render json: { errors: validation_errors(@employee) }, status: :unprocessable_content
        end
      end

      def destroy
        @employee.soft_delete!

        head :no_content
      end

      private

      def set_employee
        @employee = Employee.not_deleted.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Employee not found" }, status: :not_found
      end

      def create_employee_params
        params.fetch(:employee, params).permit(
          :department_id,
          :job_title_id,
          :country_id,
          :salary,
          :joining_date,
          :status,
          :active
        )
      end

      def update_employee_params
        params.fetch(:employee, params).permit(
          :department_id,
          :job_title_id,
          :salary,
          :joining_date,
          :status
        )
      end

      def employee_user_params
        params.fetch(:employee, params).permit(:first_name, :last_name, :email)
      end

      def save_employee(employee, permitted_employee_params)
        Employee.transaction do
          employee.assign_attributes(permitted_employee_params)
          employee.save!
          update_employee_user(employee)
        end

        true
      rescue ActiveRecord::RecordInvalid => error
        @validation_errors = combined_validation_errors(employee, error.record)
        false
      end

      def create_employee(employee)
        Employee.transaction do
          employee.assign_attributes(create_employee_params)
          employee.user = employee_user_for_create
          employee.user.save!
          employee.save!
        end

        true
      rescue ActiveRecord::RecordInvalid => error
        @validation_errors = combined_validation_errors(employee, employee.user, error.record)
        false
      end

      def employee_user_for_create
        user_attributes = employee_user_params
        user = User.find_or_initialize_by(email: user_attributes[:email])
        user.assign_attributes(user_attributes.merge(role: :employee))
        user.password = SecureRandom.hex(24) if user.new_record?
        user
      end

      def update_employee_user(employee)
        user_attributes = employee_user_params
        return if user_attributes.empty?

        employee.user.update!(user_attributes)
      end

      def validation_errors(employee)
        @validation_errors.presence || employee.errors.to_hash
      end

      def combined_validation_errors(*records)
        records.compact.uniq.each_with_object({}) do |record, errors|
          record.errors.to_hash.each do |attribute, messages|
            errors[attribute] ||= []
            errors[attribute].concat(messages)
          end
        end
      end

      def filtered_employees
        Employee.not_deleted
          .left_joins(:user, :job_title, :department, :country)
          .then { |scope| filter_by_id(scope) }
          .then { |scope| filter_by_joining_date(scope) }
          .then { |scope| filter_by_name(scope) }
          .then { |scope| filter_by_lookup(scope, :job_title_id) }
          .then { |scope| filter_by_lookup(scope, :department_id) }
          .then { |scope| filter_by_lookup(scope, :country_id) }
          .then { |scope| filter_by_status(scope) }
          .then { |scope| filter_by_salary_range(scope) }
      end

      def filter_by_id(scope)
        return scope if params[:id].blank?

        scope.where(employees: { id: params[:id] })
      end

      def filter_by_joining_date(scope)
        return scope if params[:joining_date].blank?

        scope.where(joining_date: params[:joining_date])
      end

      def filter_by_name(scope)
        return scope if params[:name].blank?

        name_query = "%#{ActiveRecord::Base.sanitize_sql_like(params[:name].to_s)}%"
        scope.where("users.first_name ILIKE :query OR users.last_name ILIKE :query", query: name_query)
      end

      def filter_by_lookup(scope, key)
        return scope if params[key].blank?

        scope.where(key => params[key])
      end

      def filter_by_status(scope)
        return scope if params[:status].blank?

        scope.where(status: params[:status])
      end

      def filter_by_salary_range(scope)
        case params[:salary_range]
        when "0-50000"
          scope.where(salary: 0..50_000)
        when "50001-100000"
          scope.where(salary: 50_001..100_000)
        when "100001-200000"
          scope.where(salary: 100_001..200_000)
        when "200000+"
          scope.where("employees.salary > ?", 200_000)
        else
          scope
        end
      end

      def current_page
        [ params.fetch(:page, 1).to_i, 1 ].max
      end

      def current_per_page
        requested = params.fetch(:per_page, 20).to_i

        requested.clamp(1, 100)
      end

      def employee_response(employee)
        {
          id: employee.id,
          user_id: employee.user_id,
          first_name: employee.user&.first_name,
          last_name: employee.user&.last_name,
          full_name: employee.full_name,
          email: employee.email,
          department: lookup_response(employee.department),
          job_title: lookup_response(employee.job_title),
          country: lookup_response(employee.country),
          salary: employee.salary.to_s,
          joining_date: employee.joining_date,
          status: employee.status,
          active: employee.active,
          deleted_at: employee.deleted_at,
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
