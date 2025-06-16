 document.getElementById('showSignIn').onclick = () => {
      document.getElementById('signInForm').style.display = 'block';
      document.getElementById('signUpForm').style.display = 'none';
      clearMessages();
    };

    // Show Sign Up form, hide Sign In
    document.getElementById('showSignUp').onclick = () => {
      document.getElementById('signUpForm').style.display = 'block';
      document.getElementById('signInForm').style.display = 'none';
      clearMessages();
    };

    function clearMessages() {
      document.getElementById('signInMessage').textContent = '';
      document.getElementById('signUpMessage').textContent = '';
    }

    // Handle Sign In submission
// Handle Sign In submission
document.getElementById('formSignIn').onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  const formData = new FormData(e.target);
  const data = {
    name: formData.get('name'),
    password: formData.get('password')
  };

  try {
    const res = await fetch('/signin', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const json = await res.json();
      document.getElementById('otp-section').style.display = 'block';

      // Hide the signUp form so user focuses on 2FA step
      document.getElementById('signUpForm').style.display = 'none';

      // Save email or name to sessionStorage for verifying OTP later
      sessionStorage.setItem('pendingName', data.name);
    } else {
      const text = await res.text();
      document.getElementById('signInMessage').textContent = 'Error: ' + text;
    }
  } catch {
    document.getElementById('signInMessage').textContent = 'Network error';
  }
};

// Handle Sign Up submission
document.getElementById('formSignUp').onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  const formData = new FormData(e.target);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  };

  try {
    const res = await fetch('/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    if (res.ok) {
      const json = await res.json();
      
      // Show the QR code using otpauth_url
      document.getElementById('qr-container').style.display = 'block';
      const qrImg = document.getElementById('qr');
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(json.otpauth_url)}`;
      qrImg.style.display = 'block';

      // Show OTP input UI
      document.getElementById('otp-section').style.display = 'block';

      // Hide the signUp form so user focuses on 2FA step
      document.getElementById('signUpForm').style.display = 'none';

      // Save email or name to sessionStorage for verifying OTP later
      sessionStorage.setItem('pendingName', data.name);
    } else {
      const text = await res.text();
      document.getElementById('signUpMessage').textContent = 'Error: ' + text;
    }
  } catch {
    document.getElementById('signUpMessage').textContent = 'Network error';
  }
};

async function verifyOTP() {
  const token = document.getElementById('otp').value;
  const name = sessionStorage.getItem('pendingName');

  if (!name || !token) {
    alert('Missing name or OTP token');
    return;
  }

  try {
    const res = await fetch('/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, token })
    });

    if (res.ok) {
      const json = await res.json();
      sessionStorage.setItem('token', json.token); // Save JWT
      alert('2FA verified!');
      window.location.href = `/dashboard.html?name=${encodeURIComponent(name)}`;
    } else {
      alert('Invalid OTP. Try again.');
    }
  } catch (err) {
    alert('Network error during OTP verification.');
    console.error(err);
  }
}

async function testProtectedRoute() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found in localStorage.');
    return;
  }

  try {
    const res = await fetch('/protected', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Protected route accessed:', data.msg);
    } else {
      const err = await res.text();
      console.error('Failed to access protected route:', err);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
}