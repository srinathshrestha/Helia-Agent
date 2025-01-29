import { createBrowserClient } from '@supabase/ssr';

// Cost per token in credits
const CREDITS_PER_TOKEN = 0.1;

export async function updateCredits(userId, tokensUsed) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const creditsToDeduct = Math.ceil(tokensUsed * CREDITS_PER_TOKEN);

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

  // Update credits
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits: currentCredits - creditsToDeduct })
    .eq('id', userId);

  if (updateError) throw updateError;

  return currentCredits - creditsToDeduct;
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
