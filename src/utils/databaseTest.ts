import { supabase } from '@/integrations/supabase/client';

interface DatabaseTestResult {
  table: string;
  exists: boolean;
  columns: string[];
  missingColumns: string[];
  error?: string;
}

interface TestResults {
  journalEntries: DatabaseTestResult;
  sermons: DatabaseTestResult;
  overall: {
    success: boolean;
    issues: string[];
    recommendations: string[];
  };
}

export class DatabaseTester {
  // Expected columns for journal_entries
  private static readonly JOURNAL_REQUIRED_COLUMNS = [
    'id', 'user_id', 'title', 'content', 'mood', 'spiritual_state',
    'verse_reference', 'verse_text', 'verse_references', 'tags',
    'is_private', 'entry_date', 'word_count', 'reading_time',
    'language', 'category', 'is_pinned', 'template_used', 'metadata',
    'created_at', 'updated_at'
  ];

  // Expected columns for sermons
  private static readonly SERMONS_REQUIRED_COLUMNS = [
    'id', 'user_id', 'title', 'content', 'scripture_reference',
    'scripture_references', 'main_points', 'congregation', 'sermon_date',
    'duration', 'notes', 'tags', 'is_draft', 'status', 'word_count',
    'estimated_time', 'estimated_duration', 'language', 'category',
    'outline', 'illustrations', 'applications', 'private_notes',
    'series_name', 'template_type', 'ai_generated', 'created_at', 'updated_at'
  ];

  static async testJournalEntriesTable(): Promise<DatabaseTestResult> {
    try {
      // Test table existence and basic query
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .limit(1);

      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          return {
            table: 'journal_entries',
            exists: false,
            columns: [],
            missingColumns: this.JOURNAL_REQUIRED_COLUMNS,
            error: 'Table does not exist'
          };
        }

        // If it's a column error, try to get what columns exist
        const columnResult = await this.getTableColumns('journal_entries');
        const existingColumns = columnResult.columns;
        const missingColumns = this.JOURNAL_REQUIRED_COLUMNS.filter(
          col => !existingColumns.includes(col)
        );

        return {
          table: 'journal_entries',
          exists: true,
          columns: existingColumns,
          missingColumns,
          error: error.message
        };
      }

      // Test successful - get all columns
      const columnResult = await this.getTableColumns('journal_entries');
      const missingColumns = this.JOURNAL_REQUIRED_COLUMNS.filter(
        col => !columnResult.columns.includes(col)
      );

