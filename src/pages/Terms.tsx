export default function Terms() {
  const updated = 'May 9, 2025'

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[#3E2C1F] mb-2">Terms of Service</h1>
      <p className="text-sm text-[#9B8B7E] mb-10">Last updated: {updated}</p>

      <div className="prose prose-sm max-w-none text-[#4A3B30] leading-relaxed space-y-8">

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">1. About Us</h2>
          <p>
            Dear Momollie ("we," "us," or "our") sells handmade beeswax bread bags and related
            kitchen goods. By placing an order or using this website, you agree to these Terms of
            Service. If you do not agree, please do not use the site.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">2. Products</h2>
          <p>
            All items are handmade in small batches. Minor variations in color, texture, and size
            are inherent to the handcrafted process and are not considered defects. Product images
            are representative; the item you receive may differ slightly.
          </p>
          <p className="mt-2">
            We reserve the right to discontinue any product or limit quantities at any time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">3. Pricing & Payment</h2>
          <p>
            All prices are in US dollars. We reserve the right to change prices at any time;
            changes will not affect orders already placed. Payment is processed securely through
            Stripe. We do not store your card information.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">4. Shipping</h2>
          <p>
            We ship via USPS within the United States. Estimated delivery times are provided at
            checkout and are not guaranteed. We are not responsible for delays caused by the
            carrier, weather, or circumstances outside our control.
          </p>
          <p className="mt-2">
            Risk of loss passes to you upon delivery to the carrier. If your order is lost or
            significantly delayed, please contact us at{' '}
            <a href="mailto:hello@momollie.me" className="text-[#E8B55F] hover:text-[#D4A04D]">
              hello@momollie.me
            </a>{' '}
            and we will work with you to resolve the issue.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">5. Returns & Refunds</h2>
          <p>
            Because our products are handmade and food-adjacent, we accept returns only for items
            that arrive damaged or defective. Please contact us within <strong>7 days</strong> of
            delivery with a photo of the issue and your order number.
          </p>
          <p className="mt-2">
            Approved refunds will be issued to your original payment method within 5–10 business
            days. We do not accept returns for change-of-mind purchases.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">6. Intellectual Property</h2>
          <p>
            All content on this site — including photographs, copy, branding, and product designs
            — is owned by Dear Momollie and may not be reproduced, copied, or distributed without
            our written permission.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Dear Momollie shall not be liable for any
            indirect, incidental, special, or consequential damages arising from your use of our
            products or website. Our total liability shall not exceed the amount you paid for the
            order in question.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">8. Governing Law</h2>
          <p>
            These terms are governed by the laws of the State of Texas, United States, without
            regard to conflict-of-law principles. Any disputes shall be resolved in the courts of
            that state.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">9. Changes to These Terms</h2>
          <p>
            We may update these Terms at any time. Continued use of the site after changes are
            posted constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#3E2C1F] mb-2">10. Contact</h2>
          <p>
            Questions about these Terms?{' '}
            <a href="mailto:hello@momollie.me" className="text-[#E8B55F] hover:text-[#D4A04D]">
              hello@momollie.me
            </a>
          </p>
        </section>

      </div>
    </div>
  )
}
