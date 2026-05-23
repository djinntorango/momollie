import { Link } from 'react-router-dom'

export default function CaringForBeeswaxBags() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-8">
        <div className="text-center mb-6">
          <span className="text-amber-600 font-medium">Product Care</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">How to Care for Your Beeswax Bread Bags</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">With proper care, your beeswax bread bag will keep your bread fresh for years to come. Here's everything you need to know.</p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <span>Published November 16, 2024</span><span>•</span><span>5 min read</span>
          </div>
        </div>
        <div className="relative h-96 w-full rounded-lg overflow-hidden">
          <img src="/bag.png" alt="Well-maintained beeswax bread bag" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-700 leading-relaxed mb-8">You've invested in a quality beeswax bread bag—a sustainable alternative to plastic that keeps your bread fresh longer. With the right care, this bag will serve you faithfully for years, replacing hundreds of single-use bags. Here's how to make it last.</p>

        <h2 className="text-3xl font-bold mt-12 mb-6">Daily Care: After Each Use</h2>
        <div className="bg-amber-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-4">The Quick Clean Method</h3>
          <ol className="space-y-3">
            <li><strong>1. Shake out crumbs</strong> over the sink or compost bin</li>
            <li><strong>2. Wipe inside with a damp cloth</strong> using cool or room temperature water</li>
            <li><strong>3. Air dry completely</strong> before storing or refilling</li>
          </ol>
          <p className="mt-4 text-sm text-gray-600"><strong>Time required:</strong> 30 seconds</p>
        </div>
        <p>For most daily use, this simple routine is all you need. The natural antimicrobial properties of beeswax help keep the bag fresh between deeper cleans.</p>

        <h2 className="text-3xl font-bold mt-12 mb-6">Deep Cleaning: Weekly or As Needed</h2>
        <p>When your bag needs more than a quick wipe, here's the proper washing method:</p>
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8">
          <h3 className="text-xl font-semibold mb-4">Step-by-Step Deep Clean</h3>
          <h4 className="font-semibold mt-6 mb-2">What You'll Need:</h4>
          <ul className="space-y-1 mb-4">
            <li>• Cool or lukewarm water (never hot!)</li>
            <li>• Mild, unscented dish soap</li>
            <li>• Soft cloth or sponge</li>
            <li>• Dish rack or clothesline</li>
          </ul>
          <h4 className="font-semibold mt-6 mb-2">Instructions:</h4>
          <ol className="space-y-3">
            <li><strong>1. Fill sink with cool water</strong><p className="text-sm mt-1">Add a small amount of mild dish soap. Avoid hot water—it can melt the beeswax coating.</p></li>
            <li><strong>2. Gently wash</strong><p className="text-sm mt-1">Use a soft cloth to wipe both sides of the bag. No scrubbing or harsh brushes—gentle is key.</p></li>
            <li><strong>3. Rinse thoroughly</strong><p className="text-sm mt-1">Use cool water to remove all soap residue.</p></li>
            <li><strong>4. Air dry</strong><p className="text-sm mt-1">Hang over a dish rack or clothesline. Allow to dry completely (both sides) before storing.</p></li>
          </ol>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">What NOT to Do</h2>
        <div className="bg-red-50 border-l-4 border-red-400 p-6 my-8">
          <h3 className="text-xl font-semibold text-red-800 mb-4">Avoid These Common Mistakes:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2"><span className="text-red-500 text-xl mt-1">✗</span><div><strong>Hot water or dishwasher</strong><p className="text-sm mt-1">Heat melts the beeswax coating, ruining the bag's properties</p></div></li>
            <li className="flex items-start gap-2"><span className="text-red-500 text-xl mt-1">✗</span><div><strong>Washing machine or dryer</strong><p className="text-sm mt-1">Agitation and heat damage both the fabric and beeswax</p></div></li>
            <li className="flex items-start gap-2"><span className="text-red-500 text-xl mt-1">✗</span><div><strong>Harsh soaps or bleach</strong><p className="text-sm mt-1">Strong chemicals degrade the beeswax and can leave residue</p></div></li>
            <li className="flex items-start gap-2"><span className="text-red-500 text-xl mt-1">✗</span><div><strong>Storing while damp</strong><p className="text-sm mt-1">Can promote mold growth or weaken the beeswax coating</p></div></li>
            <li className="flex items-start gap-2"><span className="text-red-500 text-xl mt-1">✗</span><div><strong>Scrubbing aggressively</strong><p className="text-sm mt-1">Can wear away the beeswax coating prematurely</p></div></li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Proper Storage</h2>
        <p>When not in use, store your beeswax bread bag properly to maintain its shape and coating:</p>
        <div className="bg-gray-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-4">Storage Best Practices:</h3>
          <ul className="space-y-3">
            <li><strong>Keep it dry</strong><p className="text-sm text-gray-600 mt-1">Always ensure the bag is completely dry before storing to prevent mold</p></li>
            <li><strong>Store flat or loosely folded</strong><p className="text-sm text-gray-600 mt-1">Avoid tight creases that can crack the beeswax coating over time</p></li>
            <li><strong>Cool, dry location</strong><p className="text-sm text-gray-600 mt-1">A drawer or pantry shelf works perfectly—avoid direct sunlight or heat</p></li>
            <li><strong>Keep away from strong odors</strong><p className="text-sm text-gray-600 mt-1">Beeswax can absorb smells, so store away from onions, garlic, or cleaning products</p></li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Extending the Life of Your Bag</h2>
        <h3 className="text-2xl font-semibold mt-8 mb-4">Let Bread Cool First</h3>
        <p>Always let freshly baked bread cool completely before storing in your beeswax bag. Warm bread creates condensation, which can:</p>
        <ul className="space-y-2 my-4">
          <li>• Make the crust soggy</li>
          <li>• Weaken the beeswax coating</li>
          <li>• Promote mold growth</li>
          <li>• Reduce the bag's lifespan</li>
        </ul>

        <h3 className="text-2xl font-semibold mt-8 mb-4">Rotate Multiple Bags</h3>
        <p>If you bake frequently, consider having 2-3 bags. Rotating them gives each bag time to fully air out between uses, extending their collective lifespan.</p>

        <h2 className="text-3xl font-bold mt-12 mb-6">When to Refresh the Coating</h2>
        <p>Over time (typically 1-2 years with regular use), the beeswax coating may thin in high-wear areas. Signs your bag needs refreshing:</p>
        <ul className="space-y-2 my-6">
          <li>• Fabric appears less waxy in spots</li>
          <li>• Water no longer beads on the surface</li>
          <li>• Bread dries out faster than usual</li>
        </ul>

        <div className="bg-amber-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-4">DIY Rewaxing (Optional)</h3>
          <p className="mb-4">While many people simply replace their bags after 2-3 years, you can refresh the coating:</p>
          <ol className="space-y-2 text-sm">
            <li>1. Grate pure beeswax</li>
            <li>2. Sprinkle lightly over the bag</li>
            <li>3. Place between parchment paper</li>
            <li>4. Iron on low heat to melt and distribute wax</li>
            <li>5. Let cool and wipe off excess</li>
          </ol>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Quick Reference Care Guide</h2>
        <div className="bg-gray-100 p-6 rounded-lg my-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold mb-4 text-green-700">✓ DO</h4>
              <ul className="space-y-2 text-sm">
                <li>✓ Use cool or lukewarm water</li>
                <li>✓ Air dry completely</li>
                <li>✓ Store flat or loosely folded</li>
                <li>✓ Let bread cool before storing</li>
                <li>✓ Wipe clean after each use</li>
                <li>✓ Use mild, unscented soap</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-red-700">✗ DON'T</h4>
              <ul className="space-y-2 text-sm">
                <li>✗ Use hot water</li>
                <li>✗ Machine wash or dry</li>
                <li>✗ Store while damp</li>
                <li>✗ Use harsh chemicals</li>
                <li>✗ Scrub aggressively</li>
                <li>✗ Store in direct sunlight</li>
              </ul>
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">The Bottom Line</h2>
        <p>Caring for your beeswax bread bag is simple: keep it clean, let it dry, and treat it gently. These minimal maintenance steps ensure your bag will serve you well for years, keeping your bread fresh while eliminating plastic waste.</p>

        <blockquote className="border-l-4 border-amber-600 pl-6 italic text-lg text-gray-700 my-8">"I've been using the same beeswax bread bag for three years now. A quick wipe after each use and an occasional wash is all it takes. Best kitchen investment I've made."</blockquote>
      </div>

      <section className="mt-16 p-6 bg-amber-50 rounded-lg">
        <h3 className="text-2xl font-bold mb-4">Get Your Long-Lasting Beeswax Bread Bag</h3>
        <p className="text-gray-600 mb-6">Invest in a quality beeswax bread bag that will serve you well for years to come.</p>
        <div className="flex gap-4">
          <Link to="/products" className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors">Shop Bread Bags</Link>
        </div>
      </section>
      <nav className="mt-12 pt-8 border-t">
        <Link to="/blog" className="text-amber-600 hover:text-amber-700 font-medium">← Back to Blog</Link>
      </nav>
    </article>
  )
}
