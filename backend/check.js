import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from './models/Product.js';

dotenv.config();

const getStock = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({'name': /Amul Fruit/i});
    console.log(JSON.stringify(products, null, 2));
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

getStock();
