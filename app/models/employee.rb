class Employee < ApplicationRecord
  belongs_to :user
  belongs_to :department
  belongs_to :job_title
  belongs_to :country

  enum :status, { onboarding: 0, active: 1, inactive: 2 }, prefix: true

  before_validation :sync_active_from_status

  validates :salary, :joining_date, presence: true
  validates :salary, numericality: { greater_than: 0 }
  validates :active, inclusion: { in: [ true, false ] }
  validate :user_email_is_unique_for_existing_employees

  scope :not_deleted, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }
  scope :active, -> { not_deleted.where(active: true) }
  scope :by_country, ->(country) { joins(:country).where(countries: { name: country }) }
  scope :by_job_title, ->(job_title) { joins(:job_title).where(job_titles: { name: job_title }) }

  def soft_delete!
    update!(deleted_at: Time.current)
  end

  def full_name
    [ user&.first_name, user&.last_name ].compact_blank.join(" ")
  end

  def email
    user&.email
  end

  private

  def sync_active_from_status
    self.active = !status_inactive? if will_save_change_to_status?
  end

  def user_email_is_unique_for_existing_employees
    return if user&.email.blank?

    duplicate_exists = Employee.not_deleted
      .joins(:user)
      .where("LOWER(users.email) = ?", user.email.downcase)
      .where.not(id: id)
      .exists?

    errors.add(:user_id, "email has already been taken") if duplicate_exists
  end
end
