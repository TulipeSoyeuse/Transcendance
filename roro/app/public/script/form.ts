
const loginform = document.getElementById('LoginForm') as HTMLFormElement;
const registerform = document.getElementById('RegisterForm') as HTMLFormElement;

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

registerform?.addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(registerform);
    const username = formData.get('username')?.toString().trim() || '';
    const email = formData.get('email')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';
    // Basic validation
    if (!email) {
        alert('Email is required');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }

    const res = fetch('/api/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username }),
    });
});
