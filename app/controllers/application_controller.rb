class ApplicationController < ActionController::API
  include ActionController::Cookies
  include Devise::Controllers::Helpers

  before_action :apply_cookie_authorization

  private

  def authenticate_user!
    current_user || warden.authenticate!(scope: :user)
  end

  def current_user
    @current_user ||= warden.authenticate(scope: :user)
  end

  def apply_cookie_authorization
    return if request.headers["Authorization"].present?

    token = cookies.encrypted[:auth_token]
    request.headers["Authorization"] = "Bearer #{token}" if token.present?
  end
end
