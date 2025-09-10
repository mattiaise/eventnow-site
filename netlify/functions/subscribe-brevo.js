// Netlify Function: subscribe-brevo.js
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

        const nowISO = new Date().toISOString();
        const customAttributes = {
            ISCRITTO: true,               
            NOME: firstName,              
            COGNOME: lastName,            
            CONSENSO_PRIVACY: privacy,      
            DATA_DI_CREAZIONE: nowISO,     
            ULTIMA_MODIFICA: nowISO        
        };


        const payload = {
            email,
            listIds: [Number(BREVO_LIST_ID)],
            attributes: customAttributes,
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
            return { statusCode: resp.status, body: JSON.stringify({ error: out.message || "Brevo error" }) };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ ok: true, message: "Subscribed" })
        };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal error" }) };
    }
};
