// =============================================
// HORIZONTE IMÓVEIS — JavaScript
// Passo 4: menu mobile | Passo 5: scroll + animações
// =============================================

// --- Seleciona elementos do DOM ---
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const navLinks = document.querySelectorAll(".nav-list a");
const header = document.querySelector(".header");
const sections = document.querySelectorAll("section[id]");

// --- Menu mobile (Passo 4) ---

const overlay = document.createElement("div");
overlay.className = "nav-overlay";
document.body.appendChild(overlay);

function openMenu() {
  nav.classList.add("nav-open");
  menuToggle.classList.add("is-active");
  overlay.classList.add("is-visible");
  document.body.classList.add("menu-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Fechar menu");
}

function closeMenu() {
  nav.classList.remove("nav-open");
  menuToggle.classList.remove("is-active");
  overlay.classList.remove("is-visible");
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
}

menuToggle.addEventListener("click", () => {
  const isOpen = nav.classList.contains("nav-open");
  isOpen ? closeMenu() : openMenu();
});

overlay.addEventListener("click", closeMenu);

// --- Scroll suave com compensação do header (Passo 5) ---

function scrollToSection(targetId) {
  const section = document.querySelector(targetId);
  if (!section) return;

  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleNavLinkClick(event) {
  const anchor = event.currentTarget;
  const targetId = anchor.getAttribute("href");

  if (!targetId || targetId === "#") return;

  const section = document.querySelector(targetId);
  if (!section) return;

  event.preventDefault();
  event.stopPropagation();

  const isMobileMenuOpen = nav.classList.contains("nav-open");

  closeMenu();

  if (isMobileMenuOpen) {
    setTimeout(() => scrollToSection(targetId), 50);
  } else {
    scrollToSection(targetId);
  }
}

function handleAnchorClick(event, anchor) {
  const targetId = anchor.getAttribute("href");

  if (targetId === "#") return;

  const section = document.querySelector(targetId);
  if (!section) return;

  event.preventDefault();
  scrollToSection(targetId);
}

navLinks.forEach((link) => {
  link.addEventListener("click", handleNavLinkClick);
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  if (anchor.closest(".nav-list")) return;
  anchor.addEventListener("click", (event) => handleAnchorClick(event, anchor));
});

// --- Link ativo no menu ao rolar a página (Passo 5) ---

function setActiveLink(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    rootMargin: `-${header.offsetHeight}px 0px -55% 0px`,
    threshold: 0,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

// --- Animação de entrada nas seções (Passo 5) ---

document.querySelectorAll(".section").forEach((section) => {
  section.classList.add("reveal");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

// --- Formulário de contato via Formspree (Passo 6) ---

// ⚠️ SUBSTITUA pelo seu ID do Formspree (veja instruções no Passo 6)
const FORMSPREE_FORM_ID = "mnpajrbw";
const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

const contactForm = document.querySelector("#contact-form");
const submitBtn = document.querySelector("#submit-btn");
const formStatus = document.querySelector(".form-status");

function showFormStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status is-visible is-${type}`;
}

function clearFormStatus() {
  formStatus.textContent = "";
  formStatus.className = "form-status";
}

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormStatus();

  if (FORMSPREE_FORM_ID === "YOUR_FORM_ID") {
    showFormStatus(
      "Configure seu ID do Formspree no arquivo script.js para ativar o envio.",
      "info"
    );
    return;
  }

  submitBtn.classList.add("is-loading");

  const formData = new FormData(contactForm);
  formData.append("_subject", "Nova mensagem — Horizonte Imóveis");

  try {
    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      showFormStatus(
        "Mensagem enviada com sucesso! Retornaremos em até 24 horas.",
        "success"
      );
      contactForm.reset();
    } else {
      showFormStatus(
        "Não foi possível enviar. Verifique os campos e tente novamente.",
        "error"
      );
    }
  } catch {
    showFormStatus(
      "Erro de conexão. Verifique sua internet e tente novamente.",
      "error"
    );
  } finally {
    submitBtn.classList.remove("is-loading");
  }
});
