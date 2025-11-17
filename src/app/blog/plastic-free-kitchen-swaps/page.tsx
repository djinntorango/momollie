import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plastic-Free Kitchen Swaps for Home Bakers: Easy Sustainable Changes | DearMomollie',
  description: 'Simple plastic-free swaps every home baker can make. Reduce waste while improving your baking routine with these sustainable kitchen alternatives.',
  keywords: 'plastic-free kitchen, sustainable baking, eco-friendly kitchen, zero waste baking, kitchen swaps',
  openGraph: {
    title: 'Plastic-Free Kitchen Swaps for Home Bakers',
    description: 'Easy sustainable swaps to make your baking routine plastic-free and eco-friendly.',
    images: ['/blog-sustainable-kitchen.jpg'],
  },
};

export default function PlasticFreeKitchenPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        <div className="text-center mb-6">
          <span className="text-green-600 font-medium">Eco-Living</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            Plastic-Free Kitchen Swaps for Home Bakers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Simple, practical swaps that help you bake sustainably while reducing plastic waste in your kitchen.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <span>Published November 16, 2024</span>
            <span>•</span>
            <span>7 min read</span>
          </div>
        </div>
        <div className="relative h-96 w-full rounded-lg overflow-hidden">
          <Image
            src="/blog-sustainable-kitchen.jpg"
            alt="Sustainable kitchen setup with eco-friendly baking tools"
            fill
            className="object-cover"
          />
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-700 leading-relaxed mb-8">
          As home bakers, we create so much joy with our sourdough starters and fresh loaves. But the
          plastic waste that comes with modern baking—plastic wrap, storage bags, disposable containers—
          doesn&apos;t spark quite the same feeling.
        </p>

        <p>
          The good news? Going plastic-free in your baking routine is easier than you think. These simple
          swaps will help you reduce waste without sacrificing convenience or quality.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">Why Plastic-Free Matters for Bakers</h2>

        <p>
          Home baking already connects us to traditional, slower ways of creating food. Removing plastic
          from the process feels natural—and it comes with real benefits:
        </p>

        <ul className="space-y-2 my-6">
          <li>Better bread storage (moisture regulation vs. condensation)</li>
          <li>Healthier kitchen (no microplastics in food)</li>
          <li>Cost savings over time (reusable vs. single-use)</li>
          <li>Less waste going to landfills</li>
        </ul>

        <h2 className="text-3xl font-bold mt-12 mb-6">Essential Plastic-Free Baking Swaps</h2>

        <div className="space-y-8 my-12">
          {/* Swap 1 */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-4 text-green-700">
              1. Plastic Bread Bags → Beeswax Bread Bags
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-red-600 mb-2">❌ The Problem:</p>
                <p className="text-sm">
                  Plastic bags trap moisture, making crusts soggy. They promote mold growth and
                  create single-use waste. Plus, they leach chemicals when storing warm bread.
                </p>
              </div>
              <div>
                <p className="font-semibold text-green-600 mb-2">✅ The Swap:</p>
                <p className="text-sm">
                  Beeswax-lined bread bags allow proper air circulation while preventing bread from
                  drying out. They&apos;re reusable for years, naturally antimicrobial, and keep
                  bread fresh for 5-7 days.
                </p>
              </div>
            </div>

            <p className="text-sm italic text-gray-600">
              <strong>Impact:</strong> One beeswax bag replaces 100+ plastic bags per year
            </p>
          </div>

          {/* Swap 2 */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-4 text-green-700">
              2. Plastic Wrap → Beeswax Wraps or Bowl Covers
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-red-600 mb-2">❌ The Problem:</p>
                <p className="text-sm">
                  Plastic wrap for covering rising dough or storing ingredients is wasteful and
                  doesn&apos;t create an airtight seal. It often tears or sticks to itself.
                </p>
              </div>
              <div>
                <p className="font-semibold text-green-600 mb-2">✅ The Swap:</p>
                <p className="text-sm">
                  Beeswax wraps mold to bowls with the warmth of your hands. For proofing dough,
                  use a damp kitchen towel or reusable bowl cover. Both options are washable and
                  reusable.
                </p>
              </div>
            </div>

            <p className="text-sm italic text-gray-600">
              <strong>Impact:</strong> Eliminates hundreds of feet of plastic wrap annually
            </p>
          </div>

          {/* Swap 3 */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-4 text-green-700">
              3. Plastic Measuring Cups → Glass or Stainless Steel
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-red-600 mb-2">❌ The Problem:</p>
                <p className="text-sm">
                  Plastic measuring cups absorb odors, stain easily, and degrade with use. They
                  can warp in the dishwasher and aren&apos;t as accurate over time.
                </p>
              </div>
              <div>
                <p className="font-semibold text-green-600 mb-2">✅ The Swap:</p>
                <p className="text-sm">
                  Glass measuring cups are durable, heat-safe, and easy to clean. Stainless steel
                  measuring spoons and cups last decades without degrading. Both give more precise
                  measurements.
                </p>
              </div>
            </div>

            <p className="text-sm italic text-gray-600">
              <strong>Bonus:</strong> Can be used for hot liquids and won&apos;t harbor bacteria
            </p>
          </div>

          {/* Swap 4 */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-4 text-green-700">
              4. Plastic Storage Containers → Glass Jars
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-red-600 mb-2">❌ The Problem:</p>
                <p className="text-sm">
                  Plastic containers for flour, sugar, and other ingredients can leach chemicals
                  and retain odors. They often crack or become cloudy.
                </p>
              </div>
              <div>
                <p className="font-semibold text-green-600 mb-2">✅ The Swap:</p>
                <p className="text-sm">
                  Large glass jars keep ingredients fresh without chemical concerns. Mason jars
                  work perfectly for sourdough starters, active yeast, and smaller quantities.
                  They&apos;re airtight and transparent.
                </p>
              </div>
            </div>

            <p className="text-sm italic text-gray-600">
              <strong>Tip:</strong> Save pasta sauce jars—they&apos;re perfect for baking ingredients
            </p>
          </div>

          {/* Swap 5 */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-4 text-green-700">
              5. Parchment Paper → Reusable Baking Mats
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-red-600 mb-2">❌ The Problem:</p>
                <p className="text-sm">
                  While better than plastic, parchment paper is still single-use. It adds up
                  quickly when you bake regularly.
                </p>
              </div>
              <div>
                <p className="font-semibold text-green-600 mb-2">✅ The Swap:</p>
                <p className="text-sm">
                  Silicone baking mats last for thousands of uses. They&apos;re non-stick, heat-safe
                  up to 480°F, and eliminate the need for oils or sprays. Clean with soap and water.
                </p>
              </div>
            </div>

            <p className="text-sm italic text-gray-600">
              <strong>Alternative:</strong> Well-seasoned cast iron or naturally non-stick ceramic bakeware
            </p>
          </div>

          {/* Swap 6 */}
          <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
            <h3 className="text-2xl font-bold mb-4 text-green-700">
              6. Disposable Piping Bags → Reusable Cloth Bags
            </h3>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-semibold text-red-600 mb-2">❌ The Problem:</p>
                <p className="text-sm">
                  Disposable piping bags create waste with every use and can&apos;t handle hot
                  fillings. They&apos;re flimsy and often tear.
                </p>
              </div>
              <div>
                <p className="font-semibold text-green-600 mb-2">✅ The Swap:</p>
                <p className="text-sm">
                  Canvas or silicone reusable piping bags are stronger, washable, and work with
                  any piping tip. They pay for themselves after just a few uses.
                </p>
              </div>
            </div>

            <p className="text-sm italic text-gray-600">
              <strong>Note:</strong> Turn inside-out to wash thoroughly between uses
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Additional Sustainable Baking Swaps</h2>

        <div className="bg-gray-50 p-6 rounded-lg my-8">
          <ul className="space-y-4">
            <li>
              <strong>Paper towels → Unpaper towels or flour sack towels</strong>
              <p className="text-sm text-gray-600 mt-1">
                Use washable cloth towels for everything from drying dishes to covering proofing dough
              </p>
            </li>
            <li>
              <strong>Plastic cutting boards → Wood or bamboo</strong>
              <p className="text-sm text-gray-600 mt-1">
                Better for your knives, naturally antimicrobial, and completely biodegradable
              </p>
            </li>
            <li>
              <strong>Plastic bench scrapers → Stainless steel</strong>
              <p className="text-sm text-gray-600 mt-1">
                More durable, easier to clean, and lasts a lifetime
              </p>
            </li>
            <li>
              <strong>Plastic-packaged flour → Bulk bins or paper bags</strong>
              <p className="text-sm text-gray-600 mt-1">
                Bring your own containers to stores with bulk sections, or choose paper-packaged flour
              </p>
            </li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Making the Transition</h2>

        <p>
          You don&apos;t need to replace everything at once. Here&apos;s a practical approach:
        </p>

        <div className="bg-green-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-4">Month 1: Bread Storage</h3>
          <p className="mb-4">
            Start with beeswax bread bags—the swap with the biggest immediate impact. You&apos;ll notice
            better bread freshness right away.
          </p>

          <h3 className="text-xl font-semibold mb-4">Month 2: Proofing & Covering</h3>
          <p className="mb-4">
            Replace plastic wrap with beeswax wraps and bowl covers. Use kitchen towels for dough proofing.
          </p>

          <h3 className="text-xl font-semibold mb-4">Month 3: Storage Containers</h3>
          <p className="mb-4">
            Gradually replace plastic storage with glass jars as you use up current supplies. Start saving
            glass jars from purchased goods.
          </p>

          <h3 className="text-xl font-semibold mb-4">Month 4+: Tools & Equipment</h3>
          <p>
            Replace plastic tools only as they wear out. Prioritize items you use most frequently.
          </p>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">The Cost Question</h2>

        <p>
          Yes, reusable alternatives have higher upfront costs. But here&apos;s the math:
        </p>

        <div className="my-8 p-6 bg-blue-50 rounded-lg">
          <p className="font-semibold mb-4">Beeswax Bread Bag Example:</p>
          <ul className="space-y-2 text-sm">
            <li>• One beeswax bag: $15-25</li>
            <li>• Lasts: 2-3 years (or longer with care)</li>
            <li>• Replaces: 100+ plastic bags/year</li>
            <li>• Savings over 3 years: $30-50 (plus environmental impact)</li>
          </ul>
        </div>

        <p>
          Most sustainable swaps pay for themselves within a year while significantly reducing waste.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">Small Changes, Big Impact</h2>

        <blockquote className="border-l-4 border-green-600 pl-6 italic text-lg text-gray-700 my-8">
          &quot;I started with just beeswax bread bags and cloth bowl covers. A year later, my baking
          routine is nearly plastic-free, and I haven&apos;t noticed any inconvenience—just better
          bread and less waste.&quot;
        </blockquote>

        <p>
          The beauty of these swaps is that they often improve your baking results while reducing waste.
          Beeswax bags keep bread fresher. Glass jars keep ingredients better organized. Silicone mats
          bake more evenly.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">Your Plastic-Free Baking Checklist</h2>

        <div className="bg-gray-50 p-6 rounded-lg my-8">
          <p className="font-semibold mb-4">Start Here (Highest Impact):</p>
          <ul className="space-y-2 mb-6">
            <li>☐ Beeswax bread bags for storage</li>
            <li>☐ Glass jars for ingredients</li>
            <li>☐ Beeswax wraps or bowl covers</li>
            <li>☐ Silicone baking mats</li>
          </ul>

          <p className="font-semibold mb-4">Next Steps:</p>
          <ul className="space-y-2 mb-6">
            <li>☐ Stainless steel measuring cups</li>
            <li>☐ Wooden or bamboo cutting boards</li>
            <li>☐ Reusable piping bags</li>
            <li>☐ Cloth kitchen towels</li>
          </ul>

          <p className="font-semibold mb-4">Advanced:</p>
          <ul className="space-y-2">
            <li>☐ Bulk flour purchases (bring containers)</li>
            <li>☐ Compostable dish brushes</li>
            <li>☐ Natural cleaning products in reusable bottles</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">The Ripple Effect</h2>

        <p>
          When you bake plastic-free, you&apos;re not just reducing your own waste. You&apos;re showing
          friends and family that sustainable baking is possible and practical. You&apos;re supporting
          companies that prioritize the environment. And you&apos;re creating healthier habits that
          often extend to other areas of your kitchen and life.
        </p>

        <p className="mt-6">
          Start with one swap. See how it feels. Then keep going. Before you know it, your baking routine
          will be producing amazing bread and zero plastic waste.
        </p>
      </div>

      {/* Related Products */}
      <section className="mt-16 p-6 bg-green-50 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Start Your Plastic-Free Baking Journey</h3>
        <p className="text-gray-600 mb-6">
          Our beeswax bread bags are the perfect first step toward a more sustainable baking routine.
        </p>
        <div className="flex gap-4">
          <Link
            href="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Shop Sustainable Products
          </Link>
          <Link
            href="https://dearmomollie.etsy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
          >
            Visit Etsy Shop
          </Link>
        </div>
      </section>

      {/* Navigation */}
      <nav className="mt-12 pt-8 border-t">
        <Link
          href="/blog"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          ← Back to Blog
        </Link>
      </nav>
    </article>
  );
}