      return {
        table: 'journal_entries',
        exists: true,
        columns: columnResult.columns,
        missingColumns,
        error: columnResult.error
      };
    } catch (error: any) {
      return {
        table: 'journal_entries',
        exists: false,
        columns: [],
        missingColumns: this.JOURNAL_REQUIRED_COLUMNS,
        error: error.message
      };
    }
  }

  static async testSermonsTable(): Promise<DatabaseTestResult> {
    try {
      // Test table existence and basic query
      const { data, error } = await supabase
        .from('sermons')
        .select('*')
        .limit(1);

      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          return {
            table: 'sermons',
            exists: false,
            columns: [],
            missingColumns: this.SERMONS_REQUIRED_COLUMNS,
            error: 'Table does not exist'
          };
        }

        // If it's a column error, try to get what columns exist
        const columnResult = await this.getTableColumns('sermons');
        const existingColumns = columnResult.columns;
        const missingColumns = this.SERMONS_REQUIRED_COLUMNS.filter(
          col => !existingColumns.includes(col)
        );

        return {
          table: 'sermons',
          exists: true,
          columns: existingColumns,
          missingColumns,
          error: error.message
        };
      }

      // Test successful - get all columns
      const columnResult = await this.getTableColumns('sermons');
      const missingColumns = this.SERMONS_REQUIRED_COLUMNS.filter(
        col => !columnResult.columns.includes(col)
      );

      return {
        table: 'sermons',
        exists: true,
        columns: columnResult.columns,
        missingColumns,
        error: columnResult.error
      };
    } catch (error: any) {
      return {
        table: 'sermons',
        exists: false,
        columns: [],
        missingColumns: this.SERMONS_REQUIRED_COLUMNS,
        error: error.message
      };
    }
  }

  private static async getTableColumns(tableName: string): Promise<{ columns: string[], error?: string }> {
    try {
      // Query information schema to get column names
      const { data, error } = await supabase.rpc('get_table_columns', { table_name: tableName });
      
      if (error) {
        // Fallback method - try a select with limit 0 to get column info
        try {
          const { data: testData, error: testError } = await supabase
            .from(tableName)
            .select('*')
            .limit(0);
          
          if (testError) {
            return { columns: [], error: testError.message };
          }
          
          // Extract column names from the result structure
          return { columns: Object.keys(testData?.[0] || {}) };
        } catch {
          return { columns: [], error: 'Unable to determine table structure' };
        }
      }

      return { columns: data || [] };
    } catch (error: any) {
      return { columns: [], error: error.message };
    }
  }

  static async runFullDatabaseTest(): Promise<TestResults> {
    const journalTest = await this.testJournalEntriesTable();
    const sermonsTest = await this.testSermonsTable();

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze journal_entries issues
    if (!journalTest.exists) {
      issues.push('journal_entries table does not exist');
      recommendations.push('Run database migration to create journal_entries table');
    } else if (journalTest.missingColumns.length > 0) {
      issues.push(`journal_entries missing columns: ${journalTest.missingColumns.join(', ')}`);
      recommendations.push('Run database migration to add missing journal_entries columns');
    }

    // Analyze sermons issues
    if (!sermonsTest.exists) {
      issues.push('sermons table does not exist');
      recommendations.push('Run database migration to create sermons table');
    } else if (sermonsTest.missingColumns.length > 0) {
      issues.push(`sermons missing columns: ${sermonsTest.missingColumns.join(', ')}`);
      recommendations.push('Run database migration to add missing sermons columns');
    }

    // Check for permission issues
    if (journalTest.error?.includes('permission') || sermonsTest.error?.includes('permission')) {
      issues.push('Database permission issues detected');
      recommendations.push('Sign out and sign back in to refresh authentication');
    }

    const success = issues.length === 0;

    return {
      journalEntries: journalTest,
      sermons: sermonsTest,
      overall: {
        success,
        issues,
        recommendations
      }
    };
  }

  static generateFixScript(testResults: TestResults): string {
    const scripts: string[] = [];

    if (!testResults.journalEntries.exists) {
      scripts.push('-- Create journal_entries table migration needed');
    } else if (testResults.journalEntries.missingColumns.length > 0) {
      scripts.push('-- Add missing journal_entries columns:');
      testResults.journalEntries.missingColumns.forEach(col => {
        scripts.push(`-- ALTER TABLE journal_entries ADD COLUMN ${col} ...;`);
      });
    }

    if (!testResults.sermons.exists) {
      scripts.push('-- Create sermons table migration needed');
    } else if (testResults.sermons.missingColumns.length > 0) {
      scripts.push('-- Add missing sermons columns:');
      testResults.sermons.missingColumns.forEach(col => {
        scripts.push(`-- ALTER TABLE sermons ADD COLUMN ${col} ...;`);
      });
    }

    if (scripts.length === 0) {
      return '-- No database fixes needed';
    }

    return scripts.join('\n');
  }
}

// Development helper function
export async function logDatabaseStatus() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const results = await DatabaseTester.runFullDatabaseTest();
      console.group('🔍 Database Schema Test Results');
      console.log('Journal Entries Table:', results.journalEntries);
      console.log('Sermons Table:', results.sermons);
      console.log('Overall Status:', results.overall);
      
      if (!results.overall.success) {
        console.warn('⚠️ Database Issues Found:');
        results.overall.issues.forEach(issue => console.warn(`  - ${issue}`));
        console.log('💡 Recommendations:');
        results.overall.recommendations.forEach(rec => console.log(`  - ${rec}`));
        console.log('🛠️ Fix Script:');
        console.log(DatabaseTester.generateFixScript(results));
      } else {
        console.log('✅ Database schema is healthy');
      }
      console.groupEnd();
    } catch (error) {
      console.error('Failed to run database test:', error);
    }
  }
} 