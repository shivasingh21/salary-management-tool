module Api
  module V1
    module Insights
      class SalaryInsightsController < Api::V1::BaseController
        before_action :authenticate_hr_user!

        def country_salaries
          render json: Api::V1::InsightsSerializer.country_salaries(
            ::Insights::CountrySalaries.call
          )
        end

        def country_salary_stats
          render json: Api::V1::InsightsSerializer.country_salary_stats(
            ::Insights::CountrySalaryStats.call
          )
        end

        def department_average
          render json: Api::V1::InsightsSerializer.department_average(
            ::Insights::DepartmentAverage.call
          )
        end

        def job_title_average
          render json: Api::V1::InsightsSerializer.job_title_average(
            ::Insights::JobTitleAverage.call
          )
        end

        def job_title_salary_stats
          return render_missing_country_id unless params[:country_id].present?

          render json: Api::V1::InsightsSerializer.job_title_salary_stats(
            ::Insights::JobTitleSalaryStats.call(country_id: params[:country_id])
          )
        end

        def payroll_summary
          render json: Api::V1::InsightsSerializer.payroll_summary(
            ::Insights::PayrollSummary.call
          )
        end

        def salary_distribution
          render json: Api::V1::InsightsSerializer.salary_distribution(
            ::Insights::SalaryDistribution.call
          )
        end

        private

        def render_missing_country_id
          render json: { error: "country_id query parameter is required" }, status: :bad_request
        end
      end
    end
  end
end
