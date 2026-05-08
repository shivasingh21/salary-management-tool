require "rails_helper"

RSpec.describe Employee, type: :model do
  subject(:employee) { build(:employee) }

  describe "associations" do
    it { is_expected.to belong_to(:user).optional }
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:job_title) }
    it { is_expected.to validate_presence_of(:department) }
    it { is_expected.to validate_presence_of(:country) }
    it { is_expected.to validate_presence_of(:salary) }
    it { is_expected.to validate_presence_of(:joining_date) }
    it { is_expected.to validate_numericality_of(:salary).is_greater_than(0) }
    it { is_expected.to allow_value(true).for(:active) }
    it { is_expected.to allow_value(false).for(:active) }
    it { is_expected.not_to allow_value(nil).for(:active) }
  end

  describe "#full_name" do
    it "returns the user's full name" do
      employee.user.first_name = "Maya"
      employee.user.last_name = "Patel"

      expect(employee.full_name).to eq("Maya Patel")
    end

    it "returns an empty string when no user is assigned" do
      employee.user = nil

      expect(employee.full_name).to eq("")
    end
  end

  describe "#email" do
    it "returns the user's email" do
      employee.user.email = "employee@example.com"

      expect(employee.email).to eq("employee@example.com")
    end

    it "returns nil when no user is assigned" do
      employee.user = nil

      expect(employee.email).to be_nil
    end
  end

  describe "scopes" do
    let!(:active_employee) { create(:employee, active: true, country: "India", job_title: "Engineer") }
    let!(:inactive_employee) { create(:employee, active: false, country: "India", job_title: "Engineer") }
    let!(:manager) { create(:employee, active: true, country: "United States", job_title: "Manager") }

    it "returns active employees" do
      expect(described_class.active).to contain_exactly(active_employee, manager)
    end

    it "filters employees by country" do
      expect(described_class.by_country("India")).to contain_exactly(active_employee, inactive_employee)
    end

    it "filters employees by job title" do
      expect(described_class.by_job_title("Manager")).to contain_exactly(manager)
    end
  end
end
