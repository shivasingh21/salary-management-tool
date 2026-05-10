class Employee < ApplicationRecord
  belongs_to :user
  belongs_to :department
  belongs_to :job_title
  belongs_to :country

  enum :status, { onboarded: 0, active: 1, inactive: 2 }, prefix: true

  before_validation :sync_active_from_status

  validates :salary, :joining_date, presence: true
  validates :salary, numericality: { greater_than: 0 }
  validates :active, inclusion: { in: [ true, false ] }

  scope :active, -> { where(active: true) }
  scope :by_country, ->(country) { joins(:country).where(countries: { name: country }) }
  scope :by_job_title, ->(job_title) { joins(:job_title).where(job_titles: { name: job_title }) }

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
end
