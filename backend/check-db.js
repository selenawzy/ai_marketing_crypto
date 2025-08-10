const { db } = require('./src/config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n');
    
    // Check users table
    const users = await db('users').select('id', 'email', 'username', 'role', 'is_active', 'email_verified', 'created_at');
    console.log('👥 Users table:');
    if (users.length === 0) {
      console.log('   No users found');
    } else {
      users.forEach(user => {
        console.log(`   ID: ${user.id}, Email: ${user.email}, Username: ${user.username}, Role: ${user.role}, Active: ${user.is_active}, Verified: ${user.email_verified}`);
      });
    }
    
    // Check content table
    const content = await db('content').select('id', 'title', 'creator_id', 'price', 'created_at');
    console.log('\n📄 Content table:');
    if (content.length === 0) {
      console.log('   No content found');
    } else {
      content.forEach(item => {
        console.log(`   ID: ${item.id}, Title: ${item.title}, Creator ID: ${item.creator_id}, Price: ${item.price}`);
      });
    }
    
    // Check AI agents table
    const agents = await db('ai_agents').select('id', 'agent_name', 'user_id', 'network', 'is_deployed', 'created_at');
    console.log('\n🤖 AI Agents table:');
    if (agents.length === 0) {
      console.log('   No AI agents found');
    } else {
      agents.forEach(agent => {
        console.log(`   ID: ${agent.id}, Name: ${agent.agent_name}, User ID: ${agent.user_id}, Network: ${agent.network}, Deployed: ${agent.is_deployed}`);
      });
    }
    
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  } finally {
    await db.destroy();
  }
}

checkDatabase(); 