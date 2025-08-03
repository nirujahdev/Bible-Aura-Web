import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 COMPREHENSIVE APPLICATION TEST');
console.log('=====================================\n');

// Test 1: Environment Variables
console.log('1️⃣ Testing Environment Variables...');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  console.log('   Please create .env.local file with:');
  console.log('   VITE_SUPABASE_URL=your-supabase-url');
  console.log('   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key');
  
  // Check if env.local.template exists
  if (fs.existsSync('env.local.template')) {
    console.log('💡 Found env.local.template - copy this to .env.local and fill in your values');
  }
  process.exit(1);
} else {
  console.log('✅ Environment variables found');
}

// Test 2: Database Connection
console.log('\n2️⃣ Testing Database Connection...');
const supabase = createClient(supabaseUrl, supabaseKey);

try {
  const { data, error } = await supabase.auth.getSession();
  if (error && !error.message.includes('session')) {
    console.log('❌ Database connection failed:', error.message);
  } else {
    console.log('✅ Database connection successful');
  }
} catch (err) {
  console.log('❌ Database connection error:', err.message);
}

// Test 3: Essential Tables
console.log('\n3️⃣ Testing Database Tables...');

const testTables = [
  { name: 'journal_entries', requiredColumns: ['id', 'user_id', 'title', 'content', 'language', 'category'] },
  { name: 'sermons', requiredColumns: ['id', 'user_id', 'title', 'content', 'scripture_references', 'status'] },
  { name: 'reading_plans', requiredColumns: ['id', 'name', 'description', 'total_days'] },
  { name: 'reading_progress', requiredColumns: ['id', 'user_id', 'plan_id', 'day_number'] }
];

for (const table of testTables) {
  try {
    const { data, error } = await supabase
      .from(table.name)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ ${table.name}: ${error.message}`);
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log(`   💡 Run MANUAL_DATABASE_FIX.sql to create ${table.name} table`);
      }
    } else {
      console.log(`✅ ${table.name}: Table accessible`);
      
      // Check columns if data exists
      if (data && data.length > 0) {
        const existingColumns = Object.keys(data[0]);
        const missingColumns = table.requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length > 0) {
          console.log(`   ⚠️  Missing columns: ${missingColumns.join(', ')}`);
        } else {
          console.log(`   ✅ All required columns present`);
        }
      }
    }
  } catch (err) {
    console.log(`❌ ${table.name}: Test failed -`, err.message);
  }
}

// Test 4: Critical Files
console.log('\n4️⃣ Testing Critical Files...');

const criticalFiles = [
  'src/App.tsx',
  'src/pages/EnhancedBible.tsx',
  'src/components/EnhancedReadingPlans.tsx',
  'src/components/CalendarChapterSelector.tsx',
  'src/components/EnhancedBibleSidebar.tsx',
  'src/components/QuickAIChatWidget.tsx',
  'src/lib/bible-api.ts',
  'MANUAL_DATABASE_FIX.sql'
];

for (const file of criticalFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: Found`);
  } else {
    console.log(`❌ ${file}: Missing`);
  }
}

// Test 5: Import Validations
console.log('\n5️⃣ Testing Import Statements...');

// Check for common import issues
const enhancedBibleContent = fs.readFileSync('src/pages/EnhancedBible.tsx', 'utf8');

if (enhancedBibleContent.includes('import EnhancedReadingPlans from')) {
  console.log('✅ EnhancedReadingPlans: Using default import');
} else if (enhancedBibleContent.includes('import { EnhancedReadingPlans }')) {
  console.log('❌ EnhancedReadingPlans: Using named import (should be default)');
} else {
  console.log('⚠️  EnhancedReadingPlans: Import not found');
}

if (enhancedBibleContent.includes('import { bibleApi }')) {
  console.log('✅ bibleApi: Import found');
} else {
  console.log('❌ bibleApi: Import missing');
}

// Test 6: Component Exports
console.log('\n6️⃣ Testing Component Exports...');

const componentFiles = [
  'src/components/EnhancedReadingPlans.tsx',
  'src/components/CalendarChapterSelector.tsx',
  'src/components/EnhancedBibleSidebar.tsx'
];

for (const file of componentFiles) {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('export default')) {
      console.log(`✅ ${path.basename(file)}: Has default export`);
    } else {
      console.log(`❌ ${path.basename(file)}: Missing default export`);
    }
  }
}

console.log('\n🎯 TEST SUMMARY');
console.log('================');

if (!supabaseUrl || !supabaseKey) {
  console.log('🚨 CRITICAL: Set up environment variables first');
  console.log('📋 Next Steps:');
  console.log('   1. Copy env.local.template to .env.local');
  console.log('   2. Fill in your Supabase credentials');
  console.log('   3. Run this test again');
} else {
  console.log('✅ Environment: Ready');
  console.log('🔄 Database: Run MANUAL_DATABASE_FIX.sql if you see table errors above');
  console.log('🚀 Application: Should be working now');
  console.log('\n💡 Test your app:');
  console.log('   • Run: npm run dev');
  console.log('   • Visit: http://localhost:8080');
  console.log('   • Check: /bible page for new interface');
} 