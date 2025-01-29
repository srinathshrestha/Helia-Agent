import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('Supabase error:', tablesError);
      return NextResponse.json(
        { 
          error: tablesError.message,
          hint: 'Tables not found. Please run the SQL migration script.'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Database tables created successfully',
      tables: ['users', 'chats', 'subscriptions']
    }, { status: 200 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Supabase' },
      { status: 500 }
    );
  }
}
