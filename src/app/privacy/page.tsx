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
    title: "Service providers",
    body: "Quote requests are staged in a private Vercel Blob store while Resend, our email delivery service, sends the enquiry to our configured business mailbox. That mailbox is currently provided by Google. If website analytics are enabled, Google Analytics processes device, browser, approximate location and usage information as described below. These providers receive the information needed to perform their service and operate under their own security and retention controls.",
  },
  {
    title: "Storage and security",
    body: "Quote requests are delivered to our access-controlled business mailbox and handled by our team. The private delivery outbox is removed after confirmed email acceptance. Failed or unresolved outbox records are recovered or deleted automatically and have a maximum retention period of 30 days. Non-personal delivery receipts are retained for up to 7 days to prevent duplicate submissions. Email copies may be retained for the period reasonably required to prepare the quote, complete an accepted sale, meet legal obligations and resolve disputes. We take reasonable steps to protect information from misuse, loss and unauthorised access.",
  },
  {
    title: "Overseas processing",
    body: "Vercel, Resend and Google operate global infrastructure and may process or store information outside Australia. Their processing locations and subprocessors can change. Contact us before submitting if you need more information about the providers used for your enquiry.",
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
          <p className="text-sm text-slate-500">Effective 31 August 2026.</p>
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
              . If you have a privacy complaint, contact us using that number and
              explain the issue. We will investigate and respond within a
              reasonable time. If you remain dissatisfied, you may contact the
              Office of the Australian Information Commissioner. This policy is
              intended to describe our current practices and should be reviewed
              against the Australian Privacy Act 1988 (Cth) and other applicable
              requirements.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
