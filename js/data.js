const PRODUCTS = [
  {
    id: "hair-oil-200",
    name: "Emblic Plus Hair Oil",
    size: "200ml",
    category: "single",
    price: 1450,
    oldPrice: 1800,
    rating: 4.8,
    reviews: 126,
    image: "images/p-single.jpg",
    tag: "Bestseller",
    short: "Our signature amla blend for a stronger, shinier mane.",
    description:
      "A pure blend of cold-pressed amla, bhringraj, coconut and sesame oils that nourishes the scalp, strengthens roots and brings back natural shine. Light enough for weekly use, rich enough to make a difference.",
    details: ["200ml bottle", "Lasts 6–8 weeks", "Suitable for all hair types", "Free from mineral oil & parabens"]
  },
  {
    id: "twin-pack",
    name: "Twin Pack",
    size: "2 × 200ml",
    category: "bundle",
    price: 2650,
    oldPrice: 2900,
    rating: 4.9,
    reviews: 74,
    image: "images/p-twin.jpg",
    tag: "Save 9%",
    short: "One for you, one to share — or stock up for 3 months.",
    description:
      "Two bottles of Emblic Plus Hair Oil at a better price. Ideal for a full 12-week routine, or to share with someone who's been asking about your hair.",
    details: ["2 × 200ml bottles", "Lasts 12–16 weeks", "Suitable for all hair types", "Free from mineral oil & parabens"]
  },
  {
    id: "family-pack",
    name: "Family Pack",
    size: "3 × 200ml",
    category: "bundle",
    price: 3750,
    oldPrice: 4350,
    rating: 4.9,
    reviews: 51,
    image: "images/p-family.jpg",
    tag: "Best value",
    short: "Three bottles for the whole household. Ships free.",
    description:
      "Three bottles of Emblic Plus Hair Oil for the whole family. Our best price per bottle, and it qualifies for free shipping anywhere in Pakistan.",
    details: ["3 × 200ml bottles", "Free shipping included", "Suitable for all hair types", "Free from mineral oil & parabens"]
  },
  {
    id: "ritual-gift-set",
    name: "Amla Ritual Gift Set",
    size: "Oil + comb + wrap",
    category: "gift",
    price: 2250,
    oldPrice: null,
    rating: 4.7,
    reviews: 38,
    image: "images/p-gift.jpg",
    tag: "New",
    short: "Hair oil, neem-wood comb and cotton hair wrap in a gift box.",
    description:
      "Everything for a weekly oiling ritual: a 200ml bottle of Emblic Plus Hair Oil, a hand-finished neem-wood comb and a soft cotton hair wrap, packed in a kraft gift box with a handwritten note.",
    details: ["200ml Emblic Plus Hair Oil", "Neem-wood comb", "Cotton hair wrap", "Gift box + note card"]
  }
];

const SHOP = {
  currency: "PKR",
  freeShippingAt: 3000,
  shippingFee: 250,
  coupons: { EMBLIC10: 0.10, WELCOME5: 0.05 }
};
