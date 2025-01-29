import { supabase } from './supabase';

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserCredits(userId, credits) {
  const { data, error } = await supabase
    .from('users')
    .update({ credits })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createChat(userId, botName, message, response) {
  const { data, error } = await supabase
    .from('chats')
    .insert([
      {
        user_id: userId,
        bot_name: botName,
        message,
        response,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserChats(userId) {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUserSubscription(userId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
  return data;
}

export async function createSubscription(userId, plan) {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([
      {
        user_id: userId,
        status: 'active',
        plan,
        amount: 30,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSubscription(subscriptionId) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', subscriptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
