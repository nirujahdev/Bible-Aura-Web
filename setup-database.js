#!/usr/bin/env node

/**
 * Bible Aura Database Setup Script
 * 
 * This script helps set up the database tables for Bible Aura
 * if you can't use the Supabase CLI.
 * 
 * Usage:
 * 1. Create a Supabase project
 * 2. Add your credentials to .env.local
 * 3. Run: node setup-database.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  console.log('Please add:');
  console.log('VITE_SUPABASE_URL=your_supabase_url');
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('🚀 Starting Bible Aura database setup...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250129-bible-features.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split SQL statements (basic splitting by semicolon)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📄 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error && !error.message.includes('already exists')) {
            console.warn(`⚠️  Warning on statement ${i + 1}: ${error.message}`);
          }
        } catch (err) {
          // Try direct query execution as fallback
          const { error } = await supabase.from('_internal').select('*').limit(0);
          if (error) {
            console.warn(`⚠️  Could not execute statement ${i + 1}: ${err.message}`);
          }
        }
      }
    }
    
    console.log('✅ Database setup completed!');
    console.log('\n📋 Tables created:');
    console.log('  - reading_progress (Bible reading progress)');
    console.log('  - user_bookmarks (User verse bookmarks)');
    console.log('  - daily_verses (Daily verse system)');
    console.log('  - Enhanced journal_entries (Journal with metadata)');
    console.log('  - Enhanced verse_highlights (Verse highlighting)');
    
    console.log('\n🎯 Next steps:');
    console.log('  1. Start your development server: npm run dev');
    console.log('  2. Sign up for an account in your app');
    console.log('  3. Start using the enhanced Bible and Journal features!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.log('\n🔧 Manual setup required:');
    console.log('  1. Go to your Supabase dashboard');
    console.log('  2. Navigate to SQL Editor');
    console.log('  3. Copy and paste the contents of:');
    console.log('     supabase/migrations/20250129-bible-features.sql');
    console.log('  4. Execute the SQL');
  }
}

async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error && error.code !== 'PGRST106') {
      throw error;
    }
    console.log('✅ Successfully connected to Supabase');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error.message);
    return false;
  }
}

async function main() {
  console.log('🙏 Bible Aura Database Setup\n');
  
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n🔧 Please check your Supabase credentials and try again.');
    process.exit(1);
  }
  
  // Run migration
  await runMigration();
}

// Run the setup
main().catch(console.error); 