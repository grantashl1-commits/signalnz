import { corsHeaders } from '@supabase/supabase-js/cors'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate it looks like a calendar URL
    if (!url.startsWith('http') && !url.startsWith('webcal')) {
      return new Response(JSON.stringify({ error: 'Invalid calendar URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fetchUrl = url.replace(/^webcal:\/\//, 'https://');
    const response = await fetch(fetchUrl, {
      headers: { 'Accept': 'text/calendar' },
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch calendar: ${response.status}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const icsText = await response.text();
    const events = parseICS(icsText);

    return new Response(JSON.stringify({ events }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface CalendarEvent {
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

function parseICS(icsText: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const lines = icsText.replace(/\r\n /g, '').split(/\r?\n/);

  let inEvent = false;
  let current: Partial<CalendarEvent> = {};

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      current = {};
    } else if (line === 'END:VEVENT') {
      inEvent = false;
      if (current.summary && current.start) {
        events.push(current as CalendarEvent);
      }
    } else if (inEvent) {
      const [key, ...rest] = line.split(':');
      const value = rest.join(':');
      const baseKey = key.split(';')[0];

      switch (baseKey) {
        case 'SUMMARY':
          current.summary = value;
          break;
        case 'DTSTART':
          current.start = parseICSDate(value);
          break;
        case 'DTEND':
          current.end = parseICSDate(value);
          break;
        case 'LOCATION':
          current.location = value;
          break;
        case 'DESCRIPTION':
          current.description = value?.substring(0, 200);
          break;
      }
    }
  }

  return events;
}

function parseICSDate(value: string): string {
  // Handle formats like 20260415T090000Z or 20260415
  if (!value) return '';
  const clean = value.replace(/[TZ]/g, (m) => m === 'T' ? 'T' : '');
  if (clean.length >= 15) {
    const y = clean.slice(0, 4);
    const m = clean.slice(4, 6);
    const d = clean.slice(6, 8);
    const h = clean.slice(9, 11);
    const min = clean.slice(11, 13);
    return `${y}-${m}-${d}T${h}:${min}:00Z`;
  }
  if (clean.length >= 8) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T00:00:00Z`;
  }
  return value;
}
