module SeedData
  EMPLOYEE_COUNT = 10_000
  DEFAULT_PASSWORD = "Password@123"
  EMPLOYEE_EMAIL_DOMAIN = "example.com"
  FAKER_SEED = 123_456
  BULK_BATCH_SIZE = 1_000
  SEEDED_EMPLOYEE_EMAIL_PREFIX = "seed.employee"

  HR_USERS = [
    { first_name: "HR", last_name: "One", email: "hr1@example.com" },
    { first_name: "HR", last_name: "Two", email: "hr2@example.com" }
  ].freeze

  module_function

  def run
    now = Time.current
    reset_faker
    seed_payload = build_seed_payload

    insert_lookup_records(seed_payload)
    insert_hr_users(now)
    insert_employee_users(seed_payload.fetch(:employee_users), now)
    insert_employees(seed_payload, now)

    puts "Seeded #{Department.count} departments, #{JobTitle.count} job titles, #{Country.count} countries"
    puts "Seeded #{User.hr.count} HR users and #{User.employee.count} employee users"
    puts "Seeded #{Employee.count} employees"
  end

  def reset_faker
    Faker::Config.random = Random.new(FAKER_SEED)
    Faker::UniqueGenerator.clear
  end

  def build_seed_payload
    {
      departments: unique_values { Faker::Company.industry },
      job_titles: unique_values { Faker::Job.title },
      countries: unique_values { Faker::Address.country },
      employee_users: employee_user_rows
    }
  end

  def unique_values(count = 30)
    values = []

    values << yield.titleize while values.uniq.length < count
    values.uniq.first(count)
  end

  def insert_lookup_records(seed_payload)
    Department.insert_all(seed_payload.fetch(:departments).map { |name| { name: name } }, unique_by: :index_departments_on_name)
    JobTitle.insert_all(seed_payload.fetch(:job_titles).map { |name| { name: name } }, unique_by: :index_job_titles_on_name)
    Country.insert_all(seed_payload.fetch(:countries).map { |name| { name: name } }, unique_by: :index_countries_on_name)
  end

  def insert_hr_users(now)
    User.insert_all(
      HR_USERS.map { |user| user_row(user, role: :hr, now: now) },
      unique_by: :index_users_on_lower_email
    )
  end

  def insert_employee_users(employee_users, now)
    employee_users.each_slice(BULK_BATCH_SIZE) do |rows|
      User.insert_all(rows.map { |row| user_row(row, role: :employee, now: now) }, unique_by: :index_users_on_lower_email)
    end
  end

  def insert_employees(seed_payload, now)
    department_ids = Department.where(name: seed_payload.fetch(:departments)).order(:id).pluck(:id)
    job_title_ids = JobTitle.where(name: seed_payload.fetch(:job_titles)).order(:id).pluck(:id)
    country_ids = Country.where(name: seed_payload.fetch(:countries)).order(:id).pluck(:id)
    user_ids = User.where(email: seed_payload.fetch(:employee_users).pluck(:email)).order(:email).pluck(:id)

    employee_rows(user_ids, department_ids, job_title_ids, country_ids, now).each_slice(BULK_BATCH_SIZE) do |rows|
      Employee.insert_all(rows, unique_by: :index_employees_on_user_id)
    end
  end

  def user_row(user, role:, now:)
    {
      first_name: user.fetch(:first_name),
      last_name: user.fetch(:last_name),
      email: user.fetch(:email),
      encrypted_password: encrypted_password,
      role: User.roles.fetch(role.to_s),
      jti: SecureRandom.uuid,
      created_at: now,
      updated_at: now
    }
  end

  def employee_user_rows
    (1..EMPLOYEE_COUNT).map do |number|
      first_name = Faker::Name.first_name
      last_name = Faker::Name.last_name

      {
        first_name: first_name,
        last_name: last_name,
        email: employee_email(number, first_name, last_name)
      }
    end
  end

  def employee_rows(user_ids, department_ids, job_title_ids, country_ids, now)
    user_ids.map do |user_id|
      status = random_status

      {
        user_id: user_id,
        department_id: random_id_between(department_ids),
        job_title_id: random_id_between(job_title_ids),
        country_id: random_id_between(country_ids),
        salary: Faker::Number.between(from: 45_000, to: 200_000),
        joining_date: Faker::Date.between(from: 8.years.ago.to_date, to: Date.current),
        status: Employee.statuses.fetch(status),
        active: status != "inactive",
        created_at: now,
        updated_at: now
      }
    end
  end

  def random_status
    Faker::Base.sample(%w[onboarded active active active inactive])
  end

  def random_id_between(ids)
    Faker::Number.between(from: ids.first, to: ids.last)
  end

  def employee_email(number, first_name, last_name)
    username = Faker::Internet.username(specifier: "#{first_name} #{last_name}", separators: %w[. _])

    "#{SEEDED_EMPLOYEE_EMAIL_PREFIX}.#{number.to_s.rjust(5, "0")}.#{username}@#{EMPLOYEE_EMAIL_DOMAIN}".downcase
  end

  def encrypted_password
    @encrypted_password ||= Devise::Encryptor.digest(User, DEFAULT_PASSWORD)
  end
end

SeedData.run
