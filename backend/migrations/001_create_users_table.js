exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('username').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('wallet_address').unique();
    table.enum('role', ['user', 'content_creator', 'ai_agent', 'admin']).defaultTo('user');
    table.boolean('is_active').defaultTo(true);
    table.boolean('email_verified').defaultTo(false);
    table.string('verification_token');
    table.string('reset_password_token');
    table.timestamp('reset_password_expires');
    table.jsonb('profile_data').defaultTo('{}');
    table.timestamps(true, true);
    
    // Indexes
    table.index('email');
    table.index('username');
    table.index('wallet_address');
    table.index('role');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
}; 