require("dotenv").config();
const uuid = require('uuid');
const pg = require("pg");
const client = new pg.Client(process.env.DATABASE_URL);
const bcrypt = require("bcrypt");

client.connect().catch((err) => console.error("Database connection error:", err));

const createUser = async (user, password) => {
    const hashedPassword = await bcrypt.hash(password, 10); 
    const SQL = `
      INSERT INTO users (id, name, password) VALUES ($1, $2, $3) RETURNING *;`;
    const response = await client.query(SQL, [uuid.v4(), user, hashedPassword]);
    return response.rows[0];
};

const createProduct = async (product) => {
    const SQL = `
    INSERT INTO products (id, product) VALUES ($1, $2) RETURNING *;`;
    const response = await client.query(SQL, [uuid.v4(), product]);  // Fixed the uuid call here
    return response.rows[0];
};

const createFavorite = async (product_id, user_id) => {
    const SQL = `
    INSERT INTO favorites (id, product_id, user_id) VALUES ($1, $2, $3) RETURNING *;`;  // Corrected table name to 'favorites'
    const response = await client.query(SQL, [uuid.v4(), product_id, user_id]);  // Fixed uuid call here
    return response.rows[0];
};

// fetch users
const fetchUsers = async () => {
    const SQL = `SELECT * FROM users;`;
    const response = await client.query(SQL);
    return response.rows;
};

// Fetch all products
const fetchProducts = async () => {
    const SQL = `SELECT * FROM products;`;
    const response = await client.query(SQL);
    return response.rows;
};

// Fetch all favorites
const fetchFavorites = async () => {
    const SQL = `
      SELECT f.id, u.name as user, p.product as product
      FROM favorites f
      JOIN users u ON f.user_id = u.id
      JOIN products p ON f.product_id = p.id;`;
    const response = await client.query(SQL);
    return response.rows;
};

// Destroy a favorite
const destroyFavorite = async (favorite_id) => {
    const SQL = `
      DELETE FROM favorites WHERE id = $1 RETURNING *;`;
    const response = await client.query(SQL, [favorite_id]);
    return response.rows[0];
};

module.exports = {
    createUser,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts,
    fetchFavorites,
    destroyFavorite,
};
