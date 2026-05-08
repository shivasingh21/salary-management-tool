FactoryBot.define do
  factory :employee do
    association :user, role: :employee
    job_title { "Software Engineer" }
    department { "Engineering" }
    country { "United States" }
    salary { 95_000.00 }
    joining_date { Date.current }
    active { true }

    trait :without_user do
      user { nil }
    end
  end
end
