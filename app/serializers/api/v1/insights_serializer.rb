module Api
  module V1
    module InsightsSerializer
      module_function

      def country_salaries(rows)
        collection(rows)
      end

      def country_salary_stats(rows)
        collection(rows)
      end

      def department_average(rows)
        collection(rows)
      end

      def job_title_average(rows)
        collection(rows)
      end

      def job_title_salary_stats(rows)
        collection(rows)
      end

      def payroll_summary(summary)
        {
          data: {
            total_payroll: decimal(summary[:total_payroll]),
            total_employees: summary[:total_employees].to_i,
            average_salary: decimal(summary[:average_salary]),
            highest_salary: decimal(summary[:highest_salary]),
            lowest_salary: decimal(summary[:lowest_salary])
          }
        }
      end

      def salary_distribution(rows)
        collection(rows)
      end

      def collection(rows)
        { data: rows.map { |row| serialize_row(row) } }
      end

      def serialize_row(row)
        row.transform_values do |value|
          value.is_a?(BigDecimal) ? decimal(value) : value
        end
      end

      def decimal(value)
        return nil if value.nil?

        BigDecimal(value.to_s).round(2).to_s("F")
      end
    end
  end
end
