// Light / dark theme toggle (initial theme is set inline in <head> to avoid a flash).
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const sync = () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', `Switch to ${next} mode`);
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', root.dataset.theme === 'dark' ? '#14120A' : '#DDDDDD');
  };

  toggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
    sync();
  });

  sync();
})();

// Ensure local file:// previewing works cleanly without breaking published http/https clean URLs
if (window.location.protocol === 'file:') {
  document.querySelectorAll('a[href="/variation"]').forEach((a) => {
    a.href = 'variation/index.html';
  });
  if (window.location.pathname.includes('/variation/')) {
    document.querySelectorAll('a[href="/"]').forEach((a) => {
      a.href = '../index.html';
    });
  }
}

// Play / pause toggle with an elapsed-time counter that runs from 00:00 to the entry's duration.
(function () {
  const pad = (n) => String(n).padStart(2, '0');
  const format = (s) => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;

  document.querySelectorAll('.entry-meta[data-duration]').forEach((meta) => {
    const button = meta.querySelector('.play');
    const label = meta.querySelector('.duration');
    const total = Number(meta.dataset.duration);

    let elapsed = 0;      // seconds already played
    let startedAt = null; // performance.now() when current run started
    let rafId = null;

    const current = () =>
      startedAt === null ? elapsed : elapsed + (performance.now() - startedAt) / 1000;

    const setPlaying = (playing) => {
      button.classList.toggle('is-playing', playing);
      button.setAttribute('aria-pressed', String(playing));
      button.setAttribute('aria-label', playing ? 'Pause' : 'Play');
    };

    const tick = () => {
      const t = current();
      if (t >= total) {
        // Finished: reset to the initial state showing the full length.
        startedAt = null;
        elapsed = 0;
        setPlaying(false);
        label.textContent = format(total);
        return;
      }
      label.textContent = format(t);
      rafId = requestAnimationFrame(tick);
    };

    button.addEventListener('click', () => {
      if (startedAt === null) {
        startedAt = performance.now();
        setPlaying(true);
        tick();
      } else {
        elapsed = current();
        startedAt = null;
        cancelAnimationFrame(rafId);
        setPlaying(false);
        label.textContent = format(elapsed);
      }
    });
  });
})();
