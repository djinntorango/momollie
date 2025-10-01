export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  description: string;
  features: string[];
  image: string;
  etsyUrl: string;
  inStock: boolean;
  materials: string[];
  dimensions?: string;
  careInstructions: string[];
}

export const products: Product[] = [
  {
    id: 1,
    name: "Classic Beeswax Bread Bag - Large",
    category: "bread-bags",
    price: 24.99,
    originalPrice: 29.99,
    description: "Our signature large beeswax-lined bread bag keeps your homemade loaves fresh for up to a week. Handcrafted with organic cotton and sustainably sourced beeswax.",
    features: [
      "Keeps bread fresh 3x longer than plastic",
      "100% plastic-free and biodegradable",
      "Organic cotton with beeswax lining",
      "Machine washable in cold water",
      "Fits standard and artisan loaves"
    ],
    image: "/products/large-bread-bag.jpg",
    etsyUrl: "https://dearmomollie.etsy.com/listing/large-beeswax-bread-bag",
    inStock: true,
    materials: ["Organic cotton", "Pure beeswax", "Natural hemp drawstring"],
    dimensions: "14\" x 10\" x 4\"",
    careInstructions: [
      "Hand wash in cool water with mild soap",
      "Air dry completely before storing",
      "Re-wax annually for best performance"
    ]
  },
  {
    id: 2,
    name: "Artisan Beeswax Bread Bag - Medium",
    category: "bread-bags",
    price: 19.99,
    description: "Perfect for smaller loaves, rolls, and pastries. Our medium-sized bread bag combines traditional craftsmanship with modern sustainability.",
    features: [
      "Ideal for smaller loaves and rolls",
      "Natural antimicrobial properties",
      "Handmade with love in small batches",
      "Drawstring closure for easy access",
      "Beautiful natural cotton texture"
    ],
    image: "/products/medium-bread-bag.jpg",
    etsyUrl: "https://dearmomollie.etsy.com/listing/medium-beeswax-bread-bag",
    inStock: true,
    materials: ["Organic cotton", "Pure beeswax", "Cotton drawstring"],
    dimensions: "12\" x 8\" x 3\"",
    careInstructions: [
      "Wipe clean with damp cloth",
      "Air dry thoroughly",
      "Store in cool, dry place"
    ]
  },
  {
    id: 3,
    name: "Sourdough Starter Preservation Bag",
    category: "bread-bags",
    price: 16.99,
    description: "Specially designed for sourdough enthusiasts! This smaller bag is perfect for storing sourdough starters and maintaining their health with breathable beeswax coating.",
    features: [
      "Allows proper air circulation for fermentation",
      "Prevents contamination naturally",
      "Perfect size for starter storage",
      "Easy to clean and maintain",
      "Supports active sourdough cultures"
    ],
    image: "/products/sourdough-bag.jpg",
    etsyUrl: "https://dearmomollie.etsy.com/listing/sourdough-starter-bag",
    inStock: true,
    materials: ["Organic cotton", "Food-grade beeswax"],
    dimensions: "8\" x 6\" x 2\"",
    careInstructions: [
      "Rinse with cool water only",
      "No soap needed - beeswax is naturally antimicrobial",
      "Air dry before next use"
    ]
  },
  {
    id: 4,
    name: "Beeswax Food Storage Wrap Set",
    category: "kitchen-accessories",
    price: 32.99,
    originalPrice: 39.99,
    description: "A complete set of three different sized beeswax wraps to replace plastic wrap in your kitchen. Made with organic cotton and locally sourced beeswax.",
    features: [
      "Set of 3: Small, Medium, Large",
      "Replaces plastic wrap completely",
      "Moldable when warmed by hands",
      "Reusable for up to 1 year",
      "Beautiful honeycomb pattern"
    ],
    image: "/products/beeswax-wrap-set.jpg",
    etsyUrl: "https://dearmomollie.etsy.com/listing/beeswax-wrap-set",
    inStock: true,
    materials: ["Organic cotton", "Pure beeswax", "Jojoba oil", "Tree resin"],
    dimensions: "Small: 7\"x8\", Medium: 10\"x11\", Large: 13\"x14\"",
    careInstructions: [
      "Wash in cool water with mild soap",
      "Air dry completely",
      "Avoid hot water and heat sources"
    ]
  },
  {
    id: 5,
    name: "Artisan Wooden Bread Knife",
    category: "kitchen-accessories",
    price: 45.00,
    description: "Hand-forged carbon steel bread knife with locally crafted hardwood handle. The perfect companion to our bread bags for the complete artisan bread experience.",
    features: [
      "Sharp serrated edge for clean cuts",
      "Comfortable hardwood handle",
      "Carbon steel holds edge longer",
      "Handcrafted by local artisans",
      "Comes with care instructions"
    ],
    image: "/products/bread-knife.jpg",
    etsyUrl: "https://dearmomollie.etsy.com/listing/artisan-bread-knife",
    inStock: true,
    materials: ["Carbon steel", "Hardwood (maple or walnut)", "Food-safe finish"],
    dimensions: "12\" total length, 8\" blade",
    careInstructions: [
      "Hand wash and dry immediately",
      "Oil blade monthly to prevent rust",
      "Store in dry location"
    ]
  },
  {
    id: 6,
    name: "Bamboo Bread Box with Beeswax Insert",
    category: "sustainable-storage",
    price: 68.99,
    description: "A beautiful bamboo bread box featuring a removable beeswax-lined insert. Combines elegant design with superior bread preservation technology.",
    features: [
      "Sustainable bamboo construction",
      "Removable beeswax insert",
      "Elegant countertop design",
      "Holds multiple loaves",
      "Natural antimicrobial properties"
    ],
    image: "/products/bamboo-bread-box.jpg",
    etsyUrl: "https://dearmomollie.etsy.com/listing/bamboo-bread-box",
    inStock: false,
    materials: ["Sustainable bamboo", "Organic cotton insert", "Pure beeswax"],
    dimensions: "16\" x 10\" x 8\"",
    careInstructions: [
      "Wipe bamboo with damp cloth",
      "Remove and wash beeswax insert separately",
      "Allow to air dry completely"
    ]
  },
  {
    id: 7,
    name: "Herb & Spice Storage Pouches (Set of 4)",
    category: "sustainable-storage",
    price: 28.99,
    description: "Keep your herbs and spices fresh with these charming beeswax-lined pouches. Perfect for bulk buying and reducing packaging waste.",
    features: [
      "Set of 4 different sizes",
      "Clear labeling window",
      "Airtight beeswax seal",
      "Reduces packaging waste",
      "Perfect for bulk shopping"
    ],
    image: "/products/herb-pouches.jpg",
    etsyUrl: "https://dearmomollie.etsy.com/listing/herb-spice-pouches",
    inStock: true,
    materials: ["Organic cotton", "Pure beeswax", "Natural jute labels"],
    dimensions: "Various: 3\"x4\" to 6\"x8\"",
    careInstructions: [
      "Shake out contents before cleaning",
      "Wipe with damp cloth",
      "Air dry before refilling"
    ]
  },
  {
    id: 8,
    name: "Reusable Produce Bags (Set of 3)",
    category: "sustainable-storage",
    price: 22.99,
    description: "Lightweight, breathable cotton mesh bags perfect for grocery shopping. Say goodbye to plastic produce bags forever!",
    features: [
      "Set of 3 different sizes",
      "Lightweight cotton mesh",
      "Drawstring closure",
      "Machine washable",
      "Tare weight printed on label"
    ],
    image: "/products/produce-bags.jpg",
    etsyUrl: "https://dearmomollie.etsy.com/listing/reusable-produce-bags",
    inStock: true,
    materials: ["Organic cotton mesh", "Cotton drawstring"],
    dimensions: "Small: 8\"x10\", Medium: 10\"x12\", Large: 12\"x14\"",
    careInstructions: [
      "Machine wash in cold water",
      "Air dry or tumble dry low",
      "Iron if needed on low heat"
    ]
  }
];

export const categories = [
  {
    id: "bread-bags",
    name: "Beeswax Bread Bags",
    description: "Keep your homemade bread fresh naturally"
  },
  {
    id: "kitchen-accessories",
    name: "Kitchen Accessories",
    description: "Artisan tools for the modern baker"
  },
  {
    id: "sustainable-storage",
    name: "Sustainable Storage",
    description: "Eco-friendly solutions for your kitchen"
  }
];