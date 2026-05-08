class ApplicationController < ActionController::API
  include Devise::Controllers::Helpers

  private

  def authenticate_user!
    current_user || warden.authenticate!(scope: :user)
  end

  def current_user
    @current_user ||= warden.authenticate(scope: :user)
  end
end
