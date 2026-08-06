import { site } from "@/config/site";
import { localPages } from "@/data/localPages";
import { buildBusinessSchemaFields } from "@/lib/businessSchemaFields.mjs";

export type BusinessSchemaDetails = {
  name: string;
  legalName?: string;
  description: string;
  url: string;
  phone?: string;
  email?: string;
  abn?: string;
  opens?: string;
  closes?: string;
};

/**
 * Build the sitewide business schema using verified values only.
 *
 * Optional contact, identity and opening-hours fields are omitted when their
 * source values are absent. A physical address and price range are deliberately
 * not emitted because neither has been supplied as a verified public value.
 */
export function buildBusinessJsonLd(details: BusinessSchemaDetails = site) {
  const {
    openingHoursSpecification: _openingHoursSpecification,
    ...organizationFields
  } = buildBusinessSchemaFields(details);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${details.url}/#business`,
    name: details.name,
    ...organizationFields,
    description: details.description,
    url: details.url,
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
