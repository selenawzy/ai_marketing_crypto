/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('agent_transactions', (table) => {
        table.increments('id').primary();
        table.integer('agent_id').unsigned().references('id').inTable('ai_agents').onDelete('CASCADE');
        table.string('transaction_hash').notNullable();
        table.string('transaction_id'); // CDP transaction ID if available
        table.string('from_address');
        table.string('to_address').notNullable();
        table.string('target_address').notNullable(); // Target contract address
        table.decimal('amount', 20, 8).defaultTo(0);
        table.string('currency').defaultTo('ETH');
        table.text('transaction_data'); // JSON string of transaction details
        table.string('status').defaultTo('pending'); // pending, completed, failed
        table.text('failure_reason');
        table.decimal('gas_used', 20, 0);
        table.decimal('gas_price', 20, 0);
        table.integer('block_number');
        table.string('network').defaultTo('base-sepolia');
        table.timestamps(true, true);

        // Indexes
        table.index(['agent_id']);
        table.index(['transaction_hash']);
        table.index(['status']);
        table.index(['network']);
        table.index(['created_at']);
        table.unique(['transaction_hash']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('agent_transactions');
};