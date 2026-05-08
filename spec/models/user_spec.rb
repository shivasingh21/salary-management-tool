require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  describe "associations" do
    it { is_expected.to have_one(:employee).dependent(:destroy) }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:first_name) }
    it { is_expected.to validate_presence_of(:last_name) }
    it { is_expected.to validate_presence_of(:role) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
  end

  describe "roles" do
    it { is_expected.to define_enum_for(:role).with_values(hr: 0, employee: 1) }
  end

  describe "email normalization" do
    it "stores email in lowercase" do
      user.email = "HR@Example.COM "
      user.validate

      expect(user.email).to eq("hr@example.com")
    end
  end
end
