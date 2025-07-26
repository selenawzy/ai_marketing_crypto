exports.up = function(knex) {
  return knex.schema.createTable('access_logs', (table) => {
    table.increments('id').primary();
    table.integer('content_id').unsigned().references('id').inTable('content').onDelete('CASCADE');
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.string('ai_agent_id'); // ID of the AI agent accessing content
    table.string('ip_address');
    table.string('user_agent');
    table.string('access_type').notNullable(); // 'free', 'paid', 'subscription'
    table.decimal('amount_paid', 10, 6).defaultTo(0); // Amount paid for access
    table.string('transaction_hash'); // Blockchain transaction hash
    table.jsonb('access_details').defaultTo('{}'); // Additional access details
    table.timestamp('accessed_at').defaultTo(knex.fn.now());
    
    // Indexes
    table.index('content_id');
    table.index('user_id');
    table.index('ai_agent_id');
    table.index('access_type');
    table.index('accessed_at');
    table.index('transaction_hash');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('access_logs');
}; 