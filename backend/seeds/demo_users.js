const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  console.log('🌱 Creating demo users...');
  
  // Hash password for demo user
  const salt = await bcrypt.genSalt(10);
  const demoPasswordHash = await bcrypt.hash('password123', salt);
  
  // Delete existing demo users first
  await knex('users').where('email', 'demo@example.com').del();
  
  // Insert demo user
  await knex('users').insert([
    {
      email: 'demo@example.com',
      username: 'demouser',
      password_hash: demoPasswordHash,
      wallet_address: '0x1234567890123456789012345678901234567890', // Demo wallet address
      role: 'content_creator',
      is_active: true,
      email_verified: true,
      profile_data: JSON.stringify({
        display_name: 'Demo User',
        bio: 'This is a demo account for testing the AI marketplace',
        demo_account: true
      }),
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  console.log('✅ Demo users created successfully');
  console.log('📝 Demo credentials:');
  console.log('   Email: demo@example.com');
  console.log('   Password: password123');
  console.log('   Wallet: 0x1234567890123456789012345678901234567890');
};