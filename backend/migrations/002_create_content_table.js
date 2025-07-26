exports.up = function(knex) {
  return knex.schema.createTable('content', (table) => {
    table.increments('id').primary();
    table.integer('creator_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.string('url').notNullable();
    table.string('content_type').notNullable(); // 'article', 'video', 'image', 'data'
    table.decimal('price_per_access', 10, 6).notNullable().defaultTo(0); // Price in ETH
    table.boolean('is_active').defaultTo(true);
    table.boolean('requires_payment').defaultTo(false);
    table.jsonb('metadata').defaultTo('{}'); // Content metadata, tags, categories
    table.jsonb('access_rules').defaultTo('{}'); // Who can access, restrictions
    table.integer('total_views').defaultTo(0);
    table.integer('paid_views').defaultTo(0);
    table.decimal('total_revenue', 20, 6).defaultTo(0); // Total revenue in ETH
    table.timestamps(true, true);
    
    // Indexes
    table.index('creator_id');
    table.index('content_type');
    table.index('is_active');
    table.index('requires_payment');
    table.index('price_per_access');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('content');
}; 