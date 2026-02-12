#!/usr/bin/env node
// Creates the activity_log table in Supabase
// Run once: node scripts/setup-activity-log.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setup() {
  // Try inserting a test row — if table doesn't exist, we'll know
  const { error } = await supabase.from('activity_log').select('id').limit(1);
  
  if (error && error.code === 'PGRST205') {
    console.log('Table does not exist. Please create it in Supabase SQL editor:');
    console.log(`
CREATE TABLE activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  crew text NOT NULL,
  emoji text DEFAULT '🫧',
  action text NOT NULL,
  detail text,
  station text,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX idx_activity_log_created_at ON activity_log (created_at DESC);
CREATE INDEX idx_activity_log_crew ON activity_log (crew);

-- Enable RLS but allow service role full access
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON activity_log FOR ALL USING (true);
    `);
  } else if (!error) {
    console.log('✅ activity_log table already exists!');
  } else {
    console.log('Error:', error);
  }
}

setup();
