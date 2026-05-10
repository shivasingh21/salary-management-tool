module Insights
  class PayrollSummary
    def self.call
      new.call
    end

    def call
      row = Employee.active.pick(
        Arel.sql("COALESCE(SUM(salary), 0)"),
        Arel.sql("COUNT(id)"),
        Arel.sql("COALESCE(AVG(salary), 0)"),
        Arel.sql("MAX(salary)"),
        Arel.sql("MIN(salary)")
      )

      total_payroll, total_employees, average_salary, highest_salary, lowest_salary = row

      {
        total_payroll: total_payroll,
        total_employees: total_employees,
        average_salary: average_salary,
        highest_salary: highest_salary,
        lowest_salary: lowest_salary
      }
    end
  end
end
