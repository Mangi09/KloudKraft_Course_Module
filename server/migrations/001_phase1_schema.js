exports.up = async function (knex) {
  await knex.schema.createTable("cohorts", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable().unique();
    table.text("description");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("username").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.enum("role", ["ADMIN", "TRAINER", "CANDIDATE"]).notNullable();
    table.integer("cohort_id").unsigned().nullable();
    table.foreign("cohort_id").references("cohorts.id").onDelete("SET NULL");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("courses", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.text("description");
    table.string("thumbnail_url");
    table.string("category");
    table
      .enum("status", ["DRAFT", "PUBLISHED", "ARCHIVED"])
      .notNullable()
      .defaultTo("DRAFT");
    table.boolean("is_sequential").notNullable().defaultTo(false);
    table.integer("assigned_cohort_id").unsigned().nullable();
    table.integer("assigned_trainer_id").unsigned().nullable();
    table
      .foreign("assigned_cohort_id")
      .references("cohorts.id")
      .onDelete("SET NULL");
    table
      .foreign("assigned_trainer_id")
      .references("users.id")
      .onDelete("SET NULL");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("sections", (table) => {
    table.increments("id").primary();
    table.integer("course_id").unsigned().notNullable();
    table.string("title").notNullable();
    table.text("description");
    table.integer("sort_order").notNullable().defaultTo(1);
    table.boolean("is_sequential").nullable();
    table.foreign("course_id").references("courses.id").onDelete("CASCADE");
    table.timestamps(true, true);
  });

  await knex.schema.createTable("lessons", (table) => {
    table.increments("id").primary();
    table.integer("section_id").unsigned().notNullable();
    table.string("title").notNullable();
    table
      .enum("content_type", ["VIDEO", "TEXT", "DOCUMENT", "ASSESSMENT"])
      .notNullable();
    table.string("content_url");
    table.text("content_body", "longtext");
    table.integer("duration_minutes").notNullable().defaultTo(0);
    table.integer("sort_order").notNullable().defaultTo(1);
    table.boolean("is_mandatory").notNullable().defaultTo(true);
    table.foreign("section_id").references("sections.id").onDelete("CASCADE");
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("lessons");
  await knex.schema.dropTableIfExists("sections");
  await knex.schema.dropTableIfExists("courses");
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("cohorts");
};
