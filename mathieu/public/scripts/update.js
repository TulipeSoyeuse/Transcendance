    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');

    document.getElementById('updateForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = e.target.email.value;
      const password = e.target.password.value;

      const res = await fetch('/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const msg = await res.text();
      alert(msg);
      if (res.ok) window.location.href = `/dashboard.html?name=${encodeURIComponent(name)}`;
    });