import { init } from "../game.js";
document.getElementsByTagName("main")?.item(0)?.addEventListener('click', async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target) {
        // ---- play button listener ----
        if (target.id === "get_started_button") {
            const response = await fetch("/game/pong", {
                method: "GET",
                credentials: "include"
            });
            const main = await response.text()
            let old = document.getElementById("main_content")
            if (old) {
                old.innerHTML = ""
                old.outerHTML = main;
                init()
            }
            else
                console.error("main not found")
        }
    }
});
