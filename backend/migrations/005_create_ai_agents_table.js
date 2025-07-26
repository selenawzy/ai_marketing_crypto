/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('ai_agents', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
        table.string('agent_name').notNullable();
        table.text('description');
        table.string('wallet_address').notNullable();
        table.text('capabilities'); // JSON string of agent capabilities
        table.string('cdp_agent_id'); // CDP AgentKit agent ID
        table.string('network').defaultTo('base-sepolia'); // base-sepolia or base-mainnet
        table.boolean('is_active').defaultTo(true);
        table.boolean('is_deployed').defaultTo(false);
        table.string('deployment_status').defaultTo('pending'); // pending, active, failed
        table.text('deployment_config'); // JSON string of deployment configuration
        table.decimal('balance', 20, 6).defaultTo(0); // Agent wallet balance
        table.integer('total_transactions').defaultTo(0);
        table.decimal('total_volume', 20, 6).defaultTo(0);
        table.timestamp('deployed_at');
        table.timestamps(true, true);

        // Indexes
        table.index(['user_id']);
        table.index(['wallet_address']);
        table.index(['cdp_agent_id']);
        table.index(['network']);
        table.index(['is_active']);
        table.index(['is_deployed']);
        table.unique(['wallet_address']);
        table.unique(['agent_name']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('ai_agents');
}; 