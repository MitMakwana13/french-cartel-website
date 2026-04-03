import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/admin';

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${requestUrl.origin}${next}`);
    }
  }

  // Return the user to an error page or login with some error
  return NextResponse.redirect(`${requestUrl.origin}/admin/login?error=auth-failed`);
}
