class ReplaceEmployeeUserUniqueIndexWithPartialIndex < ActiveRecord::Migration[8.1]
  def change
    remove_index :employees, name: "index_employees_on_user_id"
    add_index :employees, :user_id, unique: true, where: "deleted_at IS NULL"
  end
end
