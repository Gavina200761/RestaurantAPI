const express = require('express');
const { body, validationResult } = require('express-validator');
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

const menuValidationRules = [ // Validation rules for creating/updating menu items
  body('name').isString().trim().isLength({ min: 3 }).withMessage('Name must be at least 3 characters'),
  body('description').isString().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),
  body('category').isIn(['appetizer', 'entree', 'dessert', 'beverage']).withMessage('Category must be one of: appetizer, entree, dessert, beverage'),
  body('ingredients').isArray({ min: 1 }).withMessage('Ingredients must be a non-empty array'),
  body('available').optional().isBoolean().withMessage('Available must be a boolean').toBoolean()
];

const validateMenuRequest = (req, res, next) => { // Middleware to validate the request body for menu item creation/updating
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/menu - Retrieve all menu items
app.get('/api/menu', (req, res) => {
  res.status(200).json(menuItems);
});

// GET /api/menu/:id - Retrieve a specific menu item
app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });
  const item = menuItems.find(mi => mi.id === id);
  if (!item) return res.status(404).json({ error: 'Menu item not found' });
  res.status(200).json(item);
});

// POST /api/menu - Add a new menu item
app.post('/api/menu', menuValidationRules, validateMenuRequest, (req, res) => {
  const payload = req.body;

  const newItem = {
    id: getNextId(),
    name: payload.name,
    description: payload.description,
    price: payload.price,
    category: payload.category,
    ingredients: payload.ingredients || [],
    available: payload.available ?? true
  };

  menuItems.push(newItem); // Add the new item to the array
  res.status(201).json(newItem);
});

// PUT /api/menu/:id - Update an existing menu item
app.put('/api/menu/:id', menuValidationRules, validateMenuRequest, (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' }); // Validate that the id parameter is a valid number

  const item = menuItems.find(mi => mi.id === id); 
  if (!item) return res.status(404).json({ error: 'Menu item not found' }); // Check if the item with the specified id exists

  const payload = req.body;
// Update only the fields that are provided in the request body
  item.name = payload.name;
  item.description = payload.description;
  item.price = payload.price;
  item.category = payload.category;
  item.ingredients = payload.ingredients || [];
  item.available = payload.available ?? true;

  res.status(200).json(item);
});

// DELETE /api/menu/:id - Remove a menu item
app.delete('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid id' });

  const index = menuItems.findIndex(mi => mi.id === id);
  if (index === -1) return res.status(404).json({ error: 'Menu item not found' });

  const [removed] = menuItems.splice(index, 1);
  res.status(200).json(removed);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
