const express = require('express');
const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const app = express();
const port = 8000;


// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/sellerApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});


// Define the seller schema
const sellerSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
  },
  businessName: {
    type: String,
  },
  password: {
    type: Number,
  },
  storeInfo: {
    address: String,
    gst: String,
    logo: String,
    storeTimings: String,
  },

  categories: [
    {
      name: String,
      subcategories: [
        {
          name: String,
        },
      ],
    },
  ],
  inventory: [
    {
      category: String,
      subcategory: String,
      productName: String,
      mrp: Number,
      sp: Number,
      qty: Number,
      images: [String],
    },
  ],
});
const Seller = mongoose.model('Seller', sellerSchema);




// Configure middleware
app.use(express.urlencoded({ extended: true }));




app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
  })
);


// Define routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});



app.post('/signup', async (req, res) => {
  try {
    const { email, businessName, password, confirmPassword } = req.body;

    // Validate form data
    if (!email || !businessName || !password || !confirmPassword) {
      return res.status(400).send('All fields are required');
    }

    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match');
    }

    // Check if email is already registered
    const existingSeller = await Seller.findOne({ email });
    if (existingSeller) {
      return res.status(400).send('Email already registered');
    }

    // Hash the password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new seller document
    const seller = new Seller({
      email,
      businessName,
      password,
    });
    await seller.save();

    req.session.sellerId = seller._id;

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/dashboard', (req, res) => {
  if (!req.session.sellerId) {
    return res.redirect('/');
  }
  const filePath = path.join(__dirname, 'dashboard.html');
  res.sendFile(filePath);
//   res.sendFile(__dirname + '/dashboard.html');
});


// Add store info
app.post('/store-info', async (req, res) => {
  try {
    const sellerId = req.session.sellerId;
    const { address, gst, logo, storeTimings } = req.body;

    // Find the seller by ID
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).send('Seller not found');
    }

    // Update store info
    seller.storeInfo = {
      address,
      gst,
      logo,
      storeTimings,
    };
    await seller.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



// Add category
app.post('/category', async (req, res) => {
  try {
    const sellerId = req.session.sellerId;
    const { categoryName } = req.body;

    // Find the seller by ID
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).send('Seller not found');
    }

    // Add category
    seller.categories.push({ name: categoryName });
    await seller.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



// Add subcategory
app.post('/subcategory', async (req, res) => {
  try {
    const sellerId = req.session.sellerId;
    const { categoryId, subcategoryName } = req.body;

    // Find the seller by ID
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).send('Seller not found');
    }

    // Find the category by ID and add subcategory
    const category = seller.categories.findById(categoryId);
    // ?clg
    console.log(category)
    
    if (!category) {
      return res.status(404).send('Category not found');
    }

    category.subcategories.push(subcategoryName);
    await seller.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



// Add inventory
app.post('/inventory', async (req, res) => {
  try {
    const sellerId = req.session.sellerId;
    const { categoryId, subcategoryId, productName, mrp, sp, qty, images } =
      req.body;

    // Find the seller by ID
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(404).send('Seller not found');
    }

    // Add inventory item
    seller.inventory.push({
      category: categoryId,
      subcategory: subcategoryId,
      productName,
      mrp,
      sp,
      qty,
      images: images.split(',').map((image) => image.trim()),
    });
    await seller.save();

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});




app.get('/search', (req, res) => {
    const searchQuery = req.query.q;
  
    // Find matching products in the inventory based on the search query
    Seller.find({ 'inventory.productName': { $regex: searchQuery, $options: 'i' } })
      .then((sellers) => {
        const searchResults = sellers.reduce((results, seller) => {
          const matchingProducts = seller.inventory.filter((product) =>
            product.productName.toLowerCase().includes(searchQuery.toLowerCase())
          );
  
          return results.concat(matchingProducts);
        }, []);
  
        // Render the search results view with the matching products data
        res.render('search-results', { searchResults });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Internal Server Error');
      });
  });
  
  
  
  
  
  
  
  
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
