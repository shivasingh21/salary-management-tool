Rswag::Ui.configure do |config|
  config.openapi_endpoint "/api-docs/v1/openapi.yaml", "Salary Management API V1"
  config.config_object["persistAuthorization"] = true
end
