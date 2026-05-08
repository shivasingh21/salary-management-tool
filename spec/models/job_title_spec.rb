require "rails_helper"

RSpec.describe JobTitle, type: :model do
  subject(:job_title) { build(:job_title) }

  describe "associations" do
    it { is_expected.to have_many(:employees).dependent(:restrict_with_exception) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:name) }
  end
end
