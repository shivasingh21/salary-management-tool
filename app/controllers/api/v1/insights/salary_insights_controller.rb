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
      end
    end
  end
end
