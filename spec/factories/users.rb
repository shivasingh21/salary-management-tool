FactoryBot.define do
  factory :user do
    first_name { "Avery" }
    last_name { "Stone" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }
    role { :employee }

    trait :hr do
      role { :hr }
    end

    trait :employee do
      role { :employee }
    end
  end
end
