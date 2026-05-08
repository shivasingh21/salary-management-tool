class CreateEmployeeLookupTables < ActiveRecord::Migration[8.1]
  def up
    create_lookup_table(:departments)
    create_lookup_table(:job_titles)
    create_lookup_table(:countries)

    add_lookup_reference(:department)
    add_lookup_reference(:job_title)
    add_lookup_reference(:country)

    change_column_null :employees, :department_id, false
    change_column_null :employees, :job_title_id, false
    change_column_null :employees, :country_id, false

    remove_index :employees, :department if index_exists?(:employees, :department)
    remove_index :employees, :job_title if index_exists?(:employees, :job_title)
    remove_index :employees, :country if index_exists?(:employees, :country)

    remove_column :employees, :department if column_exists?(:employees, :department)
    remove_column :employees, :job_title if column_exists?(:employees, :job_title)
    remove_column :employees, :country if column_exists?(:employees, :country)
  end

  def down
    add_column :employees, :department, :string unless column_exists?(:employees, :department)
    add_column :employees, :job_title, :string unless column_exists?(:employees, :job_title)
    add_column :employees, :country, :string unless column_exists?(:employees, :country)

    change_column_null :employees, :department, false
    change_column_null :employees, :job_title, false
    change_column_null :employees, :country, false

    remove_reference :employees, :department, foreign_key: true if column_exists?(:employees, :department_id)
    remove_reference :employees, :job_title, foreign_key: true if column_exists?(:employees, :job_title_id)
    remove_reference :employees, :country, foreign_key: true if column_exists?(:employees, :country_id)

    add_index :employees, :department unless index_exists?(:employees, :department)
    add_index :employees, :job_title unless index_exists?(:employees, :job_title)
    add_index :employees, :country unless index_exists?(:employees, :country)

    drop_table :countries, if_exists: true
    drop_table :job_titles, if_exists: true
    drop_table :departments, if_exists: true
  end

  private

  def create_lookup_table(table_name)
    create_table table_name, if_not_exists: true do |t|
      t.string :name, null: false
    end

    add_index table_name, :name, unique: true unless index_exists?(table_name, :name)
  end

  def add_lookup_reference(name)
    return if column_exists?(:employees, :"#{name}_id")

    add_reference :employees, name, null: true, foreign_key: true
  end
end
