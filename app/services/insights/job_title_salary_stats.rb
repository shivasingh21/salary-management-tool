module Insights
  class JobTitleSalaryStats
    def self.call(country_id:)
      new(country_id: country_id).call
    end

    def initialize(country_id:)
      @country_id = country_id
    end

    def call
      Employee.active
              .joins(:country, :job_title)
              .where(country_id: @country_id)
              .group("countries.name", "job_titles.name")
              .order(Arel.sql("job_titles.name ASC"))
              .pluck(
                Arel.sql("countries.name"),
                Arel.sql("job_titles.name"),
                Arel.sql("MIN(employees.salary)"),
                Arel.sql("MAX(employees.salary)"),
                Arel.sql("AVG(employees.salary)"),
                Arel.sql("COUNT(employees.id)")
              )
              .map do |country, job_title, min_salary, max_salary, avg_salary, employee_count|
        {
          country: country,
          job_title: job_title,
          min_salary: min_salary,
          max_salary: max_salary,
          avg_salary: avg_salary,
          employee_count: employee_count
        }
      end
    end
  end
end
