

document.querySelector('.registration-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      aadhar_number: document.getElementById('aadhar').value,
      phone: document.getElementById('phone').value,
      address: document.getElementById('address').value,
      farming_type: document.getElementById('farming-type').value,
      password: document.getElementById('password').value
    };
  
    try {
      const response = await fetch('http://localhost:5000/register-farmer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      const result = await response.json();
      
      if (!response.ok) {
        // Handle HTTP errors (4xx, 5xx)
        throw new Error(result.message || `Registration failed with status ${response.status}`);
      }
  
      if (!result.success) {
        // Handle application-level errors
        throw new Error(result.message || 'Registration failed');
      }
  
      // Success case
      alert(result.message);
      console.log('Registered farmer ID:', result.farmerId);
      var register_section = document.getElementById("register");
      register_section.style.display = "none";
      
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.message || 'An unknown error occurred');
    }
  });
// Login form handler
document.querySelector('.login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const loginData = {
      phone: document.getElementById('login-phone').value,
      password: document.getElementById('login-password').value
    };
  
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
  
      const result = await response.json();
  
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed');
      }
  
      // Store farmer info in localStorage
      sessionStorage.setItem('farmerId', result.farmerId);
      sessionStorage.setItem('farmerName', result.name);
      var login_section = document.getElementById("login");
      var register_section = document.getElementById("register");
      
      login_section.style.display = "none";
      register_section.style.display = "none";

      alert(`Welcome back, ${result.name}!`);

      
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message || 'Login failed. Please try again.');
    }
  });
// Add Farming Form Submission
document.querySelector('.farming-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const farmingData = {
        farmer_id: sessionStorage.getItem("farmerId"),
        crop_type: document.getElementById('crop-type').value,
        land_area: parseFloat(document.getElementById('land-area').value),
        soil_type: document.getElementById('soil-type').value
    };

    try {
        const response = await fetch('http://localhost:5000/farming', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(farmingData)
        });

        const result = await response.json();
      
        if (!response.ok) {
          // Handle HTTP errors (4xx, 5xx)
          throw new Error(result.message || `Farming add failed with status ${response.status}`);
        }
    
        if (!result.success) {
          // Handle application-level errors
          throw new Error(result.message || 'Farming added failed');
        }
    
        // Success case
        alert(result.message);
        console.log('Farming ID:', result.farmingID);
        
      } catch (error) {
        console.error('Registration error:', error);
        alert(error.message || 'An unknown error occurred');
      }
});

