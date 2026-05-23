import { Link } from 'react-router-dom'

export default function HowLongDoesSourdoughLast() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-8">
        <div className="text-center mb-6">
          <span className="text-amber-600 font-medium">Baking Mastery</span>
          <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            How Long Does Sourdough Bread Last? (And How to Make It Last Longer)
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sourdough keeps longer than commercial bread — but only if you store it right. Here's the honest breakdown by storage method, plus the one change that made the biggest difference for us.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
            <span>Published May 2025</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </div>
        <div className="relative h-96 w-full rounded-lg overflow-hidden">
          <img src="/bake.png" alt="Freshly baked sourdough loaf cooling on a rack" className="absolute inset-0 w-full h-full object-cover" />
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-700 leading-relaxed mb-8">
          You spent 24+ hours on a loaf. The last thing you want is to find it stale or moldy two days later. The good news: sourdough's natural acidity gives it a real preservation advantage over commercial bread — but that advantage disappears fast if you store it wrong.
        </p>

        <h2 className="text-3xl font-bold mt-12 mb-6">How Long Sourdough Lasts by Storage Method</h2>

        <div className="overflow-x-auto my-8">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-amber-50">
                <th className="border border-amber-200 px-4 py-3 text-left font-semibold">Storage Method</th>
                <th className="border border-amber-200 px-4 py-3 text-left font-semibold">Freshness</th>
                <th className="border border-amber-200 px-4 py-3 text-left font-semibold">Crust Quality</th>
                <th className="border border-amber-200 px-4 py-3 text-left font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-3">Plastic bag</td>
                <td className="border border-gray-200 px-4 py-3">3–4 days</td>
                <td className="border border-gray-200 px-4 py-3 text-red-600">Soggy by day 2</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-500">Traps moisture; accelerates mold</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3">Paper bag</td>
                <td className="border border-gray-200 px-4 py-3">1–2 days</td>
                <td className="border border-gray-200 px-4 py-3">Crisp but dries out</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-500">Good short-term; crumb gets hard fast</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3">Cut side down on board</td>
                <td className="border border-gray-200 px-4 py-3">1–2 days</td>
                <td className="border border-gray-200 px-4 py-3">Excellent crust</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-500">Old baker's trick; works briefly</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3">Linen / cloth bag</td>
                <td className="border border-gray-200 px-4 py-3">2–3 days</td>
                <td className="border border-gray-200 px-4 py-3">Good</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-500">Better than plastic; dries out faster than beeswax</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 font-semibold text-amber-700">Beeswax bread bag</td>
                <td className="border border-gray-200 px-4 py-3 font-semibold text-green-700">4–5 days</td>
                <td className="border border-gray-200 px-4 py-3 font-semibold text-green-700">Crisp crust, soft crumb</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-500">Breathable seal; best all-round result</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-200 px-4 py-3">Freezer (whole loaf)</td>
                <td className="border border-gray-200 px-4 py-3">Up to 3 months</td>
                <td className="border border-gray-200 px-4 py-3">Good after reheating</td>
                <td className="border border-gray-200 px-4 py-3 text-gray-500">Best for long-term; slice before freezing for convenience</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">Why Sourdough Lasts Longer Than Regular Bread</h2>
        <p>
          The wild fermentation process that gives sourdough its flavour also produces lactic and acetic acids, which lower the bread's pH. Most mold and bacteria struggle to grow in an acidic environment — which is why a well-made sourdough loaf will outlast a commercial sandwich loaf by several days even under identical conditions.
        </p>
        <p>
          The longer and slower the fermentation, the more acidity builds up, and the longer the loaf keeps. A cold-retarded overnight loaf will generally last longer than one that was rushed through a same-day process.
        </p>

        <div className="bg-amber-50 p-6 rounded-lg my-8">
          <h3 className="text-xl font-semibold mb-3">Key factors that affect shelf life:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5">→</span>
              <span><strong>Fermentation time:</strong> Longer, cooler fermentation = more acid = longer shelf life</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5">→</span>
              <span><strong>Hydration:</strong> Higher-hydration loaves stale faster because there's more free moisture</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5">→</span>
              <span><strong>Whole grain content:</strong> Whole wheat and rye accelerate staling slightly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5">→</span>
              <span><strong>Storage method:</strong> The single biggest variable you can control</span>
            </li>
          </ul>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">The Refrigerator Debate</h2>
        <p>
          Many bakers instinctively reach for the fridge, but for sourdough it's almost always the wrong call. Cold temperatures accelerate starch retrogradation — the process that makes bread crumbly and dry — even faster than leaving it at room temperature. A loaf stored in the fridge for two days will feel older than one left on the counter.
        </p>
        <p>
          The exception: if you're in a very hot, humid climate where mold is the primary concern, a brief stint in the fridge may be the lesser of two evils. Otherwise, counter storage in the right container wins every time.
        </p>

        <blockquote className="border-l-4 border-amber-600 pl-6 italic text-lg text-gray-700 my-8">
          "I used to refrigerate everything out of habit. Once I stopped and switched to a beeswax bag, my sourdough was still genuinely good on day five. The fridge was actively making things worse."
          <cite className="block text-sm text-gray-500 mt-2">— Jamie, home baker</cite>
        </blockquote>

        <h2 className="text-3xl font-bold mt-12 mb-6">Freezing: The Best Long-Term Option</h2>
        <p>
          If you bake large batches or won't finish a loaf within 5 days, freezing is your best option. Sourdough freezes exceptionally well because of its structure and acidity.
        </p>
        <ol className="list-decimal list-inside space-y-3 my-6">
          <li><strong>Slice the loaf before freezing</strong> — you can then take out exactly what you need</li>
          <li><strong>Wrap tightly</strong> in beeswax wrap or foil, then place in a bag to prevent freezer burn</li>
          <li><strong>Thaw at room temperature</strong> — never microwave from frozen if you care about the texture</li>
          <li><strong>Refresh in the oven</strong> at 350°F for 5–8 minutes to revive the crust</li>
        </ol>

        <h2 className="text-3xl font-bold mt-12 mb-6">Signs Your Sourdough Has Turned</h2>
        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <h4 className="font-semibold text-red-700 mb-2">Don't eat it if you see:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Visible mold (any colour)</li>
              <li>• Unusual or off smell</li>
              <li>• Slimy or sticky texture on the crumb</li>
            </ul>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <h4 className="font-semibold text-green-700 mb-2">Still fine to eat:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Stale or dry crumb (toast it)</li>
              <li>• Harder crust (normal after day 2)</li>
              <li>• Slightly more sour flavour</li>
            </ul>
          </div>
        </div>

        <h2 className="text-3xl font-bold mt-12 mb-6">The Simplest Upgrade You Can Make</h2>
        <p>
          If you're currently storing sourdough in a plastic bag or wrapped in foil, switching to a beeswax bread bag is the single most effective change you can make. The breathable wax lining keeps moisture from building up (the cause of soggy crusts and early mold) while preventing the loaf from drying out entirely.
        </p>
        <p>
          Most bakers who try one report their sourdough staying genuinely fresh — not just edible, but actually good — for 4 to 5 days. For a loaf you worked on all day, that's a meaningful difference.
        </p>
      </div>

      <section className="mt-16 p-6 bg-amber-50 rounded-lg">
        <h3 className="text-2xl font-bold mb-3">Keep Your Sourdough Fresh Longer</h3>
        <p className="text-gray-600 mb-6">
          Our handmade beeswax bread bags are designed specifically for artisan loaves — the breathable lining does what plastic and paper can't.
        </p>
        <Link to="/products" className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors inline-block">
          Shop Bread Bags
        </Link>
      </section>

      <nav className="mt-12 pt-8 border-t">
        <Link to="/blog" className="text-amber-600 hover:text-amber-700 font-medium">
          ← Back to Blog
        </Link>
      </nav>
    </article>
  )
}
