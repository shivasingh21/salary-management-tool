FactoryBot.define do
  factory :employee do
    association :user, role: :employee
    department
    job_title
    country
    salary { 95_000.00 }
    joining_date { Date.current }
    active { true }

    trait :without_user do
      user { nil }
    end
  end
end
