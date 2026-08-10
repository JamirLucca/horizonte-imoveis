// Carrega imóveis de content/imoveis.json (editável pelo painel /admin)

const IMOVEIS_JSON_URL = "content/imoveis.json";

function normalizeImageUrl(imagem) {
  if (!imagem) return "";
  if (typeof imagem === "string") return imagem.trim();
  if (typeof imagem === "object") {
    return imagem.url || imagem.src || imagem.path || "";
  }
  return "";
}

function resolveImageUrl(url, size = "card") {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return "";

  // URLs externas (Unsplash, etc.)
  if (/^https?:\/\//i.test(normalized)) {
    if (normalized.includes("unsplash.com")) {
      const base = normalized.split("?")[0];
      return size === "detail"
        ? `${base}?w=1200&h=800&fit=crop&auto=format&q=80`
        : `${base}?w=600&h=400&fit=crop&auto=format&q=80`;
    }
    return normalized;
  }

  // Fotos enviadas pelo painel (/images/imoveis/...)
  if (normalized.startsWith("/")) return normalized;
  return `/${normalized}`;
}

function cardImageUrl(url) {
  return resolveImageUrl(url, "card");
}

function detailImageUrl(url) {
  return resolveImageUrl(url, "detail");
}

function applyImageFallback(img) {
  img.referrerPolicy = "no-referrer";
  img.loading = "lazy";
  img.addEventListener("error", () => {
    img.style.objectFit = "contain";
    img.style.backgroundColor = "#E5E7EB";
    img.alt = "Imagem indisponível";
  });
}

function normalizeCaracteristicas(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => (typeof item === "string" ? item : item.item || ""));
}

function normalizeImagens(imovel) {
  if (Array.isArray(imovel.imagens) && imovel.imagens.length > 0) {
    return imovel.imagens
      .map((item) => {
        if (typeof item === "string") {
          return { url: normalizeImageUrl(item), alt: imovel.imagemAlt || imovel.titulo || "" };
        }
        return {
          url: normalizeImageUrl(item.url || item.imagem),
          alt: item.alt || imovel.imagemAlt || imovel.titulo || "",
        };
      })
      .filter((item) => item.url);
  }

  const legacyUrl = normalizeImageUrl(imovel.imagem);
  if (legacyUrl) {
    return [{ url: legacyUrl, alt: imovel.imagemAlt || imovel.titulo || "" }];
  }

  return [];
}

async function fetchImoveis() {
  const response = await fetch(`${IMOVEIS_JSON_URL}?t=${Date.now()}`);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os imóveis.");
  }

  const data = await response.json();
  return data.imoveis.map((imovel) => {
    const imagens = normalizeImagens(imovel);
    return {
      ...imovel,
      imagens,
      imagem: imagens[0]?.url || "",
      imagemAlt: imagens[0]?.alt || imovel.titulo || "",
      caracteristicas: normalizeCaracteristicas(imovel.caracteristicas),
    };
  });
}

function findImovelBySlug(imoveis, slug) {
  return imoveis.find((imovel) => imovel.slug === slug) || null;
}

function createPropertyCard(imovel) {
  const link = document.createElement("a");
  link.href = `imovel.html?slug=${encodeURIComponent(imovel.slug)}`;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.className = "property-card-link";

  const article = document.createElement("article");
  article.className = "property-card";

  const media = document.createElement("div");
  media.className = "property-card-media";

  const img = document.createElement("img");
  img.src = cardImageUrl(imovel.imagem);
  img.alt = imovel.imagemAlt || imovel.titulo;
  applyImageFallback(img);
  media.appendChild(img);

  if (imovel.imagens.length > 1) {
    const badge = document.createElement("span");
    badge.className = "property-photo-count";
    badge.textContent = `${imovel.imagens.length} fotos`;
    media.appendChild(badge);
  }

  const info = document.createElement("div");
  info.className = "property-info";

  const type = document.createElement("p");
  type.className = "property-type";
  type.textContent = `${imovel.tipo} · ${imovel.negocio}`;

  const title = document.createElement("h3");
  title.textContent = imovel.titulo;

  const location = document.createElement("p");
  location.className = "property-location";
  location.textContent = imovel.local;

  const price = document.createElement("p");
  price.className = "property-price";
  price.textContent = imovel.preco;

  const details = document.createElement("ul");
  details.className = "property-details";
  [`${imovel.quartos} quartos`, `${imovel.area} m²`, `${imovel.vagas} vagas`].forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    details.appendChild(li);
  });

  const cta = document.createElement("span");
  cta.className = "property-cta";
  cta.textContent = "Ver detalhes →";

  info.append(type, title, location, price, details, cta);
  article.append(media, info);
  link.append(article);

  return link;
}

async function renderPropertiesGrid(containerId) {
  const grid = document.getElementById(containerId);
  if (!grid) return;

  try {
    const imoveis = await fetchImoveis();
    grid.innerHTML = "";

    if (imoveis.length === 0) {
      grid.innerHTML = '<p class="properties-empty">Nenhum imóvel cadastrado no momento.</p>';
      return;
    }

    imoveis.forEach((imovel) => {
      grid.appendChild(createPropertyCard(imovel));
    });
  } catch {
    grid.innerHTML =
      '<p class="properties-empty">Erro ao carregar imóveis. Atualize a página ou entre em contato conosco.</p>';
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderPropertiesGrid("properties-grid");
});
