module Api
  module V1
    class JobTitlesController < Api::V1::BaseController
      before_action :authenticate_hr_user!
      before_action :set_job_title, only: :destroy

      def index
        render json: JobTitle.order(:name).map { |job_title| job_title_response(job_title) }
      end

      def create
        job_title = JobTitle.new(job_title_params)

        if job_title.save
          render json: job_title_response(job_title), status: :created
        else
          render json: { errors: job_title.errors.to_hash }, status: :unprocessable_content
        end
      end

      def destroy
        @job_title.destroy!

        head :no_content
      rescue ActiveRecord::DeleteRestrictionError
        render json: { error: "Job title has employees" }, status: :conflict
      end

      private

      def set_job_title
        @job_title = JobTitle.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Job title not found" }, status: :not_found
      end

      def job_title_params
        params.fetch(:job_title, params).permit(:name)
      end

      def job_title_response(job_title)
        {
          id: job_title.id,
          name: job_title.name
        }
      end
    end
  end
end
