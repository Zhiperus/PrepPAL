import { GoBagItem } from '@repo/shared/dist/schemas/goBagItem.schema';

export const GO_BAG_ITEMS: Omit<GoBagItem, '_id'>[] = [
  // FOOD AND WATER
  {
    name: 'Biscuits/Cereals',
    category: 'food',
    defaultQuantity: 1,
  },
  { name: 'Canned goods', category: 'food', defaultQuantity: 1 },
  { name: 'Cup noodles', category: 'food', defaultQuantity: 1 },
  { name: '1.5L Drinking water', category: 'water', defaultQuantity: 1 },
  { name: 'Instant coffee', category: 'food', defaultQuantity: 1 },
  { name: 'Instant tea', category: 'food', defaultQuantity: 1 },
  { name: 'Spoon and Fork', category: 'food', defaultQuantity: 1 },
  { name: 'Plate', category: 'food', defaultQuantity: 1 },
  { name: 'Plastic bags', category: 'food', defaultQuantity: 5 },

  // HYGIENE
  { name: 'Toothbrush', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Toothpaste', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Mouthwash', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Sanitary napkin', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Soap', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Shampoo', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Conditioner', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Hand sanitizer', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Alcohol', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Insect repellant', category: 'hygiene', defaultQuantity: 1 },
  { name: 'Sunblock', category: 'hygiene', defaultQuantity: 1 },

  // FIRST AID
  { name: 'Band-aid', category: 'first-aid', defaultQuantity: 5 },
  { name: 'Sterile gauze', category: 'first-aid', defaultQuantity: 1 },
  { name: 'Micropore tape', category: 'first-aid', defaultQuantity: 1 },
  { name: 'Povidone-Iodine', category: 'first-aid', defaultQuantity: 1 },
  { name: 'Wound ointment', category: 'first-aid', defaultQuantity: 1 },
  { name: 'Mefenamic acid', category: 'first-aid', defaultQuantity: 5 },
  { name: 'Paracetamol', category: 'first-aid', defaultQuantity: 10 },
  { name: 'Maintenance medication', category: 'first-aid', defaultQuantity: 1 },

  // TOOLS
  {
    name: 'Pocket knife with can opener',
    category: 'tools',
    defaultQuantity: 1,
  },
  { name: 'Flashlight', category: 'tools', defaultQuantity: 1 },
  { name: 'Matches / Lighter', category: 'tools', defaultQuantity: 1 },
  { name: 'Whistle', category: 'tools', defaultQuantity: 1 },
  { name: 'Rope', category: 'tools', defaultQuantity: 1 },
  { name: 'Fishhook and line', category: 'tools', defaultQuantity: 1 },
  { name: 'Safety goggles', category: 'tools', defaultQuantity: 1 },
  {
    name: 'N95 / Surgical mask',
    category: 'tools',
    defaultQuantity: 5,
  },
  { name: 'Surgical gloves', category: 'tools', defaultQuantity: 2 },

  // TECH
  {
    name: 'Small radio and extra batteries',
    category: 'tech',
    defaultQuantity: 1,
  },
  { name: 'Powerbank and charger', category: 'tech', defaultQuantity: 1 },
  { name: 'Extension cord', category: 'tech', defaultQuantity: 1 },

  // CLOTHING
  {
    name: 'Raincoat or Poncho',
    category: 'clothing',
    defaultQuantity: 1,
  },
  {
    name: 'Lightweight shoes or slippers',
    category: 'clothing',
    defaultQuantity: 1,
  },
  { name: 'Jacket or warm clothes', category: 'clothing', defaultQuantity: 1 },
  {
    name: 'Blanket or Sleeping bag',
    category: 'clothing',
    defaultQuantity: 1,
  },
  { name: '3-day supply of clothes', category: 'clothing', defaultQuantity: 1 },
];
