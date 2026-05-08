allowed_origins = ENV.fetch("FRONTEND_ORIGINS", "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map(&:strip)
  .reject(&:empty?)

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(*allowed_origins)

    resource "/api/*",
      headers: :any,
      methods: %i[get post put patch delete options head],
      credentials: false
  end
end
