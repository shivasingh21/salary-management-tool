module Api
  module V1
    class CountriesController < Api::V1::BaseController
      before_action :authenticate_hr_user!
      before_action :set_country, only: :destroy

      def index
        render json: Country.order(:name).map { |country| country_response(country) }
      end

      def create
        country = Country.new(country_params)

        if country.save
          render json: country_response(country), status: :created
        else
          render json: { errors: country.errors.to_hash }, status: :unprocessable_content
        end
      end

      def destroy
        @country.destroy!

        head :no_content
      rescue ActiveRecord::DeleteRestrictionError
        render json: { error: "Country has employees" }, status: :conflict
      end

      private

      def set_country
        @country = Country.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Country not found" }, status: :not_found
      end

      def country_params
        params.fetch(:country, params).permit(:name)
      end

      def country_response(country)
        {
          id: country.id,
          name: country.name
        }
      end
    end
  end
end
