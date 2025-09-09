// Waiting list links handler
document.querySelectorAll(".waiting-list-link").forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        openNewsletterPopup();
    });
});

// Header scroll behavior
let lastScrollTop = 0;
let scrollThreshold = 100;
const header = document.getElementById("header");

function handleScroll() {
    const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 10) {
        header.classList.add("header-scrolled");
    } else {
        header.classList.remove("header-scrolled");
    }

    if (scrollTop > scrollThreshold) {
        if (
            scrollTop > lastScrollTop &&
            !header.classList.contains("header-hidden")
        ) {
            header.classList.add("header-hidden");
        } else if (
            scrollTop < lastScrollTop &&
            header.classList.contains("header-hidden")
        ) {
            header.classList.remove("header-hidden");
        }
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
}

let scrollTimer = null;
window.addEventListener(
    "scroll",
    () => {
        if (scrollTimer !== null) {
            clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(handleScroll, 10);
    },
    { passive: true }
);

// Mobile menu
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");

function toggleMobileMenu() {
    const isActive = hamburger.classList.contains("active");
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
    hamburger.setAttribute("aria-expanded", !isActive);
    document.body.style.overflow = !isActive ? "hidden" : "";
}

hamburger.addEventListener("click", toggleMobileMenu);
hamburger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleMobileMenu();
    }
});

document.addEventListener("click", (e) => {
    if (
        !hamburger.contains(e.target) &&
        !navLinks.contains(e.target) &&
        navLinks.classList.contains("active")
    ) {
        toggleMobileMenu();
    }
});

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("active")) {
        toggleMobileMenu();
    }
});

// Newsletter popup
const newsletterOverlay = document.getElementById("newsletter-overlay");
const newsletterClose = document.getElementById("newsletter-close");
const newsletterCtaBtn = document.getElementById("newsletter-cta-btn");
const newsletterForm = document.getElementById("newsletter-form");
const newsletterContent = document.getElementById("newsletter-content");
const successMessage = document.getElementById("success-message");

function openNewsletterPopup() {
    newsletterOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    newsletterContent.classList.remove("active");
    successMessage.classList.remove("active");
    newsletterForm.reset();
    setTimeout(() => document.getElementById("firstName").focus(), 100);
}

function closeNewsletterPopup() {
    newsletterOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

if (newsletterCtaBtn) {
    newsletterCtaBtn.addEventListener("click", openNewsletterPopup);
}

newsletterClose.addEventListener("click", closeNewsletterPopup);
newsletterOverlay.addEventListener("click", (e) => {
    if (e.target === newsletterOverlay) {
        closeNewsletterPopup();
    }
});

document.addEventListener("keydown", (e) => {
    if (
        e.key === "Escape" &&
        newsletterOverlay.classList.contains("active")
    ) {
        closeNewsletterPopup();
    }
});

// Newsletter form submission
newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(newsletterForm);
    const firstName = formData.get("firstName").trim();
    const lastName = formData.get("lastName").trim();
    const email = formData.get("email").trim();
    const privacyConsent = formData.get("privacy");

    if (!firstName || !lastName || !email || !privacyConsent) {
        alert(
            "Per favore compila tutti i campi obbligatori e accetta il trattamento dei dati."
        );
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert("Per favore inserisci un indirizzo email valido.");
        return;
    }

    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Iscrizione in corso...";

    setTimeout(() => {
        const subscriberData = {
            firstName,
            lastName,
            email,
            timestamp: new Date().toISOString(),
            privacyConsent: true,
        };

        console.log("Newsletter subscription:", subscriberData);

        newsletterContent.style.display = "none";
        successMessage.classList.add("active");

        submitBtn.disabled = false;
        submitBtn.textContent = "Iscriviti alla Newsletter";

        setTimeout(() => {
            closeNewsletterPopup();
            setTimeout(() => {
                newsletterContent.style.display = "block";
                successMessage.classList.remove("active");
            }, 500);
        }, 3000);
    }, 1500);
});

// Tab functionality
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab");

        tabButtons.forEach((btn) => {
            btn.classList.remove("active");
            btn.setAttribute("aria-selected", "false");
        });
        tabContents.forEach((content) => {
            content.classList.remove("active");
        });

        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        const targetContent = document.getElementById(targetTab);
        if (targetContent) {
            targetContent.classList.add("active");
        }
    });

    button.addEventListener("keydown", (e) => {
        let targetIndex = index;

        if (e.key === "ArrowRight") {
            e.preventDefault();
            targetIndex = (index + 1) % tabButtons.length;
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            targetIndex = (index - 1 + tabButtons.length) % tabButtons.length;
        } else if (e.key === "Home") {
            e.preventDefault();
            targetIndex = 0;
        } else if (e.key === "End") {
            e.preventDefault();
            targetIndex = tabButtons.length - 1;
        }

        if (targetIndex !== index) {
            tabButtons[targetIndex].focus();
            tabButtons[targetIndex].click();
        }
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href");
        const target = document.querySelector(targetId);
        if (target) {
            if (navLinks.classList.contains("active")) {
                toggleMobileMenu();
            }

            const headerHeight = header.offsetHeight;
            const targetPosition =
                target.getBoundingClientRect().top +
                window.pageYOffset -
                headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: "smooth",
            });

            target.focus({ preventScroll: true });
        }
    });
});

// Intersection Observer for animations
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("animate-in");
            }
        });
    },
    {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    }
);

document
    .querySelectorAll(".about-card, .feature-card, .timeline-item")
    .forEach((el) => {
        observer.observe(el);
    });

// Error handling
window.addEventListener("error", (e) => {
    console.error("Resource failed to load:", e.target);
});