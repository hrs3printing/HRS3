export const products = [
  {
    id: "1",
    name: "Oversized Black Tee",
    price: 999, // ✅ number
    category: "men", // ✅ required
    size: ["M", "L"], // ✅ required
    rating: 4.5,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab", // ✅ for listing page
    images: [
      // ✅ for product detail page
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
      "https://images.unsplash.com/photo-1521335629791-ce4aec67dd53",
    ],
    description:
      "Premium oversized t-shirt made with high-quality cotton for ultimate comfort and style.",
  },
];
