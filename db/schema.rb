# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_05_08_141000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "employees", force: :cascade do |t|
    t.boolean "active", default: true, null: false
    t.string "country", null: false
    t.datetime "created_at", null: false
    t.string "department", null: false
    t.string "job_title", null: false
    t.date "joining_date", null: false
    t.decimal "salary", precision: 12, scale: 2, null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id"
    t.index ["active"], name: "index_employees_on_active_true", where: "(active = true)"
    t.index ["country"], name: "index_employees_on_country"
    t.index ["job_title"], name: "index_employees_on_job_title"
    t.index ["user_id"], name: "index_employees_on_user_id", unique: true, where: "(user_id IS NOT NULL)"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name", null: false
    t.string "jti", null: false
    t.string "last_name", null: false
    t.datetime "last_sign_in_at"
    t.integer "role", default: 1, null: false
    t.datetime "updated_at", null: false
    t.index "lower((email)::text)", name: "index_users_on_lower_email", unique: true
    t.index ["jti"], name: "index_users_on_jti", unique: true
  end

  add_foreign_key "employees", "users"
end