async function displayFertilizerCards(farmerId) {
    try {
      // Fetch data from backend
      const response = await fetch(`http://localhost:5000/show_fertilizers?farmer_id=${farmerId}`);
      if (!response.ok) throw new Error('Failed to fetch fertilizers');
      
      const { fertilizers } = await response.json();
      const container = document.querySelector('#fertilizers .grid-container');
      
      // Clear existing cards (keep the heading)
      container.innerHTML = '';
      
      if (!fertilizers || fertilizers.length === 0) {
        container.innerHTML = '<p class="no-fertilizers">No recommended fertilizers found for your crops.</p>';
        return;
      }
      
      // Create card for each fertilizer
      fertilizers.forEach(fertilizer => {
        const card = document.createElement('div');
        card.className = 'card fertilizer-card';
        card.innerHTML = `
          <div class="card-header">
            <h3>${fertilizer.name}</h3>
            <span class="price">₹${fertilizer.price}/${fertilizer.unit}</span>
          </div>
          <p>${fertilizer.description}</p>
          <div class="card-actions">
            <button class="btn btn-small buy-btn">Buy Now</button>
            <button class="btn btn-small info-btn">More Info</button>
          </div>
          <div class="more-info">
            <p><strong>Composition:</strong> ${fertilizer.composition}</p>
            <p><strong>Best for:</strong> ${fertilizer.best_for}</p>
            <p><strong>Rating:</strong> 
              <span class="stars">${generateStarRating(fertilizer.rating)}</span>
            </p>
          </div>
        `;
        
        card.querySelector('.info-btn').addEventListener('click', (e) => {
            const card = e.currentTarget.closest('.fertilizer-card');
            
            const infoSection = card.querySelector('.more-info, .show');
            
            if (infoSection.classList.contains("more-info")) {
                infoSection.classList.replace("more-info", "show");
            } else {
                console.log("asdas");
                
                infoSection.classList.replace("show", "more-info");
            }
          });
        container.appendChild(card);
      });
      
    } catch (error) {
      console.error('Error loading fertilizers:', error);
      document.querySelector('#fertilizers .grid-container').innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <p>Failed to load fertilizer recommendations. Please try again later.</p>
        </div>
      `;
    }
  }
  
  // Helper function to generate star ratings
  function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return `
      ${'<i class="fas fa-star"></i>'.repeat(fullStars)}
      ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
      ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
      <span class="rating-text">${rating.toFixed(1)}</span>
    `;
  }
// Laoad market Price

  async function loadMarketPrices() {
    try {
      const response = await fetch('http://localhost:5000/market-price');
      if (!response.ok) throw new Error('Network response was not ok');
      
      const prices = await response.json();
      const tableBody = document.querySelector('#market tbody');
      
      // Clear existing rows
      tableBody.innerHTML = '';
      
      // Create rows for each price entry
      prices.forEach(item => {
        const row = document.createElement('tr');
        
        // Determine CSS class based on direction
        const directionClass = 
          item.direction === 'up' ? 'positive' :
          item.direction === 'down' ? 'negative' : 'neutral';
        
        // Format change percentage with +/-
        const changeSymbol = item.direction === 'up' ? '+' : '';
        const changeText = item.direction === 'neutral' ? '0.0%' : `${changeSymbol}${item.change}%`;
        
        row.innerHTML = `
          <td>${item.crop}</td>
          <td>${item.price}</td>
          <td class="${directionClass}">${changeText}</td>
        `;
        
        tableBody.appendChild(row);
      });
      
    } catch (error) {
      console.error('Error loading market prices:', error);
      document.querySelector('#market tbody').innerHTML = `
        <tr>
          <td colspan="3" class="error">Failed to load market data. Please try again later.</td>
        </tr>
      `;
    }
  }
  
  async function loadCurrentFarming() {
    const farmerId = sessionStorage.getItem('farmerId');
    if (!farmerId) {
      console.error('No farmer ID found');
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/current-farming?farmer_id=${farmerId}`);
      if (!response.ok) throw new Error('Failed to fetch farming data');
      
      const farmingData = await response.json();
      const farmingGrid = document.querySelector('.farming-grid');
      farmingGrid.innerHTML = '';
  
      if (farmingData.length === 0) {
        farmingGrid.innerHTML = `
          <div class="no-farms">
            <i class="fas fa-seedling"></i>
            <p>You don't have any active farms</p>
          </div>
        `;
        return;
      }
  
      farmingData.forEach(farm => {
        const card = document.createElement('div');
        card.className = 'farming-card';
        card.innerHTML = `
          <h3>${farm.crop_name}</h3>
          <p><strong>Land Area:</strong> ${farm.land_area} acres</p>
          <p><strong>Soil Type:</strong> ${farm.soil_type}</p>
          <p><strong>Planted On:</strong> ${farm.planting_date_formatted}</p>
        `;
        farmingGrid.appendChild(card);
      });
  
    } catch (error) {
      console.error('Error:', error);
      document.querySelector('.farming-grid').innerHTML = `
        <div class="error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load farming data</p>
        </div>
      `;
    }
  }
  
  // Load data when page loads
  document.addEventListener('DOMContentLoaded', () => {
    const farmerId = sessionStorage.getItem('farmerId');
    loadMarketPrices();
    if (farmerId) {
      displayFertilizerCards(farmerId);
      loadCurrentFarming();
      var login_section = document.getElementById("login");
      var register_section = document.getElementById("register");
      
      login_section.style.display = "none";
      register_section.style.display = "none";
    } else {
      const container = document.querySelector('#fertilizers .grid-container');
      container.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Please log in as a farmer to view fertilizer recommendations.</p>
          <a href="#login" class="btn">Go to Login</a>
        </div>
      `;
      
    }
  });
