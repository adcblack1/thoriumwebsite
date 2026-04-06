import { createClient } from '@supabase/supabase-js';
import { NextResponse, NextRequest } from 'next/server';

const supabase = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

// GET /api/subscribers/export?newsletter=the-catalyst
// Returns a CSV of subscribers for a specific child newsletter.
// Valid newsletters: the-catalyst, the-lab, the-operator
// Add ?format=json for JSON output instead.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const newsletter = searchParams.get('newsletter');
  const format = searchParams.get('format') || 'csv';

  // Auth check — simple secret key
  const authKey = searchParams.get('key');
  if (authKey !== process.env.EXPORT_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const validNewsletters = ['the-catalyst', 'the-lab', 'the-operator'];

  if (newsletter && !validNewsletters.includes(newsletter)) {
    return NextResponse.json(
      { error: `Invalid newsletter. Valid: ${validNewsletters.join(', ')}` },
      { status: 400 }
    );
  }

  // Query subscribers
  let query = supabase()
    .from('subscribers')
    .select('email, first_name, main_goal, seniority, job_function, industry, company_size, ai_tools, child_newsletters, created_at')
    .order('created_at', { ascending: false });

  // If specific newsletter requested, filter
  if (newsletter) {
    query = query.contains('child_newsletters', [newsletter]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }

  if (format === 'json') {
    return NextResponse.json({ newsletter: newsletter || 'all', count: data?.length || 0, subscribers: data });
  }

  // Build CSV
  const headers = ['email', 'first_name', 'main_goal', 'seniority', 'job_function', 'industry', 'company_size', 'ai_tools', 'child_newsletters', 'created_at'];
  const csvRows = [headers.join(',')];

  for (const row of (data || [])) {
    const values = headers.map(h => {
      const val = (row as Record<string, unknown>)[h];
      if (val === null || val === undefined) return '';
      if (Array.isArray(val)) return `"${val.join('; ')}"`;
      const str = String(val);
      // Escape quotes in CSV
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    });
    csvRows.push(values.join(','));
  }

  const csv = csvRows.join('\n');
  const filename = newsletter ? `${newsletter}-subscribers.csv` : 'all-subscribers.csv';

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
