const { db } = require('./src/config/database');

async function checkUsers() {
  try {
    console.log('🔍 Checking users table...\n');
    
    // Check users table - showing only safe, non-sensitive information
    const users = await db('users').select('id', 'email', 'username', 'role', 'is_active', 'email_verified', 'created_at');
    console.log('👥 Users found:', users.length);
    
    if (users.length === 0) {
      console.log('   No users found');
    } else {
      users.forEach(user => {
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.is_active ? 'Yes' : 'No'}`);
        console.log(`   Email Verified: ${user.email_verified ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('   ---');
      });
    }
    
    console.log('\n✅ Users check complete!');
    
  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    await db.destroy();
  }
}

checkUsers(); 