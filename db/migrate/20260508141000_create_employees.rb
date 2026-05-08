class CreateEmployees < ActiveRecord::Migration[8.1]
  def change
    create_table :employees do |t|
      t.references :user, null: true, foreign_key: true, index: false
      t.string :job_title, null: false
      t.string :department, null: false
      t.string :country, null: false
      t.decimal :salary, precision: 12, scale: 2, null: false
      t.date :joining_date, null: false
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :employees, :user_id, unique: true, where: "user_id IS NOT NULL"
    add_index :employees, :country
    add_index :employees, :job_title
    add_index :employees, :active, where: "active = true", name: "index_employees_on_active_true"
  end
end
