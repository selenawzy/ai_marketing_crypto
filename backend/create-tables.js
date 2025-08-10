const { db } = require('./src/config/database');

async function createTables() {
  try {
    // Create agent_campaigns table
    const campaignsExists = await db.schema.hasTable('agent_campaigns');
    if (!campaignsExists) {
      await db.schema.createTable('agent_campaigns', table => {
        table.increments('id').primary();
        table.integer('agent_id').unsigned().references('id').inTable('ai_agents');
        table.string('client_address');
        table.string('campaign_type');
        table.decimal('budget', 18, 8);
        table.decimal('spent', 18, 8).defaultTo(0);
        table.integer('performance').defaultTo(0);
        table.string('strategy');
        table.string('status').defaultTo('pending');
        table.string('transaction_hash');
        table.string('execution_tx');
        table.timestamps(true, true);
      });
      console.log('✅ agent_campaigns table created');
    }
    
    console.log('✅ Database tables ready');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

createTables();