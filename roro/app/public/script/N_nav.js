export async function navbar() {
    var nav = await fetch('/script/nav').then(async (response) => await response.text());
    var user = await fetch('/api/islogged').then(async (response) => await response.json());
    var target = document.body;
    if (user && user.autenticated) {
        nav = nav.replace('PLACEHOLDER_USERNAME', user.username);
    }
    if (target) {
        target.querySelector('nav')?.remove();
        target.insertAdjacentHTML("afterbegin", nav);
        // ---- logout button listener
        document.addEventListener("click", async function (e) {
            const target = e.target;
            if (target && target.id === "logout") {
                e.preventDefault();
                try {
                    await fetch("/logout", {
                        method: "GET",
                        credentials: "include"
                    });
                    window.location.href = "/";
                }
                catch (err) {
                    console.error("Logout failed", err);
                }
            }
        });
    }
    else {
        console.error("Target element not found.");
    }
}
