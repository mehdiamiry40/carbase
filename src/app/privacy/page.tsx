import { site, telHref } from "@/config/site";
import { pageMetadata } from "@/lib/metadata";
import { PageHero } from "@/components/sections";

export const metadata = pageMetadata({
  path: "/privacy",
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your personal information.`,
  index: false,
});

// NOTE: This is a general-purpose starter policy, not legal advice.
// Have it reviewed before launch and adjust it to match your actual practices.

const sections = [
  {
    title: "What we collect",
    body: "When you request a quote we collect the details you provide: your name, phone number, email address, suburb, information about your vehicle and any photos you choose to attach.",
  },
  {
    title: "How we use it",
    body: "We use your details solely to prepare your quote, contact you about selling your vehicle and, if you accept an offer, to complete the purchase and transfer paperwork. We do not sell your personal information or share it with third parties for their marketing.",
  },
  {
    title: "Storage and security",
    body: "Quote requests are delivered to us by email and handled only by our team. We take reasonable steps to protect your information from misuse, loss and unauthorised access.",
  },
  {
    title: "Website analytics",
    body: "We use Google Analytics to understand visits and interactions with this website, including successful quote requests and phone-link clicks. Google may process device, browser, approximate location and usage information and may use cookies for this purpose. We do not send the personal, vehicle or photo details from your quote request to Google Analytics. You can control or block cookies through your browser settings.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy policy" compact />
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl space-y-10 px-4 sm:px-6">
          <p className="text-[15px] leading-relaxed text-slate-600">
            {site.name} is operated by {site.operatorName}, ABN {site.abn}. In
            this policy, “we”, “us” and “our” refer to {site.operatorName}.
          </p>
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-xl font-bold text-slate-900">
                {s.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                {s.body}
              </p>
            </div>
          ))}
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Access and contact
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              You can ask us at any time what information we hold about you, or
              ask us to correct or delete it, by calling{" "}
              <a
                href={telHref}
                className="font-semibold text-brand-700 hover:underline"
              >
                {site.phone}
              </a>
              . This policy is provided under the Australian Privacy Principles
              in the Privacy Act 1988 (Cth).
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
