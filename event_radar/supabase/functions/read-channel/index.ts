import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'apikey, content-type, x-client-info',
};

type Message = {
  id: string;
  text?: string | null;
  sender_id?: string;
  user_id?: string;
  sender_type?: string;
  system?: boolean;
  name?: string;
  created_at?: number;
};

type Cursor = {
  source: string;
  last_id: string;
  read_count: number;
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function secretKey(): string {
  const keys = Deno.env.get('SUPABASE_SECRET_KEYS');
  if (keys) {
    try {
      const value = JSON.parse(keys).default;
      if (typeof value === 'string' && value) return value;
    } catch (_) { /* use the compatibility fallback */ }
  }
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
}

function publishableKey(): string {
  const keys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS');
  if (keys) {
    try {
      const value = JSON.parse(keys).default;
      if (typeof value === 'string' && value) return value;
    } catch (_) { /* use the single-key fallback */ }
  }
  return Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || '';
}

const token = (Deno.env.get('GROUPME_TOKEN') || '').trim();
const groupId = (Deno.env.get('GROUPME_GROUP_ID') || '').trim();
const botId = (Deno.env.get('GROUPME_BOT_ID') || '').trim();
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const databaseKey = secretKey();
const apiKey = publishableKey();
const ready = Boolean(token && groupId && supabaseUrl && databaseKey && apiKey);
const db = ready
  ? createClient(supabaseUrl, databaseKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

function groupUrl(path: string, params?: Record<string, string>): string {
  const url = new URL('https://api.groupme.com/v3/' + path);
  for (const [name, value] of Object.entries(params || {})) url.searchParams.set(name, value);
  return url.toString();
}

async function groupmeGet(path: string, params?: Record<string, string>): Promise<{ status: number; response: unknown }> {
  const result = await fetch(groupUrl(path, params), {
    headers: { 'X-Access-Token': token },
  });
  if (result.status === 304) return { status: 304, response: null };
  if (!result.ok) throw new Error('GroupMe request failed (' + result.status + ').');
  const body = await result.json();
  return { status: result.status, response: body.response };
}

async function messages(params: Record<string, string>): Promise<Message[]> {
  const result = await groupmeGet('groups/' + encodeURIComponent(groupId) + '/messages', params);
  if (result.status === 304) return [];
  const data = result.response as { messages?: Message[] } | null;
  if (!data || !Array.isArray(data.messages)) throw new Error('GroupMe returned no message list.');
  return data.messages;
}

async function previousMessages(message: Message): Promise<string[]> {
  const sender = message.sender_id || message.user_id;
  if (!sender || !message.created_at) return [];
  const cutoff = message.created_at - 10 * 60;
  const found: Message[] = [];
  let before = message.id;
  for (let page = 0; page < 5 && found.length < 4; page++) {
    const batch = await messages({ before_id: before, limit: '100' });
    if (!batch.length) break;
    for (const item of batch) {
      if ((item.created_at || 0) < cutoff) break;
      if ((item.sender_id || item.user_id) === sender && typeof item.text === 'string' && item.text.trim()) {
        found.push(item);
        if (found.length === 4) break;
      }
    }
    if (found.length === 4 || batch.length < 100 || (batch[batch.length - 1].created_at || 0) < cutoff) break;
    before = batch[batch.length - 1].id;
  }
  return found.reverse().map((item) => (item.text || '').trim().slice(0, 500));
}

async function cursor(): Promise<Cursor | null> {
  const { data, error } = await db!.from('channel_cursor')
    .select('source,last_id,read_count').eq('source', 'groupme').maybeSingle();
  if (error) throw new Error('Could not read the chat bookmark.');
  return data as Cursor | null;
}

async function advance(current: Cursor, messageId: string): Promise<Cursor | null> {
  const next = { last_id: messageId, read_count: current.read_count + 1, updated_at: new Date().toISOString() };
  const { data, error } = await db!.from('channel_cursor')
    .update(next).eq('source', 'groupme').eq('last_id', current.last_id)
    .select('source,last_id,read_count').maybeSingle();
  if (error) throw new Error('Could not move the chat bookmark.');
  return data as Cursor | null;
}

async function checkGroupMe(): Promise<Response> {
  if (!ready) return json({ ok: true, ready: false, token: Boolean(token), group: Boolean(groupId), bot: Boolean(botId) });
  try {
    await groupmeGet('users/me');
  } catch (error) {
    return json({ ok: false, ready: false, token: false, group: false, bot: false,
      message: error instanceof Error ? error.message : 'GroupMe token check failed.' }, 503);
  }
  try {
    await groupmeGet('groups/' + encodeURIComponent(groupId));
  } catch (error) {
    return json({ ok: false, ready: false, token: true, group: false, bot: false,
      message: error instanceof Error ? error.message : 'GroupMe group check failed.' }, 503);
  }
  if (!botId) return json({ ok: true, ready: true, token: true, group: true, bot: false });
  try {
    const result = await groupmeGet('bots');
    const bots = Array.isArray(result.response) ? result.response as Array<{ bot_id?: string; group_id?: string }> : [];
    const bot = bots.some((item) => item.bot_id === botId && String(item.group_id) === groupId);
    return json({ ok: bot, ready: bot, token: true, group: true, bot,
      ...(bot ? {} : { message: 'The saved bot is not in this group.' }) }, bot ? 200 : 503);
  } catch (error) {
    return json({ ok: false, ready: false, token: true, group: true, bot: false,
      message: error instanceof Error ? error.message : 'GroupMe bot check failed.' }, 503);
  }
}

async function postDecision(text: string): Promise<void> {
  if (!botId) return;
  const response = await fetch('https://api.groupme.com/v3/bots/post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bot_id: botId, text: text.slice(0, 900) }),
  });
  if (!response.ok) throw new Error('GroupMe bot reply failed (' + response.status + ').');
}

async function processMessage(message: Message): Promise<{ alreadyRead: boolean }> {
  const thread = await previousMessages(message);
  const response = await fetch(supabaseUrl + '/functions/v1/submit-event', {
    method: 'POST',
    headers: { apikey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      announcement: (message.text || '').trim().slice(0, 2000),
      source: 'groupme',
      source_id: message.id,
      source_name: (message.name || '').slice(0, 160),
      thread,
    }),
  });
  if (!response.ok) throw new Error('The event agent failed (' + response.status + ').');
  const result = await response.json();
  if (!result.ok) throw new Error('The event agent could not decide this message.');
  if (result.already_read) return { alreadyRead: true };
  const reasons = Array.isArray(result.reasons) ? result.reasons.filter((item: unknown) => typeof item === 'string') : [];
  const reply = [result.message || 'The event was checked.', ...reasons].join(' ').trim();
  await postDecision(reply);
  return { alreadyRead: false };
}

