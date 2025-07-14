export async function navbar() {
    var nav = await fetch('/script/nav').then(async (response) => await response.text());
    var user = await fetch('/api/islogged').then(async (response) => await response.json());
    var target = document.body
    if (user && user.autenticated) {
        nav = nav.replace('PLACEHOLDER_USERNAME', user.username)
    }
    if (target) {
        target.querySelector('nav')?.remove();
        target.insertAdjacentHTML("afterbegin", nav);

        target.firstChild?.addEventListener("click", async function (e) {
            const target = e.target as HTMLElement;
            if (target) {
                e.preventDefault();
                // ---- logout button listener ----
                if (target.id === "logout") {
                    try {
                        await fetch("/logout", {
                            method: "GET",
                            credentials: "include"
                        });
                        window.location.href = "/";
                    } catch (err) {
                        console.error("Logout failed", err);
                    }
                }
                // ---- account button listener ----
                else if (target.id === "account") {
                    try {
                        const response = await fetch("/account", {
                            method: "GET",
                            credentials: "include"
                        });
                        const main = await response.text()
                        let old = document.getElementById("main_content")
                        if (old)
                            old.outerHTML = main;
                        else
                            console.error("main not found")
                        history.pushState(null, "", window.location.href + "#account") // TODO: need more thought
                    } catch (err) {
                        console.error("Logout failed", err);
                    }
                }
            }
        });
    } else {
        console.error("Target element not found.");
    }
}
