import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://qdxmqwmpizlzbaehfjhd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkeG1xd21waXpsemJhZWhmamhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1MzY1NDUsImV4cCI6MjA1NDExMjU0NX0.YXz6kGGuSMQmpXhzU_boJSawjNQPzo9FCF2hbwNYStY";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
