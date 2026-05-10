module Insights
  class SalaryDistribution
    BUCKETS = [
      "0-50000",
      "50001-100000",
      "100001-200000",
      "200000+"
    ].freeze

    RANGE_SQL = <<~SQL.squish.freeze
      CASE
      WHEN salary BETWEEN 0 AND 50000 THEN '0-50000'
      WHEN salary BETWEEN 50001 AND 100000 THEN '50001-100000'
      WHEN salary BETWEEN 100001 AND 200000 THEN '100001-200000'
      ELSE '200000+'
      END
    SQL

    ORDER_SQL = <<~SQL.squish.freeze
      CASE #{RANGE_SQL}
      WHEN '0-50000' THEN 1
      WHEN '50001-100000' THEN 2
      WHEN '100001-200000' THEN 3
      ELSE 4
      END
    SQL

    def self.call
      new.call
    end

    def call
      counts_by_range = Employee.active
                                .group(Arel.sql(RANGE_SQL))
                                .order(Arel.sql(ORDER_SQL))
                                .count

      BUCKETS.map do |range|
        {
          range: range,
          employee_count: counts_by_range.fetch(range, 0)
        }
      end
    end
  end
end
