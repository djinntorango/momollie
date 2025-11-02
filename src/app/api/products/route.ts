import { NextResponse } from 'next/server';
import type { Product } from '@/data/products';

// Cloud Function URL
const CATALOG_API_URL = 'https://us-central1-momongo-a83ea.cloudfunctions.net/getPublicCatalog';

// Transform Etsy listing to Product interface
function transformEtsyToProduct(etsyListing: any): Product | null {
  try {
    // Basic validation
    if (!etsyListing.listing_id || !etsyListing.title) {
      console.warn('Invalid listing data:', etsyListing.listing_id);
      return null;
    }

    // Calculate price
    const price = etsyListing.price?.amount && etsyListing.price?.divisor
      ? etsyListing.price.amount / etsyListing.price.divisor
      : 0;

    // Get the best quality image
    const imageUrl = etsyListing.images && etsyListing.images.length > 0
      ? etsyListing.images[0].url_570xN || etsyListing.images[0].url_fullxfull || '/products/placeholder.jpg'
      : '/products/placeholder.jpg';

    // Determine category based on tags or title
    let category = 'kitchen-accessories';
    const title = etsyListing.title?.toLowerCase() || '';
    const tags = (etsyListing.tags || []).map((t: string) => t.toLowerCase());

    if (title.includes('bread bag') || tags.includes('bread bag')) {
      category = 'bread-bags';
    } else if (title.includes('storage') || tags.includes('storage')) {
      category = 'sustainable-storage';
    }

    // Extract features from description or use defaults
    const features: string[] = [];
    if (etsyListing.materials && etsyListing.materials.includes('Organic cotton')) {
      features.push('Made with organic cotton');
    }
    if (etsyListing.materials && etsyListing.materials.includes('beeswax')) {
      features.push('Natural beeswax coating');
    }
    features.push('Handcrafted with care');
    features.push('Sustainable and eco-friendly');

    // Add more features from tags
    if (tags.includes('reusable')) features.push('Reusable and long-lasting');
    if (tags.includes('plastic free')) features.push('100% plastic-free');

    // Build product object
    const product: Product = {
      id: parseInt(etsyListing.listing_id),
      name: etsyListing.title,
      category,
      price,
      description: etsyListing.description || 'Handcrafted sustainable product',
      features: features.slice(0, 5), // Limit to 5 features
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

    // Add dimensions if available
    if (etsyListing.item_dimensions_unit) {
      product.dimensions = `${etsyListing.item_length || '?'}" x ${etsyListing.item_width || '?'}" x ${etsyListing.item_height || '?'}"`;
    }

    return product;
  } catch (error) {
    console.error('Error transforming listing:', error);
    return null;
  }
}

export async function GET() {
  try {
    // Fetch from the public catalog API
    const response = await fetch(CATALOG_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Revalidate every 5 minutes
      next: { revalidate: 300 }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success || !data.listings) {
      throw new Error('Invalid API response');
    }

    // Transform listings to Product format
    const products: Product[] = data.listings
      .map((listing: any) => transformEtsyToProduct(listing))
      .filter((product: Product | null): product is Product => product !== null);

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      lastSync: data.lastSync
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);

    // Return error response
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500
    });
  }
}
