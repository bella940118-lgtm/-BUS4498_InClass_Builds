(function () {
  'use strict';

  const config = window.EVENT_RADAR_CONFIG;
  if (!config?.supabaseUrl || !config?.publishableKey || !window.supabase?.createClient) {
    document.body.textContent = 'Sign-in is unavailable. Check the Supabase configuration and reload.';
    return;
  }

  const client = window.supabase.createClient(config.supabaseUrl, config.publishableKey);
  const page = document.body.dataset.page;
  const status = document.getElementById('auth-status');
  const form = document.getElementById('sign-in-form');
  const submit = document.getElementById('sign-in-button');
  const protectedContent = document.getElementById('protected-content');
  const accessDenied = document.getElementById('access-denied');
  const email = document.getElementById('account-email');

  function message(value) {
    if (status) status.textContent = value;
  }

  async function isModerator(user) {
    const { data, error } = await client.from('moderators')
      .select('user_id').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    return Boolean(data);
  }

  if (page === 'sign-in') {
    client.auth.getUser().then(async ({ data, error }) => {
      if (!error && data.user && await isModerator(data.user)) {
        window.location.replace('moderator.html');
      }
    }).catch(() => message('Could not check moderator access. Reload to try again.'));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      submit.disabled = true;
      message('Signing in…');
      let error;
      try {
        ({ error } = await client.auth.signInWithPassword({
          email: form.elements.email.value.trim(),
          password: form.elements.password.value
        }));
      } catch (_) {
        error = new Error('Network error');
      }
      form.elements.password.value = '';
      submit.disabled = false;
      if (error) {
        message('Sign-in failed. Check your email and password.');
        return;
      }
      try {
        const { data: userData, error: userError } = await client.auth.getUser();
        if (!userError && userData.user && await isModerator(userData.user)) {
          window.location.replace('moderator.html');
          return;
        }
        message('This account does not have moderator access.');
      } catch (_) {
        message('Could not check moderator access. Reload to try again.');
      }
    });
    return;
  }

  if (page === 'moderator') {
    client.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') window.location.replace('sign-in.html');
    });

    client.auth.getUser().then(async ({ data, error }) => {
      if (error || !data.user) {
        window.location.replace('sign-in.html');
        return;
      }
      if (!await isModerator(data.user)) {
        accessDenied.hidden = false;
        message('');
        return;
      }
      email.textContent = data.user.email || 'Signed-in account';
      protectedContent.hidden = false;
      message('');
    }).catch(() => {
      message('Could not verify your sign-in. Reload to try again.');
    });

    document.querySelectorAll('[data-sign-out]').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        message('Signing out…');
        const { error } = await client.auth.signOut();
        if (error) {
          button.disabled = false;
          message('Could not sign out. Please try again.');
        }
      });
    });
  }
})();
