function setupPropertyGallery(imovel) {
  const imagens = imovel.imagens || [];
  const imgEl = document.getElementById("property-image");
  const gallery = document.getElementById("property-gallery");
  const trigger = document.getElementById("property-gallery-trigger");
  const nav = document.getElementById("gallery-nav");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  const counter = document.getElementById("gallery-counter");

  const lightbox = document.getElementById("gallery-lightbox");
  const lightboxImg = document.getElementById("lightbox-image");
  const lightboxNav = document.getElementById("lightbox-nav");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");
  const lightboxCounter = document.getElementById("lightbox-counter");
  const lightboxDots = document.getElementById("lightbox-dots");
  const lightboxBackdrop = document.getElementById("lightbox-backdrop");
  const lightboxClose = document.getElementById("lightbox-close");

  if (!imgEl || imagens.length === 0) return;

  let current = 0;
  let lightboxOpen = false;

  function imageAlt(item, index) {
    return item.alt || imovel.titulo || `Foto ${index + 1}`;
  }

  function updateDots(activeIndex) {
    if (!lightboxDots) return;

    lightboxDots.querySelectorAll(".gallery-dot").forEach((btn, i) => {
      const isActive = i === activeIndex;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
    });
  }

  function show(index) {
    current = (index + imagens.length) % imagens.length;
    const item = imagens[current];
    const alt = imageAlt(item, current);
    const src = detailImageUrl(item.url);
    const label = `${current + 1} / ${imagens.length}`;

    imgEl.src = src;
    imgEl.alt = alt;
    counter.textContent = label;
    updateDots(current);

    if (lightboxOpen && lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightboxCounter.textContent = label;
    }
  }

  function openLightbox() {
    if (!lightbox || !lightboxImg || !trigger) return;

    lightbox.hidden = false;
    lightbox.setAttribute("aria-hidden", "false");
    lightboxOpen = true;
    show(current);
    document.body.classList.add("lightbox-open");

    requestAnimationFrame(() => lightbox.classList.add("is-open"));
    lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightboxOpen) return;

    lightbox.classList.remove("is-open");
    lightboxOpen = false;
    document.body.classList.remove("lightbox-open");

    window.setTimeout(() => {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      trigger.focus();
    }, 350);
  }

  applyImageFallback(imgEl);
  applyImageFallback(lightboxImg);
  show(0);

  trigger.addEventListener("click", openLightbox);
  lightboxBackdrop.addEventListener("click", closeLightbox);
  lightboxClose.addEventListener("click", closeLightbox);

  if (imagens.length === 1) {
    lightboxCounter.textContent = "1 / 1";
  }

  document.addEventListener("keydown", (event) => {
    if (!lightboxOpen) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeLightbox();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(current - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(current + 1);
    }
  });

  if (imagens.length <= 1) return;

  gallery.classList.add("has-multiple");
  gallery.setAttribute("tabindex", "0");
  nav.hidden = false;
  counter.hidden = false;
  lightboxNav.hidden = false;
  lightboxDots.hidden = false;

  imagens.forEach((item, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "gallery-dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", imageAlt(item, index));
    dot.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      show(index);
    });
    lightboxDots.appendChild(dot);
  });

  updateDots(0);

  function goPrev(event) {
    event.stopPropagation();
    show(current - 1);
  }

  function goNext(event) {
    event.stopPropagation();
    show(current + 1);
  }

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);
  lightboxPrev.addEventListener("click", goPrev);
  lightboxNext.addEventListener("click", goNext);

  gallery.addEventListener("keydown", (event) => {
    if (lightboxOpen) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(current - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(current + 1);
    }
  });
}

// Página de detalhe do imóvel (imovel.html)

const slug = new URLSearchParams(window.location.search).get("slug");
const notFoundEl = document.getElementById("property-not-found");
const contentEl = document.getElementById("property-content");

async function loadPropertyPage() {
  let imovel = null;

  try {
    const imoveis = await fetchImoveis();
    imovel = findImovelBySlug(imoveis, slug);
  } catch {
    imovel = null;
  }

  if (!imovel) {
    notFoundEl.hidden = false;
    document.title = "Imóvel não encontrado | Horizonte Imóveis";
    return;
  }

  contentEl.hidden = false;
  document.title = `${imovel.titulo} | Horizonte Imóveis`;

  setupPropertyGallery(imovel);
  document.getElementById("property-type").textContent = `${imovel.tipo} · ${imovel.negocio}`;
  document.getElementById("property-title").textContent = imovel.titulo;
  document.getElementById("property-location").textContent = imovel.local;
  document.getElementById("property-price").textContent = imovel.preco;
  document.getElementById("property-description").textContent = imovel.descricao;
  document.getElementById("property-address").textContent = imovel.endereco;
  document.getElementById("property-bedrooms").textContent = imovel.quartos;
  document.getElementById("property-bathrooms").textContent = imovel.banheiros;
  document.getElementById("property-area").textContent = `${imovel.area} m²`;
  document.getElementById("property-parking").textContent = imovel.vagas;
  document.getElementById("property-condo").textContent = imovel.condominio;
  document.getElementById("property-iptu").textContent = imovel.iptu;

  const featuresList = document.getElementById("property-features");
  imovel.caracteristicas.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    featuresList.appendChild(li);
  });

  const mensagemField = document.getElementById("mensagem");
  mensagemField.value = `Olá! Tenho interesse no imóvel "${imovel.titulo}" (${imovel.preco}). Gostaria de mais informações.`;

  const whatsappLink = document.querySelector('.contact-info a[data-whatsapp], .contact-info a[href*="wa.me"]');
  if (whatsappLink && imovel) {
    whatsappLink.href = whatsAppPropertyUrl(imovel);
  }

  const propertyWhatsappBtn = document.getElementById("property-whatsapp-btn");
  if (propertyWhatsappBtn && imovel) {
    propertyWhatsappBtn.href = whatsAppPropertyUrl(imovel);
    propertyWhatsappBtn.target = "_blank";
    propertyWhatsappBtn.rel = "noopener noreferrer";
  }

  setupContactForm(imovel);
}

function setupContactForm(imovel) {
  const FORMSPREE_FORM_ID = "YOUR_FORM_ID";
  const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

  const contactForm = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const formStatus = document.querySelector(".form-status");

  if (!contactForm) return;

  function showFormStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = `form-status is-visible is-${type}`;
  }

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (FORMSPREE_FORM_ID === "YOUR_FORM_ID") {
      showFormStatus(
        "Configure seu ID do Formspree no arquivo imovel.js para ativar o envio.",
        "info"
      );
      return;
    }

    submitBtn.classList.add("is-loading");

    const formData = new FormData(contactForm);
    formData.append(
      "_subject",
      imovel ? `Interesse: ${imovel.titulo} — Horizonte Imóveis` : "Contato — Horizonte Imóveis"
    );

    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        showFormStatus("Mensagem enviada! Retornaremos em até 24 horas.", "success");
        contactForm.reset();
        if (imovel && document.getElementById("mensagem")) {
          document.getElementById("mensagem").value =
            `Olá! Tenho interesse no imóvel "${imovel.titulo}" (${imovel.preco}). Gostaria de mais informações.`;
        }
      } else {
        showFormStatus("Não foi possível enviar. Tente novamente.", "error");
      }
    } catch {
      showFormStatus("Erro de conexão. Verifique sua internet.", "error");
    } finally {
      submitBtn.classList.remove("is-loading");
    }
  });
}

loadPropertyPage();

document.querySelectorAll('a[href="#contato"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("contato").scrollIntoView({ behavior: "smooth" });
  });
});
