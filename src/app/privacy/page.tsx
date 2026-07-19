import type { Metadata } from "next";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your personal information.`,
  robots: { index: false },
};

// NOTE: This is a general-purpose starter policy, not legal advice.
// Have it reviewed before launch and adjust it to match your actual practices.

export default function PrivacyPage() {
  return (
    <section className="py-16">
      <div className="prose-slate mx-auto max-w-3xl px-4 sm:px-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Privacy policy
        </h1>
        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-600 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900">
          <div>
            <h2>What we collect</h2>
            <p className="mt-2">
              When you request a quote we collect the details you provide: your
              name, phone number, email address, suburb, information about your
              vehicle and any photos you choose to attach.
            </p>
          </div>
          <div>
            <h2>How we use it</h2>
            <p className="mt-2">
              We use your details solely to prepare your quote, contact you
              about selling your vehicle and, if you accept an offer, to
              complete the purchase and transfer paperwork. We do not sell your
              personal information or share it with third parties for their
              marketing.
            </p>
          </div>
          <div>
            <h2>Storage and security</h2>
            <p className="mt-2">
              Quote requests are delivered to us by email and handled only by
              our team. We take reasonable steps to protect your information
              from misuse, loss and unauthorised access.
            </p>
          </div>
          <div>
            <h2>Access and contact</h2>
            <p className="mt-2">
              You can ask us at any time what information we hold about you, or
              ask us to correct or delete it, by emailing{" "}
              <a
                href={`mailto:${site.email}`}
                className="font-semibold text-brand-700 hover:underline"
              >
                {site.email}
              </a>
              . This policy is provided under the Australian Privacy Principles
              in the Privacy Act 1988 (Cth).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
