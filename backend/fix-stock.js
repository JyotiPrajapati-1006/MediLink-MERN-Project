import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';

dotenv.config();

const fixStock = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    let updated = 0;

    for (let p of products) {
      let changed = false;

      // Fix main product stock
      if (p.countInStock < 0) {
        p.countInStock = 0;
        changed = true;
      }

      // Fix variants stock
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach(v => {
          if (v.countInStock < 0) {
            v.countInStock = 0;
            changed = true;
          }
        });
      }

      if (changed) {
        // use updateOne to bypass pre-save hooks and validation if needed, or save
        await Product.updateOne({ _id: p._id }, { $set: { countInStock: p.countInStock, variants: p.variants } });
        updated++;
      }
    }

    console.log(`Updated ${updated} products with negative stock.`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing stock:', error);
    process.exit(1);
  }
};

fixStock();
