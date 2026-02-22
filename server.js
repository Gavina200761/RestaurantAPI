const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => { // Logging middleware to log request details
  const logEntry = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl
  };

  if (req.method === 'POST' || req.method === 'PUT') { // Include request body for POST and PUT requests
    logEntry.body = req.body;
  }

  console.log(JSON.stringify(logEntry));
  next();
});

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

const getNextId = () => { // Generate the next unique ID based on existing items
  const maxId = menuItems.reduce((max, item) => Math.max(max, item.id), 0);
  return maxId + 1;
};

// GET /api/menu - Retrieve all menu items
app.get('/api/menu', (req, res) => {
  res.json(menuItems);
});

// GET /api/menu/:id - Retrieve a specific menu item
app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const item = menuItems.find(mi => mi.id === id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  res.json(item);
});

// POST /api/menu - Add a new menu item
app.post('/api/menu', (req, res) => {
  const payload = req.body;
  if (!payload || typeof payload !== 'object') { // Validate that the request body is present and is an object
    return res.status(400).json({ error: 'Request body is required' });
  }

  const newItem = {
    id: getNextId(),
    name: payload.name,
    description: payload.description,
    price: payload.price,
    category: payload.category,
    ingredients: payload.ingredients || [],
    available: payload.available ?? true
  };

  if (!newItem.name || typeof newItem.price !== 'number') {
    return res.status(400).json({ error: 'Name and numeric price are required' });
  }

  menuItems.push(newItem); // Add the new item to the array
  res.status(201).json(newItem);
});

// PUT /api/menu/:id - Update an existing menu item
app.put('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' }); // Validate that the id parameter is a valid number

  const item = menuItems.find(mi => mi.id === id); 
  if (!item) return res.status(404).json({ error: 'Menu item not found' }); // Check if the item with the specified id exists

  const payload = req.body;
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Request body is required' });
  }
// Update only the fields that are provided in the request body
  if (payload.name !== undefined) item.name = payload.name;
  if (payload.description !== undefined) item.description = payload.description;
  if (payload.price !== undefined) item.price = payload.price;
  if (payload.category !== undefined) item.category = payload.category;
  if (payload.ingredients !== undefined) item.ingredients = payload.ingredients;
  if (payload.available !== undefined) item.available = payload.available;

  res.json(item);
});

// DELETE /api/menu/:id - Remove a menu item
app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const index = menuItems.findIndex(mi => mi.id === id);
  if (index === -1) return res.status(404).json({ error: 'Menu item not found' });

  const [removed] = menuItems.splice(index, 1);
  res.json(removed);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
