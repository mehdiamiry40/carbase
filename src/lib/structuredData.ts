import { site } from "@/config/site";
import { localPages } from "@/data/localPages";
import { buildBusinessSchemaFields } from "@/lib/businessSchemaFields.mjs";

export type BusinessSchemaDetails = {
  name: string;
  operatorName?: string;
  operatingBase?: string;
  description: string;
  url: string;
  phone?: string;
  phoneInternational?: string;
  email?: string;
  abn?: string;
  opens?: string;
  closes?: string;
};

/**
 * Build the sitewide business schema using verified values only.
 *
 * Optional contact, identity and opening-hours fields are omitted when their
 * source values are absent. A physical address is deliberately omitted because
 * this is a service-area business with no customer-facing public address. A
 * price range is also omitted because no verified range has been supplied.
 */
export function buildBusinessJsonLd(details: BusinessSchemaDetails = site) {
  const operatorName = details.operatorName?.trim();
  const {
    openingHoursSpecification: _openingHoursSpecification,
    ...organizationFields
  } = buildBusinessSchemaFields(details);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${details.url}/#business`,
    name: operatorName || details.name,
    ...(operatorName && operatorName !== details.name
      ? {
          alternateName: details.name,
          brand: {
            "@type": "Brand",
            "@id": `${details.url}/#brand`,
            name: details.name,
            logo: `${details.url}/icon.svg`,
          },
        }
      : {}),
    ...organizationFields,
    description: details.description,
    url: details.url,
    logo: `${details.url}/icon.svg`,
    ...(details.operatingBase?.trim()
      ? {
          location: {
            "@type": "Place",
            name: details.operatingBase.trim(),
          },
        }
      : {}),
    areaServed: [
      { "@type": "City", name: "Toowoomba" },
      { "@type": "AdministrativeArea", name: "Toowoomba Region" },
    ],
    makesOffer: localPages.map((page) => ({
      "@type": "Offer",
      url: `${details.url}/${page.slug}`,
      itemOffered: { "@id": `${details.url}/${page.slug}#service` },
    })),
  };
}

export const businessJsonLd = buildBusinessJsonLd();
