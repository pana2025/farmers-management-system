CREATE DATABASE IF NOT EXISTS farm_management;
USE farm_management;

CREATE TABLE farmers (
    farmer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    aadhar_number VARCHAR(20) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    farming_type ENUM('organic', 'traditional') NOT NULL,
    password VARCHAR(50) NOT NULL
);

CREATE TABLE crops (
    crop_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    season ENUM('kharif', 'rabi') NOT NULL
);

CREATE TABLE fertilizers (
    fertilizer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    type VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(10) NOT NULL,
    description TEXT,
    rating DECIMAL(2,1) CHECK (rating BETWEEN 1 AND 5),  
    composition VARCHAR(100),  
    best_for VARCHAR(100)  
);
CREATE TABLE farmer_farming (
     farming_id INT AUTO_INCREMENT PRIMARY KEY, farmer_id INT NOT NULL, crop_id INT NOT NULL, land_area DECIMAL(6,2) NOT NULL, soil_type VARCHAR(20) NOT NULL, planting_date DATE DEFAULT (CURRENT_DATE), FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id), FOREIGN KEY (crop_id) REFERENCES crops(crop_id) );

CREATE TABLE market_prices (
    price_id INT AUTO_INCREMENT PRIMARY KEY,
    crop_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    change_percentage DECIMAL(5,2),
    change_direction VARCHAR(10) NOT NULL,
    FOREIGN KEY (crop_id) REFERENCES crops(crop_id)
);

CREATE TABLE crop_fertilizers (
    crop_id INT NOT NULL,
    fertilizer_id INT NOT NULL,
    PRIMARY KEY (crop_id, fertilizer_id),
    FOREIGN KEY (crop_id) REFERENCES crops(crop_id),
    FOREIGN KEY (fertilizer_id) REFERENCES fertilizers(fertilizer_id)
);

INSERT INTO crops (name, season) VALUES
('Wheat', 'rabi'),
('Rice', 'kharif'),
('Cotton', 'kharif'),
('Sugarcane', 'kharif'),
('Vegetables', 'rabi');

INSERT INTO fertilizers (name, type, price, unit, description, rating, composition, best_for) VALUES
('Urea', 'nitrogen', 268.00, 'bag', 'Nitrogen-rich fertilizer', 4.0, '46% Nitrogen', 'Leafy crops'),
('DAP', 'phosphatic', 1350.00, 'bag', 'For root development', 4.5, '18% N, 46% P', 'Root crops'),
('NPK', 'compound', 1200.00, 'bag', 'Balanced fertilizer', 4.2, '17-17-17 NPK', 'All crops'),
('Neem Oil', 'organic', 350.00, 'liter', 'Organic pesticide', 4.7, '100% Organic', 'Pest control');

INSERT INTO market_prices (crop_id, price, change_percentage, change_direction) VALUES
(1, 2015.00, 2.5, 'up'),
(2, 1850.00, -1.2, 'down'),
(3, 6750.00, 3.8, 'up'),
(4, 3150.00, 0.0, 'neutral');

INSERT INTO crop_fertilizers (crop_id, fertilizer_id) VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 3),
(3, 1),
(3, 4);