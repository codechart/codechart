import { createClient } from '@supabase/supabase-js';

// RLS is disabled on tables
const supabaseUrl = 'https://kjidcpgbzvltexmxowkv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqaWRjcGdienZsdGV4bXhvd2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzM0NTYsImV4cCI6MjA1MjYwOTQ1Nn0.1r21Rb2eIJOo-9Kw5MqDWLN089Jndw6yH7NgkHMPcFc';

export const supabase = createClient(supabaseUrl, supabaseKey);