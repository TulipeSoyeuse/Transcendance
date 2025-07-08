const loginform = document.getElementById('LoginForm');
const registerform = document.getElementById('RegisterForm');
function openLogin() {
    loginform?.classList.remove('hidden');
}
function openRegister() {
    registerform?.classList.remove('hidden');
}
function closeRForm() {
    registerform?.classList.add('hidden');
}
function closeLForm() {
    loginform?.classList.add('hidden');
}
document.getElementById('openLogin')?.addEventListener('click', openLogin);
document.getElementById('closeLForm')?.addEventListener('click', closeLForm);
document.getElementById('openRegister')?.addEventListener('click', openRegister);
document.getElementById('closeRForm')?.addEventListener('click', closeRForm);
registerform?.addEventListener('submit', function (event) {
    event.preventDefault();
    const form = registerform?.querySelector('form');
    const formData = new FormData(form);
    const username = formData.get('username')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';
    // Basic validation
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    const res = fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username }),
    });
    res.then((res) => {
        console.log(res);
    });
    form.submit();
});
// // Google sign-in setup
// window.addEventListener('load', () => {
// //   const clientId = 'YOUR_GOOGLE_CLIENT_ID';
//     const clientId = '413457255180-qc4e82nl65eahgu7f91s7bd8kuqin73a.apps.googleusercontent.com';
//     // const clientId = import.meta.env.GOOGLE_CLIENT_ID;
//     if (window.google && clientId) {
//         window.google.accounts.id.initialize({
//             client_id: clientId,
//             callback: handleGoogleCredentialResponse,
//         });
//         window.google.accounts.id.renderButton(
//             document.getElementById('googleSignInButton'),
//             { theme: 'outline', size: 'large' }
//         );
//     }
// });
window.addEventListener('load', () => {
    fetch('/api/auth/google-client-id')
        .then(res => res.json())
        .then(({ clientId }) => {
        if (window.google && clientId) {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleGoogleCredentialResponse,
            });
            window.google.accounts.id.renderButton(document.getElementById('googleSignInButton'), { theme: 'outline', size: 'large' });
        }
        else {
            console.error("Google API or client ID missing");
        }
    })
        .catch(err => {
        console.error("Failed to fetch Google Client ID:", err);
    });
});
function handleGoogleCredentialResponse(response) {
    const idToken = response.credential;
    fetch('/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
    })
        .then(res => res.json())
        .then(data => {
        if (data.success) {
            window.location.reload(); // or redirect to dashboard
        }
        else {
            alert('Google login failed');
        }
    })
        .catch(() => alert('Network error'));
}
export {};
