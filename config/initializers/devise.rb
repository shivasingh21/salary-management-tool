require Rails.root.join("lib/json_failure_app")

Devise.setup do |config|
  config.mailer_sender = "no-reply@salary-management-tool.local"
  config.navigational_formats = []
  config.skip_session_storage = [:http_auth]
  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.stretches = Rails.env.test? ? 1 : 12
  config.reconfirmable = false
  config.expire_all_remember_me_on_sign_out = true
  config.password_length = 8..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/

  config.jwt do |jwt|
    jwt.secret = Rails.application.credentials.devise_jwt_secret_key || Rails.application.secret_key_base
    jwt.dispatch_requests = [["POST", %r{^/api/v1/auth/sign_in$}]]
    jwt.revocation_requests = [["DELETE", %r{^/api/v1/auth/sign_out$}]]
    jwt.expiration_time = 1.day.to_i
  end

  config.warden do |manager|
    manager.failure_app = JsonFailureApp
  end
end
