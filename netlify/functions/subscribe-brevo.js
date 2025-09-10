// Netlify Function: subscribe-brevo.js - VERSIONE COMPLETA
export const handler = async (event) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
    }

    try {
        const { BREVO_API_KEY, BREVO_LIST_ID } = process.env;
        if (!BREVO_API_KEY || !BREVO_LIST_ID) {
            return { statusCode: 500, body: JSON.stringify({ error: "Missing server config" }) };
        }

        const data = JSON.parse(event.body || "{}");
        const firstName = (data.firstName || "").trim();
        const lastName = (data.lastName || "").trim();
        const email = (data.email || "").trim();
        const privacy = !!data.privacyConsent;
        const websiteHP = (data.website || "").trim(); // honeypot

        // Honeypot anti-bot
        if (websiteHP) {
            return { statusCode: 200, body: JSON.stringify({ ok: true }) };
        }

        if (!firstName || !lastName || !email || !privacy) {
            return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid email" }) };
        }

        // Data di iscrizione
        const subscriptionDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        const payload = {
            email,
            listIds: [Number(BREVO_LIST_ID)],
            attributes: {
                FIRSTNAME: firstName,
                LASTNAME: lastName,
                // Aggiungiamo attributi personalizzati
                SUBSCRIPTION_DATE: subscriptionDate,
                PRIVACY_CONSENT: privacy ? "Sì" : "No",
                SUBSCRIPTION_SOURCE: "EventNow Newsletter",
                FULL_NAME: `${firstName} ${lastName}`
            },
            updateEnabled: true
        };

        const resp = await fetch("https://api.brevo.com/v3/contacts", {
            method: "POST",
            headers: {
                "api-key": BREVO_API_KEY,
                "Content-Type": "application/json",
                "accept": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const out = await resp.json();

        if (!resp.ok && out.code !== "duplicate_parameter") {
            console.error("Brevo API Error:", out);
            return { statusCode: resp.status, body: JSON.stringify({ error: out.message || "Brevo error" }) };
        }

        // Log di successo per debug
        console.log("Contatto creato/aggiornato:", {
            email,
            firstName,
            lastName,
            subscriptionDate,
            privacyConsent: privacy
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                ok: true,
                message: "Iscrizione completata con successo",
                data: {
                    email,
                    nome: firstName,
                    cognome: lastName,
                    dataCreazione: subscriptionDate,
                    ultimaModifica: lastModified
                }
            })
        };
    } catch (e) {
        console.error("Function error:", e);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
    }
};