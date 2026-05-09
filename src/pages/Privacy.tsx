export default function Privacy() {
  const updated = 'May 9, 2025'

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[#3E2C1F] mb-2">Privacy Policy</h1>
      <p className="text-sm text-[#9B8B7E] mb-10">Last updated: {updated}</p>

      <div className="prose prose-sm max-w-none text-[#4A3B30] leading-relaxed space-y-8">

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">1. Who We Are</h2>
          <p>
            Dear Momollie operates the website at momollie.me. This policy explains what personal
            information we collect, how we use it, and your rights.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Order information</strong> — name, shipping address, and email address that
              you provide during checkout. Payment card details are collected and stored directly
              by Stripe; we never see or store them.
            </li>
            <li>
              <strong>Marketing consent</strong> — if you opt in at checkout, we store your email
              address to send promotional updates. You can unsubscribe at any time.
            </li>
            <li>
              <strong>Usage data</strong> — standard server logs and, if enabled, analytics data
              (e.g. Google Analytics) to understand how visitors use the site. This data is
              aggregated and not linked to your identity.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>To fulfill and ship your order</li>
            <li>To send order confirmations and shipping notifications</li>
            <li>To send marketing emails, only if you opted in</li>
            <li>To improve the website and detect fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">4. Third-Party Services</h2>
          <p>We share your information only as necessary to operate the business:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>
              <strong>Stripe</strong> — payment processing. Stripe's privacy policy governs how
              they handle card data.
            </li>
            <li>
              <strong>USPS / Shippo</strong> — your name and address are shared with the shipping
              carrier to deliver your order.
            </li>
            <li>
              <strong>Firebase (Google)</strong> — our backend database and hosting. Data is stored
              on Google infrastructure.
            </li>
          </ul>
          <p className="mt-2">We do not sell your personal information to any third party.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">5. Marketing Emails</h2>
          <p>
            If you opt in at checkout, we may send occasional emails about new products, promotions,
            or restocks. Every marketing email includes an unsubscribe link. You can also opt out
            at any time by emailing{' '}
            <a href="mailto:hello@momollie.me" className="text-[#E8B55F] hover:text-[#D4A04D]">
              hello@momollie.me
            </a>{' '}
            with "unsubscribe" in the subject line.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">6. Data Retention</h2>
          <p>
            Order records are retained for at least 7 years for tax and accounting purposes.
            Marketing consent records are retained until you unsubscribe. You may request deletion
            of your personal data (subject to legal retention requirements) by emailing us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">7. Your Rights</h2>
          <p>
            Depending on where you live, you may have the right to access, correct, or delete your
            personal information, or to object to certain uses. To exercise any of these rights,
            contact us at{' '}
            <a href="mailto:hello@momollie.me" className="text-[#E8B55F] hover:text-[#D4A04D]">
              hello@momollie.me
            </a>
            . We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">8. Cookies</h2>
          <p>
            We use cookies and similar technologies to keep your shopping cart and, if enabled,
            to collect analytics data. You can disable cookies in your browser settings, but some
            site features (such as the cart) may not work correctly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. The "Last updated" date at the top will
            reflect any changes. Continued use of the site after updates constitutes acceptance.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">10. Contact</h2>
          <p>
            Privacy questions or requests:{' '}
            <a href="mailto:hello@momollie.me" className="text-[#E8B55F] hover:text-[#D4A04D]">
              hello@momollie.me
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
