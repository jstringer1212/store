require("dotenv").config();
const express = require("express");
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
const bodyParser = require("body-parser");
const {
  createUser,
  login, 
  createProduct,
  createFavorite,
  fetchUsers, 
  fetchProducts,
  fetchFavorites,
  destroyFavorite,
} = require("./db.js"); // Adjust this to the actual file name where your database logic resides

const app = express();
const PORT = process.env.PORT;

client.connect().catch((err) => { 
    console.error("Database connection error:", err);
  });


  app.use(express.json());

// Routes

// Create a new user
app.post("/api/users", async (req, res) => {
  const { username, password } = req.body;
  try {
    const newUser = await createUser(username, password);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login a user
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await login(username, password);
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Create a new product
app.post("/api/products", async (req, res) => {
  const { product } = req.body;
  try {
    const newProduct = await createProduct(product);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new favorite
app.post("/api/favorites", async (req, res) => {
  const { product_id, user_id } = req.body;
  try {
    const newFavorite = await createFavorite(product_id, user_id);
    res.status(201).json(newFavorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await fetchUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await fetchProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all favorites
app.get("/api/favorites", async (req, res) => {
  try {
    const favorites = await fetchFavorites();
    res.status(200).json(favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a favorite
app.delete("/api/favorites/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedFavorite = await destroyFavorite(id);
    res.status(200).json(deletedFavorite);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
