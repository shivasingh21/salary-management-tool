class AddStatusToEmployees < ActiveRecord::Migration[8.1]
  def up
    add_column :employees, :status, :integer, null: false, default: 1
    add_index :employees, :status
    execute "UPDATE employees SET status = 2 WHERE active = false"
  end

  def down
    remove_index :employees, :status
    remove_column :employees, :status
  end
end
