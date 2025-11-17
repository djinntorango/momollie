import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Store Sourdough Bread: Keep It Fresh for Days | DearMomollie Blog',
  description: 'Learn the best methods to store sourdough bread and keep it fresh longer. Expert tips for maintaining that perfect crust and soft interior.',
  keywords: 'sourdough storage, how to store sourdough, keep bread fresh, sourdough bread tips, bread storage methods',
  openGraph: {
    title: 'How to Store Sourdough Bread: Keep It Fresh for Days',
    description: 'Expert tips for storing sourdough bread to maintain freshness and texture for days.',
    images: ['/bake.png'],
  },
};

export default function SourdoughStoragePage() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        <div className="text-center mb-6">
          <span className="text-amber-600 font-medium">Baking Mastery</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            How to Store Sourdough Bread: Keep It Fresh for Days
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The secret to maintaining that perfect sourdough crust and pillowy interior lies in proper storage. Here&apos;s everything you need to know.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <span>Published November 16, 2024</span>
            <span>•</span>
            <span>6 min read</span>
          </div>
        </div>
        <div className="relative h-96 w-full rounded-lg overflow-hidden">
          <Image
            src="/bake.png"
            alt="Fresh sourdough bread ready for storage"
            fill
            className="object-cover"
          />
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-700 leading-relaxed mb-8">
          You&apos;ve spent hours nurturing your starter, folding your dough, and baking the perfect loaf.
          Now comes the crucial question: how do you store sourdough bread so it stays fresh and delicious
          for days instead of going stale overnight?
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">Why Sourdough Storage Is Different</h2>

        <p>
          Sourdough bread has unique characteristics that make storage particularly important. The naturally
          fermented dough creates a thick, crusty exterior and a moist, chewy interior. Store it wrong, and
          you&apos;ll end up with either a rock-hard loaf or a soggy mess.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">The Golden Rule: Wait Before Storing</h2>

        <div className="bg-amber-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-4">Critical First Step:</h3>
          <p className="mb-4">
            <strong>Never store warm bread.</strong> Let your sourdough cool completely on a wire rack for
            at least 2-3 hours after baking. This allows excess moisture to escape and prevents condensation
            that can make your crust soggy.
          </p>
          <p>
            Patience here pays off—cutting into hot bread not only affects storage but also changes the
            texture of the crumb.
          </p>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Best Storage Methods for Sourdough</h2>

        <h3 className="text-2xl font-semibold mt-8 mb-4">1. Beeswax Bread Bags (Our Top Pick)</h3>
        <p>
          Beeswax-lined bags offer the perfect balance of breathability and moisture retention. The natural
          beeswax coating allows air circulation while preventing the bread from drying out completely.
        </p>
        <ul className="space-y-2 my-6">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Keeps crust crispy while maintaining soft interior</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Natural antimicrobial properties prevent mold</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Reusable and eco-friendly</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>Keeps bread fresh for 5-7 days</span>
          </li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-4">2. Linen Bread Bag</h3>
        <p>
          Linen allows excellent air circulation, similar to beeswax bags. Store cut-side down in the bag
          to protect the crumb while allowing the crust to breathe.
        </p>
        <p className="mt-4">
          <strong>Duration:</strong> 3-5 days
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-4">3. Paper Bag (Short-Term)</h3>
        <p>
          For day-to-day storage, a paper bag works well. However, it allows more moisture to escape,
          so bread will dry out faster than with other methods.
        </p>
        <p className="mt-4">
          <strong>Duration:</strong> 1-2 days
        </p>

        <h3 className="text-2xl font-semibold mt-8 mb-4">4. Bread Box</h3>
        <p>
          A bread box provides a dark, consistent environment. Store your sourdough cut-side down directly
          on a cutting board or wrapped in a kitchen towel.
        </p>
        <p className="mt-4">
          <strong>Duration:</strong> 3-4 days
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">What NOT to Do</h2>

        <div className="bg-red-50 border-l-4 border-red-400 p-6 my-8">
          <h3 className="text-xl font-semibold text-red-800 mb-4">Avoid These Common Mistakes:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span><strong>Plastic bags:</strong> Trap moisture, making the crust soggy and promoting mold</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span><strong>Refrigerator:</strong> Accelerates staling and dries out bread faster</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">✗</span>
              <span><strong>Airtight containers:</strong> Similar to plastic bags, they trap too much moisture</span>
            </li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Storing Pre-Sliced vs. Whole Loaves</h2>

        <p>
          <strong>Whole loaves</strong> stay fresh longer because there&apos;s less exposed crumb. Store them
          cut-side down to protect the interior.
        </p>

        <p className="mt-4">
          <strong>Pre-sliced bread</strong> dries out faster. If you need to slice ahead, wrap tightly in
          a beeswax bag or linen cloth and consume within 2-3 days.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">Freezing Sourdough for Long-Term Storage</h2>

        <p>
          For storage beyond a week, freezing is your best option:
        </p>

        <ol className="list-decimal list-inside space-y-3 my-6">
          <li><strong>Cool completely:</strong> Let bread cool to room temperature</li>
          <li><strong>Slice or keep whole:</strong> Pre-slice for convenience or freeze whole</li>
          <li><strong>Wrap well:</strong> Use beeswax wraps, then place in a freezer bag</li>
          <li><strong>Label and date:</strong> Frozen sourdough keeps for 3 months</li>
          <li><strong>Thaw properly:</strong> Leave at room temperature for a few hours, or toast frozen slices</li>
        </ol>

        <h2 className="text-3xl font-bold mt-12 mb-6">Reviving Day-Old Sourdough</h2>

        <p>
          Even with perfect storage, sourdough can lose some of its magic after a day or two. Here&apos;s
          how to bring it back to life:
        </p>

        <div className="bg-gray-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-4">Reviving Technique:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Preheat oven to 350°F (175°C)</li>
            <li>Run the crust under water very briefly</li>
            <li>Place directly on oven rack for 5-10 minutes</li>
            <li>Let cool for a few minutes before slicing</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600">
            This creates steam inside the loaf, refreshing both crust and crumb.
          </p>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Quick Storage Guide by Timeline</h2>

        <div className="grid md:grid-cols-3 gap-6 my-8">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-amber-600 mb-2">1-2 Days</h4>
            <p className="text-sm text-gray-600">Paper bag or bread box, cut-side down</p>
          </div>
          <div className="border rounded-lg p-4 bg-amber-50">
            <h4 className="font-semibold text-amber-600 mb-2">3-7 Days</h4>
            <p className="text-sm text-gray-600">Beeswax bread bag or linen bag (recommended)</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-amber-600 mb-2">1-3 Months</h4>
            <p className="text-sm text-gray-600">Freeze in beeswax wrap + freezer bag</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">The Bottom Line</h2>

        <p>
          The best way to store sourdough bread is in a breathable container that maintains some moisture
          while allowing air circulation. Beeswax bread bags strike this perfect balance, keeping your
          artisan loaves fresh for nearly a week without any of the sogginess or staleness that comes
          with plastic or paper bags.
        </p>

        <p className="mt-4">
          With proper storage, you can enjoy every slice of your homemade sourdough at its best—crispy
          crust, tender crumb, and all that delicious tangy flavor you worked so hard to create.
        </p>
      </div>

      {/* Related Products */}
      <section className="mt-16 p-6 bg-amber-50 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Keep Your Sourdough Fresh Naturally</h3>
        <p className="text-gray-600 mb-6">
          Try our handcrafted beeswax bread bags—the perfect storage solution for your homemade sourdough.
        </p>
        <div className="flex gap-4">
          <Link
            href="/products"
            className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Shop Bread Bags
          </Link>
          <Link
            href="https://dearmomollie.etsy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-amber-600 text-amber-600 px-6 py-3 rounded-lg hover:bg-amber-50 transition-colors"
          >
            Visit Etsy Shop
          </Link>
        </div>
      </section>

      {/* Navigation */}
      <nav className="mt-12 pt-8 border-t">
        <Link
          href="/blog"
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          ← Back to Blog
        </Link>
      </nav>
    </article>
  );
}
