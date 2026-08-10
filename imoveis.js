// Carrega imóveis de content/imoveis.json (editável pelo painel /admin)

const IMOVEIS_JSON_URL = "content/imoveis.json";

function cardImageUrl(url) {
  if (!url) return "";
  if (url.includes("unsplash.com") && !url.includes("w=600")) {
    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}w=600&h=400&fit=crop`;
  }
  return url;
}

function normalizeCaracteristicas(list) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => (typeof item === "string" ? item : item.item || ""));
}

async function fetchImoveis() {
  const response = await fetch(IMOVEIS_JSON_URL);

  if (!response.ok) {
    throw new Error("Não foi possível carregar os imóveis.");
  }

  const data = await response.json();
  return data.imoveis.map((imovel) => ({
    ...imovel,
    caracteristicas: normalizeCaracteristicas(imovel.caracteristicas),
  }));
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

  const img = document.createElement("img");
  img.src = cardImageUrl(imovel.imagem);
  img.alt = imovel.imagemAlt || imovel.titulo;

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
  article.append(img, info);
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
