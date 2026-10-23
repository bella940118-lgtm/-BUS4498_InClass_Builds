(function () {
  'use strict';

  const config = window.EVENT_RADAR_CONFIG;
  const form = document.getElementById('post-form');
  const submitButton = document.getElementById('post-button');
  const result = document.getElementById('post-result');
  const board = document.getElementById('event-board');
  const boardStatus = document.getElementById('board-status');
  const refreshButton = document.getElementById('refresh-button');
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const publicColumns = 'id,created_at,status,title,club,event_date,start_time,end_time,place_name,place_detail,cost,free_food,summary';
  let events = [];
  let activeFilter = 'all';

  function textElement(tag, className, value) {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value;
    return element;
  }

  function showResult(kind, label, message, reasons) {
    result.className = `result ${kind}`;
    result.replaceChildren(
      textElement('p', 'result-label', label),
      textElement('p', '', message)
    );
    if (Array.isArray(reasons) && reasons.length) {
      const list = document.createElement('ul');
      list.className = 'reasons';
      for (const reason of reasons) list.append(textElement('li', '', String(reason)));
      result.append(list);
    }
    result.hidden = false;
  }

  function dateValue(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const date = new Date(`${value}T12:00:00Z`);
    return Number.isNaN(date.valueOf()) ? null : date;
  }

  function timeLabel(value) {
    if (!/^\d{2}:\d{2}/.test(value || '')) return '';
    const [hour, minute] = value.slice(0, 5).split(':').map(Number);
    if (hour > 23 || minute > 59) return '';
    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC', hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(new Date(Date.UTC(2020, 0, 1, hour, minute)));
  }

  function createCard(event) {
    const item = document.createElement('li');
    item.className = 'event';
    const date = dateValue(event.event_date);
    const badge = document.createElement('div');
    badge.className = date ? 'date' : 'date tba';
    if (date) {
      badge.append(textElement('span', 'mon', new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short' }).format(date)));
      badge.append(textElement('span', 'day', new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', day: 'numeric' }).format(date)));
    } else {
      badge.append(textElement('span', 'day', 'TBA'));
    }

    const body = document.createElement('div');
    body.className = 'event-body';
    let when = date
      ? new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric' }).format(date)
      : 'Date to be announced';
    const start = timeLabel(event.start_time);
    const end = timeLabel(event.end_time);
    if (start) when += ` · ${start}${end ? ` to ${end}` : ''}`;
    body.append(textElement('p', 'when', when));
    body.append(textElement('h3', '', event.title || 'Untitled event'));
    const location = [event.club, event.place_name, event.place_detail].filter(Boolean).join(' · ');
    if (location) body.append(textElement('p', 'meta', location));
    if (event.summary) body.append(textElement('p', 'summary', event.summary));

    const tags = document.createElement('p');
    tags.className = 'tags';
    if (event.cost) tags.append(textElement('span', 'tag', event.cost));
    if (event.free_food) tags.append(textElement('span', 'tag food', '🍕 Free food'));
    if (tags.childElementCount) body.append(tags);
    item.append(badge, body);
    return item;
  }

  function renderBoard() {
    const visible = events.filter((event) => {
      if (activeFilter === 'food') return event.free_food === true;
      if (activeFilter === 'free') return String(event.cost).trim().toLowerCase() === 'free';
      return true;
    });
    if (!visible.length) {
      board.replaceChildren(textElement('li', 'empty', events.length ? 'No events match this filter.' : 'No events yet. Post the first one!'));
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const event of visible) fragment.append(createCard(event));
    board.replaceChildren(fragment);
  }

  if (!config?.supabaseUrl || !config?.publishableKey || !window.supabase?.createClient) {
    boardStatus.textContent = 'The event board is unavailable. Check the Supabase connection and reload.';
    board.replaceChildren(textElement('li', 'empty', 'Could not load events.'));
    form.addEventListener('submit', (event) => event.preventDefault());
    submitButton.disabled = true;
    refreshButton.disabled = true;
    return;
  }

  const client = window.supabase.createClient(config.supabaseUrl, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  async function loadEvents() {
    refreshButton.disabled = true;
    boardStatus.textContent = 'Loading events…';
    try {
      const { data, error } = await client.from('events').select(publicColumns)
        .eq('status', 'published')
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(200);
      if (error) throw error;
      events = data || [];
      renderBoard();
      boardStatus.textContent = `${events.length} published ${events.length === 1 ? 'event' : 'events'}`;
    } catch (_) {
      boardStatus.textContent = 'Could not load events. Check the connection, then try Refresh.';
      if (!events.length) board.replaceChildren(textElement('li', 'empty', 'Events are unavailable right now.'));
    } finally {
      refreshButton.disabled = false;
    }
  }

  for (const filter of filters) {
    filter.addEventListener('click', () => {
      activeFilter = filter.dataset.filter;
      for (const button of filters) button.setAttribute('aria-pressed', String(button === filter));
      renderBoard();
    });
  }
  refreshButton.addEventListener('click', loadEvents);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const announcement = form.elements.announcement.value.trim();
    if (!announcement || announcement.length > 2000) {
      showResult('error', 'Could not post', 'Enter an announcement between 1 and 2000 characters.');
      return;
    }
    submitButton.disabled = true;
    showResult('', 'Checking your event', 'The agent is reading your announcement…');
    try {
      const body = new FormData();
      body.set('announcement', announcement);
      const response = await fetch(`${config.supabaseUrl}/functions/v1/submit-event`, {
        method: 'POST',
        headers: { apikey: config.publishableKey },
        body,
      });
      const answer = await response.json();
      if (!response.ok || !answer.ok) {
        showResult('error', 'Could not post', answer.message || 'Please try again.');
        return;
      }
      const labels = {
        published: 'Published', waiting: 'Waiting for review',
        rejected: 'Not posted', duplicate: 'Already posted',
      };
      const kind = labels[answer.status] ? answer.status : 'error';
      showResult(kind, labels[answer.status] || 'Could not post', answer.message || 'Please try again.', answer.reasons);
      if (answer.status === 'published') {
        form.reset();
        await loadEvents();
      }
    } catch (_) {
      showResult('error', 'Could not post', 'The event service is unavailable. Please try again.');
    } finally {
      submitButton.disabled = false;
    }
  });

  loadEvents();
})();
