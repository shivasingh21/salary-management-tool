class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable,
    :jwt_authenticatable,
    :validatable,
    jwt_revocation_strategy: self

  enum :role, { hr: 0, employee: 1 }

  has_one :employee, dependent: :destroy

  before_validation :normalize_email
  before_validation :ensure_jti

  validates :first_name, :last_name, :role, presence: true
  validates :first_name, :last_name, length: { maximum: 50 }
  validates :email,
    uniqueness: { case_sensitive: false },
    length: { maximum: 50 },
    format: { with: URI::MailTo::EMAIL_REGEXP, message: "must be a valid email address" }

  private

  def normalize_email
    self.email = email.to_s.downcase.strip
  end

  def ensure_jti
    self.jti ||= SecureRandom.uuid
  end
end
