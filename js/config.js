const STORE = {
  name: "Ace Hill Electronics",
  shortName: "Ace Hill",
  tagline: "Your Trusted Electronics & Technology Partner",
  website: "https://acehillonlinemarket.co.ke",
  email: "info@acehillonlinemarket.co.ke",
  hours: [
    { day: "Monday – Saturday", time: "8:00 AM – 7:00 PM" },
    { day: "Sunday", time: "10:00 AM – 4:00 PM" }
  ],
  social: {
    facebook: "#",
    instagram: "#",
    tiktok: "#"
  },
  currency: "KES",
  branches: [
    {
      id: "garissa",
      city: "Garissa",
      label: "Garissa branch",
      phoneDisplay: "0799 999 734",
      phoneHref: "tel:+254799999734",
      whatsapp: "254799999734",
      address: "Opposite Hiddig Plaza, Garissa",
      mapQuery: "Hiddig Plaza Garissa Kenya",
      mapEmbed: "https://maps.google.com/maps?q=Hiddig%20Plaza%20Garissa%20Kenya&z=16&output=embed"
    },
    {
      id: "nairobi",
      city: "Nairobi",
      label: "Nairobi branch",
      phoneDisplay: "0722 616 156",
      phoneHref: "tel:+254722616156",
      whatsapp: "254722616156",
      address: "BBS Mall, Eastleigh, Nairobi",
      mapQuery: "BBS Mall Eastleigh Nairobi",
      mapEmbed: "https://maps.google.com/maps?q=BBS%20Mall%20Eastleigh%20Nairobi&z=16&output=embed"
    }
  ]
};

const CATEGORIES = [
  { id: "Phones", label: "Phones", blurb: "iPhones, Android phones and phone accessories", icon: "phone" },
  { id: "Laptops", label: "Laptops & Computers", blurb: "Laptops, desktops, printers and computer accessories", icon: "laptop" },
  { id: "Tablets", label: "Tablets & iPads", blurb: "iPads, Android tablets and tablet accessories", icon: "tablet" },
  { id: "CCTV", label: "CCTV & Security", blurb: "Cameras, DVR/NVR and surveillance drives", icon: "cctv" },
  { id: "Accessories", label: "Accessories", blurb: "Chargers, cables, earphones and power banks", icon: "accessory" }
];

const PRICE_MAX = 200000;
