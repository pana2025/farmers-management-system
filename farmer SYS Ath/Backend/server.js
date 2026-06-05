const express = require('express');
const mysql = require('mysql2'); // Typo fixed (mysql2)
const bodyParser = require('body-parser');
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Database connection config
const db = mysql.createConnection({
    host: "localhost",
    port: 3307,
    user: "root",
    password: "root",
    database: "farm_management" // Sahi database naam update kar diya hai
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// Farmer registration endpoint
app.post('/register-farmer', (req, res) => {
  if (!req.body.name || !req.body.aadhar_number || !req.body.phone) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  const { name, aadhar_number, phone, address, farming_type, password } = req.body;
  
  const sql = `INSERT INTO farmers (name, aadhar_number, phone, address, farming_type, password) 
               VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.query(sql, [name, aadhar_number, phone, address, farming_type, password], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Database operation failed",
        error: err.code 
      });
    }
    
    res.status(201).json({
      success: true,
      message: "Registration successful",
      farmerId: result.insertId
    });
  });
});

// Login Endpoint
app.post('/login', (req, res) => {
  const { phone, password } = req.body;

  // 1. First validate inputs
  if (!phone || !password) {
    return res.status(400).json({
      success: false,
      message: "Phone and password are required"
    });
  }

  // 2. Check if farmer exists
  const sql = `SELECT farmer_id, name FROM farmers WHERE phone = ? AND password = ?`;
  
  db.query(sql, [phone, password], (err, results) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        success: false,
        message: "Database error during login"
      });
    }

    // 3. Verify credentials
    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid phone number or password"
      });
    }

    // 4. Successful login
    const farmer = results[0];
    res.status(200).json({
      success: true,
      message: "Login successful",
      farmerId: farmer.farmer_id,
      name: farmer.name
    });
  });
});

// Farmer Farming Data Endpoint
app.post('/farming', (req, res) => {
  const { farmer_id, crop_type, land_area, soil_type } = req.body;

  // Step 1: Find crop_id from crop_type (e.g., "Wheat" → 1)
  const findCropIdQuery = `SELECT crop_id FROM crops WHERE name = ?`;
  
  db.query(findCropIdQuery, [crop_type], (err, cropResult) => {
    if (err) { 
      console.error("Crop lookup error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to find crop",
        error: err.sqlMessage
      });
    }

    // If crop not found
    if (cropResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid crop type: " + crop_type
      });
    }

    const crop_id = cropResult[0].crop_id; 

    // Step 2: Insert into farmer_farming with the correct crop_id
    const insertQuery = `
      INSERT INTO farmer_farming (farmer_id, crop_id, land_area, soil_type) 
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertQuery, [farmer_id, crop_id, land_area, soil_type], (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to add farming data",
          error: err.sqlMessage
        });
      }

      // Success
      res.status(201).json({
        success: true,
        message: "Farming data added successfully!",
        farmingID: result.insertId
      });
    });
  });
});

// Get fertilizers for a farmer's crops
app.get('/show_fertilizers', (req, res) => {
  const { farmer_id } = req.query;

  if (!farmer_id) {
      return res.status(400).send('Farmer ID is required');
  }

  // Query to get crops and fertilizers
  const query = `
      SELECT f.* FROM fertilizers f
      JOIN crop_fertilizers cf ON f.fertilizer_id = cf.fertilizer_id
      JOIN farmer_farming ff ON cf.crop_id = ff.crop_id
      WHERE ff.farmer_id = ?
  `;

  db.query(query, [farmer_id], (err, results) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Database error');
      }

      // Server console log
      console.log(`Fertilizers for farmer ${farmer_id}:`, results);

      // Client response
      if (results.length === 0) {
          res.send(`No fertilizers found for farmer ID: ${farmer_id}`);
      } else {
          res.send({
              farmer_id: farmer_id,
              fertilizers: results
          });
      }
  });
});

// Endpoint to get market prices
app.get('/market-price', (req, res) => {
  const query = `
    SELECT 
      c.name AS crop_name,
      mp.price,
      mp.change_percentage,
      mp.change_direction
    FROM market_prices mp
    JOIN crops c ON mp.crop_id = c.crop_id
    ORDER BY mp.crop_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch market prices' });
    }

    // Format prices with Indian number formatting
    const formattedPrices = results.map(item => ({
      crop: item.crop_name,
      price: new Intl.NumberFormat('en-IN').format(item.price),
      change: item.change_percentage,
      direction: item.change_direction
    }));

    res.json(formattedPrices);
  });
});

// GET endpoint for farmer's current crops
app.get('/current-farming', (req, res) => {
  const farmerId = req.query.farmer_id;
  
  if (!farmerId) {
    return res.status(400).json({ error: 'Farmer ID is required' });
  }

  const query = `
    SELECT 
      c.name AS crop_name,
      ff.land_area,
      ff.soil_type,
      DATE_FORMAT(ff.planting_date, '%e %b %Y') AS planting_date_formatted
    FROM farmer_farming ff
    JOIN crops c ON ff.crop_id = c.crop_id
    WHERE ff.farmer_id = ?
    ORDER BY ff.planting_date DESC
  `;

  db.query(query, [farmerId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to fetch farming data' });
    }
    res.json(results);
  });
});

// Start Server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});