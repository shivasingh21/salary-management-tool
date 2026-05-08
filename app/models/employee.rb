class Employee < ApplicationRecord
  belongs_to :user, optional: true
  belongs_to :department
  belongs_to :job_title
  belongs_to :country

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
end
