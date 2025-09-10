// Frontend: invia i dati del form alla Netlify Function /api/subscribe
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("newsletter-form");
    if (!form) return;

    const submitBtn = document.getElementById("submit-btn");
    const newsletterContent = document.getElementById("newsletter-content");
    const successMessage = document.getElementById("success-message");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fd = new FormData(form);
        const payload = {
            firstName: (fd.get("firstName") || "").trim(),
            lastName: (fd.get("lastName") || "").trim(),
            email: (fd.get("email") || "").trim(),
            privacyConsent: !!fd.get("privacy"),
            // honeypot anti-bot (aggiungi <input name="website" style="display:none"> nel form)
            website: (fd.get("website") || "").trim(),
        };

        // Validazioni base
        if (!payload.firstName || !payload.lastName || !payload.email || !payload.privacyConsent) {
            alert("Per favore compila tutti i campi e accetta la privacy.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
            alert("Per favore inserisci un indirizzo email valido.");
            return;
        }

        // UI: stato invio
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Iscrizione in corso...";
        }

        try {
            // Alias definito in netlify.toml (redirect verso la function)
            const resp = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await resp.json().catch(() => ({}));
            if (!resp.ok) throw new Error(json.error || "Errore durante l'iscrizione.");

            // Successo: mostra messaggio e nasconde il form
            if (newsletterContent) newsletterContent.style.display = "none";
            if (successMessage) successMessage.classList.add("active");
            form.reset();
        } catch (err) {
            console.error(err);
            alert("Ops! Non siamo riusciti a iscriverti. Riprova più tardi.");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Iscriviti alla Newsletter";
            }
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const fab = document.getElementById("newsletter-fab");
    if (fab) {
        fab.addEventListener("click", () => {
            openNewsletterPopup();
        });
    }
});
