import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sustainable Kitchen Solutions: Simple Swaps for an Eco-Friendly Kitchen | DearMomollie',
  description: 'Transform your kitchen with simple eco-friendly swaps that reduce waste and promote sustainable living. Practical tips for a plastic-free kitchen.',
  keywords: 'sustainable kitchen, eco-friendly cooking, zero waste kitchen, plastic-free living, green kitchen tips',
  openGraph: {
    title: 'Sustainable Kitchen Solutions: Simple Swaps for an Eco-Friendly Kitchen',
    description: 'Discover practical ways to make your kitchen more sustainable with simple swaps that reduce waste and protect the environment.',
    images: ['/blog-sustainable-kitchen.jpg'],
  },
};

export default function SustainableKitchenPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-8">
        <div className="text-center mb-6">
          <span className="text-green-600 font-medium">Eco-Living</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            Sustainable Kitchen Solutions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your kitchen with simple eco-friendly swaps that reduce waste, save money, and create a healthier environment for your family.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <span>Published March 8, 2024</span>
            <span>•</span>
            <span>7 min read</span>
          </div>
        </div>
        <div className="relative h-96 w-full rounded-lg overflow-hidden">
          <Image
            src="/blog-sustainable-kitchen.jpg"
            alt="Eco-friendly kitchen with sustainable storage solutions"
            fill
            className="object-cover"
          />
        </div>
      </header>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-700 leading-relaxed mb-8">
          The kitchen is the heart of the home—and often the source of most household waste. But with thoughtful choices and simple swaps, your kitchen can become a model of sustainability that benefits both your family and the planet.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">The Hidden Cost of Kitchen Waste</h2>

        <p>
          The average family generates over 4 pounds of kitchen waste daily, much of it unnecessary packaging and single-use items. By making strategic changes, you can reduce this waste by up to 80% while often saving money in the process.
        </p>

        <div className="bg-red-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-4 text-red-800">Shocking Statistics:</h3>
          <ul className="space-y-2">
            <li>• Average family uses 500+ plastic bags annually for food storage</li>
            <li>• 80% of kitchen packaging is used once and discarded</li>
            <li>• Food waste accounts for 30% of household garbage</li>
            <li>• Single-use kitchen items cost families $400+ yearly</li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Storage Solutions That Make a Difference</h2>

        <p>
          Switching from single-use to reusable storage is one of the most impactful changes you can make. Here are the swaps that provide the biggest benefit:
        </p>

        <h3 className="text-2xl font-bold mt-8 mb-4">Replace Plastic Wrap</h3>
        <div className="grid md:grid-cols-2 gap-6 my-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-600 mb-2">Instead of Plastic Wrap:</h4>
            <ul className="text-sm space-y-1">
              <li>• Contains harmful chemicals</li>
              <li>• Non-recyclable</li>
              <li>• Expensive over time</li>
              <li>• Creates landfill waste</li>
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-600 mb-2">Use Beeswax Wraps:</h4>
            <ul className="text-sm space-y-1">
              <li>• Natural antimicrobial properties</li>
              <li>• Fully biodegradable</li>
              <li>• Reusable for 1+ years</li>
              <li>• Better food preservation</li>
            </ul>
          </div>
        </div>

        <h3 className="text-2xl font-bold mt-8 mb-4">Eliminate Plastic Storage Bags</h3>
        <p>
          Beeswax-lined fabric bags offer superior food preservation while eliminating hundreds of plastic bags from your routine. They're perfect for bread, produce, and bulk items.
        </p>

        <blockquote className="border-l-4 border-green-600 pl-6 italic text-lg text-gray-700 my-8">
          "Since switching to reusable storage solutions, we've cut our kitchen waste in half and our grocery bill by 15%. The food stays fresher longer too!"
          <cite className="block text-sm text-gray-500 mt-2">— Maria Rodriguez, Sustainable Living Advocate</cite>
        </blockquote>

        <h2 className="text-3xl font-bold mt-12 mb-6">Smart Shopping Strategies</h2>

        <p>
          Sustainable kitchens start at the store. How you shop determines how much waste you bring home.
        </p>

        <div className="bg-blue-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-4">Sustainable Shopping Checklist:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Bring Your Own:</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Reusable shopping bags</li>
                <li>✓ Produce bags for fruits/vegetables</li>
                <li>✓ Glass containers for bulk items</li>
                <li>✓ Coffee cup for coffee shops</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Choose Wisely:</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Bulk bins over packaged goods</li>
                <li>✓ Local, seasonal produce</li>
                <li>✓ Glass over plastic containers</li>
                <li>✓ Concentrated products</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Food Preservation Techniques</h2>

        <p>
          Proper storage extends food life significantly, reducing waste and saving money. Different foods require different approaches:
        </p>

        <div className="grid md:grid-cols-3 gap-4 my-8">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Leafy Greens</h4>
            <p className="text-sm mb-2">Wrap in damp cloth, store in breathable container</p>
            <p className="text-xs text-green-600">Extends life from 3 to 10 days</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Bread & Baked Goods</h4>
            <p className="text-sm mb-2">Store in beeswax-lined bags at room temperature</p>
            <p className="text-xs text-green-600">Keeps fresh 5-7 days vs 2-3 in plastic</p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">Cheese & Dairy</h4>
            <p className="text-sm mb-2">Wrap in beeswax wraps, allow breathing</p>
            <p className="text-xs text-green-600">Prevents moisture buildup and mold</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">DIY Kitchen Cleaners</h2>

        <p>
          Commercial cleaners often contain harsh chemicals and come in single-use packaging. Simple ingredients can clean just as effectively:
        </p>

        <div className="bg-amber-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-4">Essential Natural Cleaners:</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">All-Purpose Cleaner:</h4>
              <p className="text-sm text-gray-600">1 cup water + ½ cup white vinegar + 2 tbsp castile soap</p>
            </div>
            <div>
              <h4 className="font-medium">Degreaser:</h4>
              <p className="text-sm text-gray-600">¼ cup baking soda + dish soap + warm water</p>
            </div>
            <div>
              <h4 className="font-medium">Glass Cleaner:</h4>
              <p className="text-sm text-gray-600">1 cup water + ½ cup vinegar + 2 tbsp rubbing alcohol</p>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Composting Made Simple</h2>

        <p>
          Food scraps don't have to go to the landfill. Even apartment dwellers can compost with the right system:
        </p>

        <ul className="space-y-3 my-6">
          <li><strong>Countertop composters:</strong> Perfect for small spaces, reduce odors</li>
          <li><strong>Worm bins:</strong> Compact, efficient, produce rich fertilizer</li>
          <li><strong>Bokashi systems:</strong> Fermentation-based, handles all food waste</li>
          <li><strong>Community gardens:</strong> Many accept food scraps for shared composting</li>
        </ul>

        <h2 className="text-3xl font-bold mt-12 mb-6">Energy-Efficient Cooking</h2>

        <p>
          How you cook matters as much as what you cook. Simple changes can significantly reduce your kitchen's energy footprint:
        </p>

        <div className="grid md:grid-cols-2 gap-6 my-8">
          <div>
            <h4 className="font-semibold mb-3">Smart Cooking Tips:</h4>
            <ul className="text-sm space-y-2">
              <li>• Use lids to reduce cooking time by 25%</li>
              <li>• Match pot size to burner size</li>
              <li>• Batch cook meals to reduce oven use</li>
              <li>• Use residual heat for gentle cooking</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Appliance Efficiency:</h4>
            <ul className="text-sm space-y-2">
              <li>• Convection ovens cook 25% faster</li>
              <li>• Pressure cookers save 70% cooking time</li>
              <li>• Induction cooktops are 85% efficient</li>
              <li>• Air fryers use 75% less energy than ovens</li>
            </ul>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">The Ripple Effect</h2>

        <p>
          Sustainable kitchen practices extend beyond waste reduction. They often lead to:
        </p>

        <ul className="space-y-2 my-6">
          <li>• Healthier eating habits (less processed food)</li>
          <li>• Stronger connection to food sources</li>
          <li>• Cost savings (reusables pay for themselves)</li>
          <li>• Teaching opportunities for children</li>
          <li>• Community building through shared values</li>
        </ul>

        <h2 className="text-3xl font-bold mt-12 mb-6">Start Small, Think Big</h2>

        <p>
          You don't need to transform your kitchen overnight. Start with one or two changes and build momentum. Each sustainable choice makes the next one easier.
        </p>

        <div className="bg-green-50 p-6 rounded-lg my-8">
          <h4 className="font-semibold mb-3">Your 30-Day Challenge:</h4>
          <ol className="list-decimal list-inside space-y-2">
            <li>Replace plastic wrap with beeswax wraps</li>
            <li>Start using reusable produce bags</li>
            <li>Set up a simple composting system</li>
            <li>Make one DIY cleaning product</li>
            <li>Plan weekly meals to reduce food waste</li>
          </ol>
          <p className="mt-4 text-sm font-medium">Small changes, big impact!</p>
        </div>

        <p>
          Remember: every sustainable choice you make creates a better world for future generations. Your kitchen can be a powerful force for positive change.
        </p>
      </div>

      {/* Related Products */}
      <section className="mt-16 p-6 bg-green-50 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Start Your Sustainable Kitchen Journey</h3>
        <p className="text-gray-600 mb-6">
          Begin with our eco-friendly storage solutions and take the first step toward a plastic-free kitchen.
        </p>
        <div className="flex gap-4">
          <Link
            href="/products"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Shop Sustainable Solutions
          </Link>
          <Link
            href="/blog/beeswax-bread-storage-benefits"
            className="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors"
          >
            Learn About Beeswax Storage
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