const { db } = require('./src/config/database');

async function addColumns() {
  try {
    // Check if column exists
    const columns = await db('ai_agents').columnInfo();
    
    if (!columns.smart_contract_address) {
      await db.schema.alterTable('ai_agents', table => {
        table.string('smart_contract_address');
      });
      console.log('✅ Added smart_contract_address column');
    } else {
      console.log('✅ smart_contract_address column already exists');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to add column:', error);
    process.exit(1);
  }
}

addColumns();