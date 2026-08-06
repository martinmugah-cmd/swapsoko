import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
const env = dotenv.parse(fs.readFileSync('../.env.local'));
const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY);

const MOCK_USERS = Array.from({ length: 10 }).map((_, i) => ({
  user_id: `mock_user_${Math.floor(Math.random()*100000)}`,
  name: `Test User ${i}`,
  university: 'University of Nairobi',
  campus: 'Main Campus',
  trust_score: Math.floor(Math.random() * 40) + 60
}));

const CATEGORIES = ["Electronics", "Phones", "Laptops", "Gaming", "Books", "Furniture", "Fashion", "Sports"];
const CONDITIONS = ["new", "like_new", "good", "fair"];

const MOCK_LISTINGS = Array.from({ length: 30 }).map((_, i) => {
  const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const itemNames = {
    Electronics: ["Sony WH-1000XM4", "JBL Flip 5", "AirPods Pro", "Samsung Monitor"],
    Phones: ["iPhone 13 Pro", "Samsung S21", "Google Pixel 6", "OnePlus 9"],
    Laptops: ["MacBook Air M1", "Dell XPS 13", "Lenovo ThinkPad", "HP Spectre"],
    Gaming: ["PS5 Console", "Xbox Series X", "Nintendo Switch", "PS4 Controller"],
    Books: ["Calculus 8th Ed", "Clean Code", "Organic Chemistry", "Harry Potter Boxset"],
    Furniture: ["Study Desk", "Ergonomic Chair", "Bookshelf", "Bean Bag"],
    Fashion: ["Nike Air Force 1", "Vintage Denim Jacket", "Adidas Ultraboost", "Casio Watch"],
    Sports: ["Dumbbells 10kg", "Yoga Mat", "Tennis Racket", "Football"]
  };
  
  const title = itemNames[cat][Math.floor(Math.random() * itemNames[cat].length)];
  const wantOptions = ["iPhone", "MacBook", "PS5", "Cash", "Any Electronics", "Good Laptop", "Bike", "Furniture"];
  
  return {
    user_id: MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)].user_id,
    title,
    description: `Selling or swapping my ${title}. Works perfectly, just don't need it anymore.`,
    category: cat,
    condition: CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)],
    images: [`https://picsum.photos/seed/swap${i}/600/400`],
    want_items: [wantOptions[Math.floor(Math.random() * wantOptions.length)]],
    campus: "Nairobi CBD",
    status: 'active'
  };
});

async function seed() {
  console.log("Seeding users...");
  for (const u of MOCK_USERS) {
    const { error } = await client.from('profiles').upsert(u);
    if (error) console.error("Error user:", error.message);
  }
  
  console.log("Seeding listings...");
  for (const l of MOCK_LISTINGS) {
    const { error } = await client.from('listings').insert(l);
    if (error) console.error("Error listing:", error.message);
  }
  
  console.log("Seeding complete! Added 30 mock listings.");
}
seed();