async function readChannel(): Promise<Response> {
  if (!ready) return json({ ok: false, ready: false, message: 'The GroupMe reader needs its saved settings.' }, 503);
  let current = await cursor();
  if (!current) {
    const latest = await messages({ limit: '1' });
    const lastId = latest[0]?.id || '';
    const { error } = await db!.from('channel_cursor')
      .insert({ source: 'groupme', last_id: lastId, read_count: 0 });
    if (error && error.code !== '23505') throw new Error('Could not create the chat bookmark.');
    return json({ ok: true, ready: true, initialized: true, last_message_id: lastId || null, read_count: 0, bot: Boolean(botId) });
  }
  const batch = await messages(current.last_id ? { after_id: current.last_id, limit: '20' } : { limit: '20' });
  if (!current.last_id) batch.reverse();
  let processed = 0;
  let skipped = 0;
  for (const message of batch) {
    if (!message.id) continue;
    if (message.sender_type === 'bot' || message.sender_type === 'system' || message.system || !message.text?.trim()) {
      skipped++;
    } else {
      const result = await processMessage(message);
      if (result.alreadyRead) skipped++;
      else processed++;
    }
    const updated = await advance(current, message.id);
    if (!updated) break; // Another reader moved the bookmark first.
    current = updated;
  }
  return json({
    ok: true, ready: true, last_message_id: current.last_id || null,
    read_count: current.read_count, processed, skipped, bot: Boolean(botId),
  });
}

Deno.serve(async (request: Request): Promise<Response> => {
  try {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
    if (request.method === 'GET') {
      if (new URL(request.url).searchParams.get('check') === 'groupme') return await checkGroupMe();
      const saved = db ? await cursor() : null;
      return json({
        ok: true, ready, last_message_id: saved?.last_id || null,
        read_count: saved?.read_count || 0, bot: Boolean(botId),
      });
    }
    if (request.method === 'POST') return await readChannel();
    return json({ ok: false, message: 'Use GET or POST.' }, 405);
  } catch (error) {
    console.error('GroupMe reader failed:', error instanceof Error ? error.message : 'Unknown error');
    return json({ ok: false, message: 'The GroupMe reader could not finish this run.' }, 503);
  }
});
