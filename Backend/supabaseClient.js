import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = "https://knmxugsodrxfpfpnykxp.supabase.co";
    const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubXh1Z3NvZHJ4ZnBmcG55a3hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MTM2MTYsImV4cCI6MjA3MTE4OTYxNn0.GwCoHC3zHstmkMBKe_JM8jNmN-j-pqpQEzUA3LnY66Q";

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);