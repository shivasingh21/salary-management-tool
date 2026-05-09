Rails.application.routes.draw do
  devise_for :users, skip: :all

  namespace :api do
    namespace :v1 do
      get "health", to: "health#show"
      resources :countries, only: %i[index create destroy]
      resources :departments, only: %i[index create destroy]
      resources :employees
      resources :job_titles, only: %i[index create destroy]

      namespace :auth do
        post "sign_in", to: "sessions#create"
        delete "sign_out", to: "sessions#destroy"
      end
    end
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check
end
