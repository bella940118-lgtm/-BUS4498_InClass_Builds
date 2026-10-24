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
  const moderation = document.getElementById('moderation');
  const moderatorLink = document.getElementById('moderator-link');
  const moderatorForm = document.getElementById('moderator-form');
  const signInButton = document.getElementById('moderator-sign-in');
  const signInPanel = document.getElementById('sign-in-panel');
  const reviewPanel = document.getElementById('review-panel');
  const moderatorAccount = document.getElementById('moderator-account');
  const moderatorStatus = document.getElementById('moderator-status');
  const signOutButton = document.getElementById('moderator-sign-out');
  const waitingBoard = document.getElementById('waiting-board');
  const publicColumns = 'id,created_at,status,title,club,event_date,start_time,end_time,place_name,place_detail,cost,free_food,summary,flyer_url';
  let events = [];
  let activeFilter = 'all';
  let moderator = null;

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

  function trustedFlyerUrl(value) {
    if (typeof value !== 'string' || !value) return '';
    try {
      const project = new URL(config.supabaseUrl);
      const photo = new URL(value);
      const expectedPath = '/storage/v1/object/public/flyers/';
      if (photo.origin !== project.origin || !photo.pathname.startsWith(expectedPath)) return '';
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png)$/i.test(photo.pathname.slice(expectedPath.length))) return '';
      if (photo.search || photo.hash) return '';
      return photo.href;
    } catch (_) {
      return '';
    }
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
    const flyerUrl = trustedFlyerUrl(event.flyer_url);
    if (flyerUrl) {
      const flyer = document.createElement('img');
      flyer.className = 'flyer';
      flyer.src = flyerUrl;
      flyer.alt = `Flyer for ${event.title || 'this event'}`;
      flyer.loading = 'lazy';
      item.append(flyer);
    }
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
    signInButton.disabled = true;
    moderatorStatus.textContent = 'Moderator sign-in is unavailable until the Supabase connection is fixed.';
    return;
  }

  const client = window.supabase.createClient(config.supabaseUrl, config.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
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
    const flyer = form.elements.flyer.files[0];
    if (!announcement || announcement.length > 2000) {
      showResult('error', 'Could not post', 'Enter an announcement between 1 and 2000 characters.');
      return;
    }
    if (flyer && (!['image/jpeg', 'image/png'].includes(flyer.type) || flyer.size < 1 || flyer.size > 5 * 1024 * 1024)) {
      showResult('error', 'Could not post', 'Choose a JPG or PNG photo up to 5 MB.');
      return;
    }
    submitButton.disabled = true;
    showResult('', 'Checking your event', 'The agent is reading your announcement…');
    try {
      const body = new FormData();
      body.set('announcement', announcement);
      if (flyer) body.set('flyer', flyer);
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

  function setModeratorStatus(message) {
    moderatorStatus.textContent = message;
  }

  function showModerator(user) {
    moderator = user;
    signInPanel.hidden = Boolean(user);
    reviewPanel.hidden = !user;
    moderatorAccount.textContent = user ? `Signed in as ${user.email || 'moderator'}.` : '';
    if (user) moderation.open = true;
    else waitingBoard.replaceChildren();
  }

  async function loadWaitingEvents() {
    if (!moderator) return;
    waitingBoard.replaceChildren(textElement('li', 'empty', 'Loading waiting posts…'));
    const { data, error } = await client.from('events')
      .select('id,status,status_reason,announcement,title,club,event_date,start_time,end_time,place_name,place_detail,cost,free_food,summary,flyer_url,note_for_moderator')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) {
      waitingBoard.replaceChildren(textElement('li', 'empty', 'Could not load waiting posts. Please sign in again or reload.'));
      return;
    }
    if (!data.length) {
      waitingBoard.replaceChildren(textElement('li', 'empty', 'No posts are waiting for review.'));
      return;
    }
    const fragment = document.createDocumentFragment();
    for (const post of data) {
      const card = createCard(post);
      const review = document.createElement('div');
      review.className = 'review';
      review.append(textElement('p', 'why', post.status_reason || 'This post needs moderator review.'));
      if (post.note_for_moderator) review.append(textElement('p', 'why', post.note_for_moderator));
      review.append(textElement('p', 'original', post.announcement));
      const actions = document.createElement('p');
      actions.className = 'actions';
      const approve = textElement('button', '', 'Approve');
      approve.type = 'button';
      const reject = textElement('button', 'ghost', 'Reject');
      reject.type = 'button';
      approve.addEventListener('click', () => reviewPost(post.id, 'published', actions));
      reject.addEventListener('click', () => reviewPost(post.id, 'rejected', actions));
      actions.append(approve, reject);
      review.append(actions);
      card.append(review);
      fragment.append(card);
    }
    waitingBoard.replaceChildren(fragment);
  }

  async function reviewPost(id, status, actions) {
    if (!moderator) return;
    for (const button of actions.querySelectorAll('button')) button.disabled = true;
    setModeratorStatus('Saving your review…');
    try {
      const { data, error } = await client.from('events').update({
        status,
        status_reason: status === 'published' ? 'Approved by moderator.' : 'Rejected by moderator.',
        reviewed_at: new Date().toISOString(),
        reviewed_by: moderator.id,
      }).eq('id', id).eq('status', 'waiting').select('id');
      if (error) throw error;
      await loadWaitingEvents();
      if (!data.length) {
        setModeratorStatus('This post was already reviewed. The waiting list is refreshed.');
        return;
      }
      if (status === 'published') await loadEvents();
      setModeratorStatus(status === 'published' ? 'Post approved and added to the website.' : 'Post rejected.');
    } catch (_) {
      setModeratorStatus('Could not save the review. Please try again.');
      for (const button of actions.querySelectorAll('button')) button.disabled = false;
    }
  }

  moderatorForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    signInButton.disabled = true;
    setModeratorStatus('Signing in…');
    const email = moderatorForm.elements.email.value.trim();
    const password = moderatorForm.elements.password.value;
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error || !data.user) throw error || new Error('No user');
      moderatorForm.elements.password.value = '';
      showModerator(data.user);
      setModeratorStatus('Signed in.');
      await loadWaitingEvents();
    } catch (_) {
      moderatorForm.elements.password.value = '';
      setModeratorStatus('Could not sign in. Check your email and password.');
    } finally {
      signInButton.disabled = false;
    }
  });

  signOutButton.addEventListener('click', async () => {
    signOutButton.disabled = true;
    const { error } = await client.auth.signOut({ scope: 'local' });
    signOutButton.disabled = false;
    if (error) {
      setModeratorStatus('Could not sign out. Please try again.');
      return;
    }
    showModerator(null);
    setModeratorStatus('Signed out.');
  });

  moderatorLink.addEventListener('click', () => { moderation.open = true; });
  if (window.location.hash === '#moderation') moderation.open = true;

  async function restoreModerator() {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return;
    showModerator(data.user);
    await loadWaitingEvents();
  }

  loadEvents();
  restoreModerator();
})();
