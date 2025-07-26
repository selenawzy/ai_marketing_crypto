exports.up = function(knex) {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.string('transaction_hash').unique().notNullable();
    table.integer('from_user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.integer('to_user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.integer('content_id').unsigned().references('id').inTable('content').onDelete('SET NULL');
    table.decimal('amount', 20, 6).notNullable(); // Amount in ETH
    table.string('currency').defaultTo('ETH');
    table.string('status').notNullable(); // 'pending', 'confirmed', 'failed'
    table.string('block_number');
    table.string('gas_used');
    table.string('gas_price');
    table.jsonb('transaction_data').defaultTo('{}'); // Raw transaction data
    table.timestamp('confirmed_at');
    table.timestamps(true, true);
    
    // Indexes
    table.index('transaction_hash');
    table.index('from_user_id');
    table.index('to_user_id');
    table.index('content_id');
    table.index('status');
    table.index('confirmed_at');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('transactions');
}; 