module Insights
  class CountrySalaryStats
    def self.call
      new.call
    end

    def call
      Employee.active
              .joins(:country)
              .group("countries.name")
              .order(Arel.sql("countries.name ASC"))
              .pluck(
                Arel.sql("countries.name"),
                Arel.sql("MIN(employees.salary)"),
                Arel.sql("MAX(employees.salary)"),
                Arel.sql("AVG(employees.salary)"),
                Arel.sql("COUNT(employees.id)")
              )
              .map do |country, min_salary, max_salary, avg_salary, employee_count|
        {
          country: country,
          min_salary: min_salary,
          max_salary: max_salary,
          avg_salary: avg_salary,
          employee_count: employee_count
        }
      end
    end
  end
end
