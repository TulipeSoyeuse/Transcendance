    const params = new URLSearchParams(window.location.search);
    const userName = params.get('name');
    document.getElementById('welcomeMsg').innerText = `Welcome, ${userName}!`;

    function deleteUser() {
      fetch('/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName })
      })
      .then(res => res.text())
      .then(msg => alert(msg))
      .then(() => location.href = '/auth.html')
      .catch(err => alert('Error: ' + err));
    }