import { site } from "@/config/site";
import { areas, getArea } from "@/data/areas";
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
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "AutomotiveBusiness"],
    "@id": `${details.url}/#business`,
    name: details.name,
    ...buildBusinessSchemaFields(details),
    description: details.description,
    url: details.url,
    areaServed: areas.map((area) => ({ "@type": "City", name: area.short })),
    makesOffer: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Cash for old, damaged and junk cars with free vehicle pickup",
          areaServed: [
            "Brisbane",
            "Gold Coast",
            "Toowoomba",
            "South East Queensland",
          ],
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Free car removal across South East Queensland",
          areaServed: ["Brisbane", "Gold Coast", "Toowoomba"],
        },
      },
      ...localPages.map((page) => {
        const area = getArea(page.areaSlug);
        return {
          "@type": "Offer",
          url: `${details.url}/${page.slug}`,
          itemOffered: {
            "@type": "Service",
            name: page.serviceName,
            serviceType: page.serviceType,
            ...(area ? { areaServed: area.short } : {}),
          },
        };
      }),
    ],
  };
}

export const businessJsonLd = buildBusinessJsonLd();
