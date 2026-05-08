class Employee < ApplicationRecord
  belongs_to :user, optional: true

  validates :job_title, :department, :country, :salary, :joining_date, presence: true
  validates :salary, numericality: { greater_than: 0 }
  validates :active, inclusion: { in: [ true, false ] }

  scope :active, -> { where(active: true) }
  scope :by_country, ->(country) { where(country: country) }
  scope :by_job_title, ->(job_title) { where(job_title: job_title) }

  def full_name
    [ user&.first_name, user&.last_name ].compact_blank.join(" ")
  end

  def email
    user&.email
  end
end
