import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://eleywszucoclmnmhlazi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZXl3c3p1Y29jbG1ubWhsYXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NDA1NTAsImV4cCI6MjA5MDExNjU1MH0.fGS9blm2Emck9gbve-vapQ6DOBCngBsghf-7bPT9foQ'
);
