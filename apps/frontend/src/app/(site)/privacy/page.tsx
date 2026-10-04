import type { Metadata } from "next";
import { PageHeader } from "@/components/site/ui";
import { getSite } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Privacy policy",
    description:
      "How developerchoudhary.com handles contact details, analytics and optional location sharing.",
    path: "/privacy",
  });
}

export default async function PrivacyPage() {
  const site = await getSite();
  return (
    <>
      <PageHeader
        title="Privacy policy"
        lede="Short version: I collect only what I need to reply to you and understand how the site is used."
      />
      <section className="container-dc pb-20">
        <div className="rich max-w-[44rem]">
          <h2>What I collect</h2>
          <p>
            When you send the contact form I store the details you type (name, email, phone, company, message)
            so I can reply. When you submit a review I store the review and your email for verification; the
            email is never published.
          </p>
          <h2>Analytics</h2>
          <p>
            The site records page views with an anonymous visitor id stored in your browser, the page path,
            referrer, device type and country. IP addresses are hashed and never stored in plain text. No
            third-party analytics scripts run unless listed here.
          </p>
          <h2>Location sharing</h2>
          <p>
            You may be asked to share your location. This is optional. If you accept, your browser provides
            approximate coordinates which are stored with your visit and, if you contact me, with your
            enquiry, so I can respond in your time zone and understand where clients come from. You can
            decline at any time and nothing is collected.
          </p>
          <h2>Cookies and storage</h2>
          <p>
            The public site uses browser storage for the visitor id, theme preference and your location
            choice. No advertising cookies are used.
          </p>
          <h2>Retention and your rights</h2>
          <p>
            Enquiries are kept while we work together and for a reasonable period afterwards. Visit data older
            than 13 months is deleted automatically. Email {site.profile.email || "me"} to access or delete
            your data.
          </p>
          <h2>Hosting</h2>
          <p>
            Everything runs on infrastructure I operate. Data is not sold or shared with third parties beyond
            the email provider used to deliver notifications.
          </p>
          <p className="text-sm text-fg-subtle">Last updated October 2026.</p>
        </div>
      </section>
    </>
  );
}
