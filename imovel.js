// Página de detalhe do imóvel (imovel.html)

const slug = new URLSearchParams(window.location.search).get("slug");
const imovel = slug ? IMOVEIS[slug] : null;

const notFoundEl = document.getElementById("property-not-found");
const contentEl = document.getElementById("property-content");

if (!imovel) {
  notFoundEl.hidden = false;
  document.title = "Imóvel não encontrado | Horizonte Imóveis";
} else {
  contentEl.hidden = false;
  document.title = `${imovel.titulo} | Horizonte Imóveis`;

  document.getElementById("property-image").src = imovel.imagem;
  document.getElementById("property-image").alt = imovel.imagemAlt;
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

  const whatsappLink = document.querySelector('.contact-info a[href*="wa.me"]');
  if (whatsappLink) {
    const texto = encodeURIComponent(
      `Olá! Tenho interesse no imóvel "${imovel.titulo}" (${imovel.preco}).`
    );
    whatsappLink.href = `https://wa.me/5511999991234?text=${texto}`;
  }
}

// Formulário de contato (mesma lógica da página principal)
const FORMSPREE_FORM_ID = "YOUR_FORM_ID";
const FORMSPREE_URL = `https://formspree.io/f/${FORMSPREE_FORM_ID}`;

const contactForm = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");
const formStatus = document.querySelector(".form-status");

if (contactForm) {
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
    formData.append("_subject", imovel
      ? `Interesse: ${imovel.titulo} — Horizonte Imóveis`
      : "Contato — Horizonte Imóveis");

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

// Scroll suave para #contato
document.querySelectorAll('a[href="#contato"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("contato").scrollIntoView({ behavior: "smooth" });
  });
});
