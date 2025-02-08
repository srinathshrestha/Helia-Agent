import { createBrowserClient } from '@supabase/ssr';

// Cost per token in credits (1 credit per 10 tokens)
const CREDITS_PER_TOKEN = 0.1;

export async function updateCredits(userId, tokensUsed) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // Calculate credits to deduct - always deduct 1 credit per 10 tokens
  const creditsToDeduct = Math.max(1, Math.floor(tokensUsed * CREDITS_PER_TOKEN));

  // Get current credits
  const { data: userData, error: fetchError } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (fetchError) throw fetchError;

  const currentCredits = userData.credits;
  if (currentCredits < creditsToDeduct) {
    throw new Error('Insufficient credits');
  }

  // Ensure credits never go negative
  const newCredits = Math.max(0, currentCredits - creditsToDeduct);

  // Update credits
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits: newCredits })
    .eq('id', userId);

  if (updateError) throw updateError;

  return newCredits;
}

export async function getUserCredits(userId) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data, error } = await supabase
    .from('users')
    .select('credits')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data.credits;
}
