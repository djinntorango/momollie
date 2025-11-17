import type { Metadata } from 'next';
import type { Product } from '@/data/products';
import ProductGrid from '@/components/ProductGrid';

export const metadata: Metadata = {
  title: "Handcrafted Products - Beeswax Bread Bags & Kitchen Accessories | DearMomollie",
  description: "Shop our collection of handmade beeswax bread bags, sustainable kitchen accessories, and eco-friendly storage solutions. Made with organic cotton and pure beeswax.",
  keywords: "handmade kitchen accessories, beeswax bread bags, sustainable storage, eco-friendly products, artisan crafts, organic cotton, plastic-free kitchen",
  openGraph: {
    title: "Handcrafted Beeswax Products - DearMomollie",
    description: "Eco-friendly kitchen accessories handcrafted with love and sustainable materials",
    images: ["/products/large-bread-bag.jpg"],
  },
};

// Etsy listing type
interface EtsyListing {
  listing_id: string | number;
  title?: string;
  description?: string;
  price?: {
    amount: number;
    divisor: number;
  };
  quantity?: number;
  state?: string;
  url?: string;
  images?: Array<{
    url_570xN?: string;
    url_fullxfull?: string;
  }>;
  materials?: string[];
  tags?: string[];
  item_dimensions_unit?: string;
  item_length?: string;
  item_width?: string;
  item_height?: string;
}

// Transform Etsy listing to Product interface
function transformEtsyToProduct(etsyListing: EtsyListing): Product | null {
  try {
    if (!etsyListing.listing_id || !etsyListing.title) {
      return null;
    }

    const price = etsyListing.price?.amount && etsyListing.price?.divisor
      ? etsyListing.price.amount / etsyListing.price.divisor
      : 0;

    const imageUrl = etsyListing.images && etsyListing.images.length > 0
      ? etsyListing.images[0].url_570xN || etsyListing.images[0].url_fullxfull || '/products/placeholder.jpg'
      : '/products/placeholder.jpg';

    let category = 'kitchen-accessories';
    const title = etsyListing.title?.toLowerCase() || '';
    const tags = (etsyListing.tags || []).map((t: string) => t.toLowerCase());

    if (title.includes('bread bag') || tags.includes('bread bag')) {
      category = 'bread-bags';
    } else if (title.includes('storage') || tags.includes('storage')) {
      category = 'sustainable-storage';
    }

    const features: string[] = [];
    if (etsyListing.materials && etsyListing.materials.includes('Organic cotton')) {
      features.push('Made with organic cotton');
    }
    if (etsyListing.materials && etsyListing.materials.includes('beeswax')) {
      features.push('Natural beeswax coating');
    }
    features.push('Handcrafted with care');
    features.push('Sustainable and eco-friendly');
    if (tags.includes('reusable')) features.push('Reusable and long-lasting');
    if (tags.includes('plastic free')) features.push('100% plastic-free');

    const product: Product = {
      id: typeof etsyListing.listing_id === 'number'
        ? etsyListing.listing_id
        : parseInt(etsyListing.listing_id, 10),
      name: etsyListing.title,
      category,
      price,
      description: etsyListing.description || 'Handcrafted sustainable product',
      features: features.slice(0, 5),
      image: imageUrl,
      etsyUrl: etsyListing.url || `https://dearmomollie.etsy.com/listing/${etsyListing.listing_id}`,
      inStock: (etsyListing.quantity || 0) > 0 && etsyListing.state === 'active',
      materials: etsyListing.materials || [],
      careInstructions: [
        'Hand wash in cool water with mild soap',
        'Air dry completely before storing',
        'Keep away from direct heat sources'
      ]
    };

    if (etsyListing.item_dimensions_unit) {
      product.dimensions = `${etsyListing.item_length || '?'}" x ${etsyListing.item_width || '?'}" x ${etsyListing.item_height || '?'}"`;
    }

    return product;
  } catch (error) {
    console.error('Error transforming listing:', error);
    return null;
  }
}

async function getProducts(storeId?: string): Promise<Product[]> {
  try {
    console.log('🔍 Fetching products from API...', { storeId });

    // Build URL with storeId parameter (hardcoded to DearMomollie shop)
    const url = new URL('https://us-central1-momongo-a83ea.cloudfunctions.net/getPublicCatalog');
    url.searchParams.set('storeId', '60103978');

    // Fetch directly from Firebase function
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
      // No cache option = default static generation behavior
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      console.error('❌ Failed to fetch products:', response.status);
      return [];
    }

    const data = await response.json();
    console.log('📦 API response:', { success: data.success, listingCount: data.listings?.length });

    if (!data.success || !data.listings) {
      console.error('❌ Invalid API response:', data);
      return [];
    }

    // Transform listings to Product format
    const products: Product[] = data.listings
      .map((listing: EtsyListing) => transformEtsyToProduct(listing))
      .filter((product: Product | null): product is Product => product !== null);

    console.log('✅ Transformed products:', products.length);

    return products;
  } catch (error) {
    console.error('💥 Error fetching products:', error);
    return [];
  }
}

export default async function ProductsPage() {
  // Fetch products for DearMomollie shop (hardcoded)
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-[#3E2C1F]">Handcrafted with Love</h1>
        <p className="text-xl text-[#6B5B4F] max-w-2xl mx-auto">
          Discover our collection of beeswax bread bags and sustainable kitchen accessories,
          all handmade to help you live more sustainably.
        </p>
      </div>

      <ProductGrid products={products} />

      {/* Why Choose Us Section */}
      <section className="mt-16 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl p-8 shadow-lg">
        <h2 className="text-4xl font-bold text-center mb-8 text-[#3E2C1F]">Why Choose DearMomollie?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#E8B55F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white text-2xl">🐝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Natural Beeswax</h3>
            <p className="text-[#6B5B4F]">
              Made with beeswax and quality materials to help keep your bread fresh naturally.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#C87855] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white text-2xl">🏠</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Handcrafted</h3>
            <p className="text-[#6B5B4F]">
              Each item is lovingly handmade in small batches, ensuring quality and attention to detail.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#A8B89F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white text-2xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Sustainable</h3>
            <p className="text-[#6B5B4F]">
              A plastic-free alternative to help keep your homemade bread fresh and reduce waste.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 