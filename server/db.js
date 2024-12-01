require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const pg = require("pg");
const bcrypt = require("bcrypt");

const client = new pg.Client(process.env.DATABASE_URL);

client.connect().catch((err) => console.error("Database connection error:", err));

// Create tables
const createTables = async () => {
  try {
    await client.query(`
      DROP TABLE IF EXISTS favorites;
      DROP TABLE IF EXISTS products;
      DROP TABLE IF EXISTS users;

      CREATE TABLE users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      );

      CREATE TABLE products (
        id UUID PRIMARY KEY,
        product VARCHAR(255) NOT NULL
      );

      CREATE TABLE favorites (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE
      );
    `);
    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

// Create a new user with a hashed password
const createUser = async (name, password) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const SQL = `INSERT INTO users (id, name, password) VALUES ($1, $2, $3) RETURNING *;`;
  const response = await client.query(SQL, [uuidv4(), name, hashedPassword]);
  return response.rows[0];
};

// Fetch all users
const fetchUsers = async () => {
  const SQL = `SELECT id, name FROM users;`;
  const response = await client.query(SQL);
  return response.rows;
};

// Create a new product
const createProduct = async (product) => {
  const SQL = `INSERT INTO products (id, product) VALUES ($1, $2) RETURNING *;`;
  const response = await client.query(SQL, [uuidv4(), product]);
  return response.rows[0];
};

// Fetch all products
const fetchProducts = async () => {
  const SQL = `SELECT * FROM products;`;
  const response = await client.query(SQL);
  return response.rows;
};

// Create a new favorite
const createFavorite = async (user_id, product_id) => {
  const SQL = `INSERT INTO favorites (id, user_id, product_id) VALUES ($1, $2, $3) RETURNING *;`;
  const response = await client.query(SQL, [uuidv4(), user_id, product_id]);
  return response.rows[0];
};

// Fetch all favorites for a user
const fetchFavorites = async (user_id) => {
  const SQL = `
    SELECT f.id, p.product
    FROM favorites f
    JOIN products p ON f.product_id = p.id
    WHERE f.user_id = $1;
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
};

// Delete a favorite
const destroyFavorite = async (favorite_id) => {
  const SQL = `DELETE FROM favorites WHERE id = $1 RETURNING *;`;
  const response = await client.query(SQL, [favorite_id]);
  return response.rows[0];
};

module.exports = {
  client,
  createTables,
  createUser,
  fetchUsers,
  createProduct,
  fetchProducts,
  createFavorite,
  fetchFavorites,
  destroyFavorite,
};
