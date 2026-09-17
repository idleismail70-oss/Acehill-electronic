function siteUrl(path = "") {
  const base = (STORE.website || "https://acehillonlinemarket.co.ke").replace(/\/$/, "");
  if (!path) return `${base}/`;
  return `${base}/${path.replace(/^\//, "")}`;
}

function injectJsonLd(data) {
  document.querySelectorAll("script[data-seo-jsonld]").forEach((el) => el.remove());
  const el = document.createElement("script");
  el.type = "application/ld+json";
  el.dataset.seoJsonld = "true";
  el.textContent = JSON.stringify(data);
  document.head.appendChild(el);
}

function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function businessSchema() {
  const orgId = siteUrl("#organization");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: "Ace Hill Electronics",
        url: siteUrl(),
        logo: siteUrl("images/logo.svg"),
        email: STORE.email,
        sameAs: [],
        areaServed: [
          { "@type": "City", name: "Garissa" },
          { "@type": "City", name: "Nairobi" },
          { "@type": "AdministrativeArea", name: "North Eastern Kenya" },
          { "@type": "Country", name: "Kenya" }
        ]
      },
      ...STORE.branches.map((branch) => ({
        "@type": ["ElectronicsStore", "LocalBusiness"],
        name: `Ace Hill Electronics ${branch.city}`,
        image: siteUrl("images/logo.svg"),
        url: siteUrl("contact.html"),
        telephone: branch.phoneHref.replace("tel:", ""),
        priceRange: "KES",
        address: {
          "@type": "PostalAddress",
          streetAddress: branch.address,
          addressLocality: branch.city,
          addressCountry: "KE"
        },
        areaServed: branch.city === "Garissa"
          ? ["Garissa", "North Eastern Kenya", "Wajir", "Mandera"]
          : ["Nairobi", "Eastleigh", "Nairobi County"],
        hasMap: mapsUrl(branch),
        parentOrganization: { "@id": orgId },
        openingHoursSpecification: STORE.hours.map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: h.day.includes("Sunday")
            ? "Sunday"
            : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: h.day.includes("Sunday") ? "10:00" : "08:00",
          closes: h.day.includes("Sunday") ? "16:00" : "19:00"
        }))
      }))
    ]
  };
}

function productSchema(product) {
  const availability = {
    "In Stock": "https://schema.org/InStock",
    "Out of Stock": "https://schema.org/OutOfStock",
    "Pre-order": "https://schema.org/PreOrder"
  };
  return {
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    sku: product.sku,
    model: product.model,
    category: `${product.category} / ${product.subcategory}`,
    image: siteUrl(productImages(product)[0]),
    description: `${product.description} Available from Ace Hill Electronics in Garissa, Nairobi and North Eastern Kenya.`,
    offers: {
      "@type": "Offer",
      url: siteUrl(`product.html?id=${product.id}`),
      priceCurrency: "KES",
      price: effectivePrice(product),
      availability: availability[product.availability] || "https://schema.org/InStock",
      areaServed: ["Garissa", "Nairobi", "North Eastern Kenya", "Kenya"],
      seller: { "@type": "Organization", name: "Ace Hill Electronics" }
    }
  };
}

function injectSeo({ title, description, path = "", type = "website" } = {}) {
  if (title) document.title = title;
  if (description) {
    setMeta("description", description);
    setMeta("og:description", description, "property");
  }
  if (title) setMeta("og:title", title, "property");
  setMeta("og:type", type, "property");
  setMeta("og:url", siteUrl(path), "property");
  setMeta("og:image", siteUrl("images/logo.svg"), "property");
  setMeta("og:locale", "en_KE", "property");
  setMeta("og:site_name", "Ace Hill Electronics", "property");
  setMeta("twitter:card", "summary");
  setMeta("geo.region", "KE");
  setMeta("geo.placename", "Garissa, Nairobi, North Eastern Kenya");
  let canonical = document.head.querySelector("link[rel='canonical']");
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = siteUrl(path);
  injectJsonLd(businessSchema());
}
