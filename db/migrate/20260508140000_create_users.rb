class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :email, null: false
      t.string :encrypted_password, null: false, default: ""
      t.integer :role, null: false, default: 1
      t.datetime :last_sign_in_at
      t.string :jti, null: false

      t.timestamps
    end

    add_index :users, "lower(email)", unique: true, name: "index_users_on_lower_email"
    add_index :users, :jti, unique: true
  end
end
