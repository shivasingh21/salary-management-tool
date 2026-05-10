module Insights
  class DepartmentAverage
    def self.call
      new.call
    end

    def call
      Employee.active
              .joins(:department)
              .group("departments.name")
              .order(Arel.sql("departments.name ASC"))
              .pluck(
                Arel.sql("departments.name"),
                Arel.sql("AVG(employees.salary)"),
                Arel.sql("COUNT(employees.id)")
              )
              .map do |department, avg_salary, employee_count|
        {
          department: department,
          avg_salary: avg_salary,
          employee_count: employee_count
        }
      end
    end
  end
end
