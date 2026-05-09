class RequireUserForEmployees < ActiveRecord::Migration[8.1]
  def change
    change_column_null :employees, :user_id, false

    remove_index :employees, name: "index_employees_on_user_id"
    add_index :employees, :user_id, unique: true
  end
end
