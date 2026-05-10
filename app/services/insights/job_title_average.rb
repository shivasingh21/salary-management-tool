module Insights
  class JobTitleAverage
    def self.call
      new.call
    end

    def call
      Employee.active
              .joins(:country, :job_title)
              .group("countries.name", "job_titles.name")
              .order(Arel.sql("countries.name ASC, job_titles.name ASC"))
              .pluck(
                Arel.sql("countries.name"),
                Arel.sql("job_titles.name"),
                Arel.sql("AVG(employees.salary)"),
                Arel.sql("COUNT(employees.id)")
              )
              .map do |country, job_title, avg_salary, employee_count|
        {
          country: country,
          job_title: job_title,
          avg_salary: avg_salary,
          employee_count: employee_count
        }
      end
    end
  end
end
