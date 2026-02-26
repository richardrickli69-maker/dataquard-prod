/**
 * Supabase Client for Next.js
 * Handles authentication and database operations
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Supabase Client (for client-side)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get Current User
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign Up with Email
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign In with Email
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Sign Out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Save Scan to Database
 */
export async function saveScan(
  url: string,
  domain: string,
  jurisdiction: string,
  ampel: string,
  confidence: number,
  reasons: string[]
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.from('scans').insert([
    {
      user_id: user.id,
      url,
      domain,
      jurisdiction,
      ampel,
      confidence,
      reasons,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get User Scans
 */
export async function getUserScans() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Save Policy to Database
 */
export async function savePolicy(
  scanId: string,
  jurisdiction: string,
  content: string,
  format: string = 'pdf'
) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase.from('policies').insert([
    {
      user_id: user.id,
      scan_id: scanId,
      jurisdiction,
      content,
      format,
    },
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Get User Policies
 */
export async function getUserPolicies() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('policies')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Listen to Auth State Changes
 */
export function onAuthStateChange(
  callback: (user: any | null) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return subscription;
}