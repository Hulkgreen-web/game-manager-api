const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Stockage en mémoire
let games = [
  {
    id: "1",
    title: "The Legend of Zelda: Breath of the Wild",
    description: "Open-world adventure game",
    genre: "Action-Adventure",
    platform: "Nintendo Switch",
    rating: 9.5,
    releaseDate: "2017-03-03T00:00:00Z",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg",
    isFavorite: true,
  },
  {
    id: "2",
    title: "Cyberpunk 2077",
    description: "Futuristic RPG",
    genre: "RPG",
    platform: "PC",
    rating: 8.0,
    releaseDate: "2020-12-10T00:00:00Z",
    imageUrl: "https://upload.wikimedia.org/wikipedia/en/9/9f/Cyberpunk_2077_box_art.jpg",
    isFavorite: false,
  },
];

let nextId = 3;

// Helper functions
function findGameById(id) {
  return games.find((game) => game.id === id);
}

function findGameIndexById(id) {
  return games.findIndex((game) => game.id === id);
}

function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

// Validation middleware
function validateGameData(req, res, next) {
  const { title, description, genre, platform, rating, releaseDate, imageUrl } =
    req.body;
  const errors = [];

  if (!title || typeof title !== "string") {
    errors.push({
      field: "title",
      message: "Title is required and must be a string",
    });
  }
  if (!description || typeof description !== "string") {
    errors.push({
      field: "description",
      message: "Description is required and must be a string",
    });
  }
  if (!genre || typeof genre !== "string") {
    errors.push({
      field: "genre",
      message: "Genre is required and must be a string",
    });
  }
  if (!platform || typeof platform !== "string") {
    errors.push({
      field: "platform",
      message: "Platform is required and must be a string",
    });
  }
  if (
    rating === undefined ||
    typeof rating !== "number" ||
    rating < 0 ||
    rating > 10
  ) {
    errors.push({
      field: "rating",
      message: "Rating must be a number between 0 and 10",
    });
  }
  if (!releaseDate || !isValidDate(releaseDate)) {
    errors.push({
      field: "releaseDate",
      message: "Release date must be a valid ISO 8601 date",
    });
  }
  if (!imageUrl || typeof imageUrl !== "string") {
    errors.push({
      field: "imageUrl",
      message: "Image URL is required and must be a string",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Invalid input data",
      details: errors,
      code: 400,
    });
  }

  next();
}

// Routes

// GET all games
app.get("/api/games", (req, res) => {
  res.status(200).json(games);
});

// GET game by ID
app.get("/api/games/:id", (req, res) => {
  const game = findGameById(req.params.id);
  if (!game) {
    return res.status(404).json({
      message: `404 Not Found : No such game found with id ${req.params.id}`,
    });
  }
  res.status(200).json(game);
});

// POST new game
app.post("/api/games", validateGameData, (req, res) => {
  const { title, description, genre, platform, rating, releaseDate, imageUrl } =
    req.body;

  const newGame = {
    id: nextId.toString(),
    title,
    description,
    genre,
    platform,
    rating,
    releaseDate,
    imageUrl,
    isFavorite: false,
  };

  games.push(newGame);
  nextId++;

  res.status(201).json(newGame);
});

// PUT update game
app.put("/api/games/:id", validateGameData, (req, res) => {
  const gameIndex = findGameIndexById(req.params.id);
  if (gameIndex === -1) {
    return res.status(404).json({
      message: `404 Not Found : No such game found with id ${req.params.id}`,
    });
  }

  const { title, description, genre, platform, rating, releaseDate, imageUrl } =
    req.body;

  const updatedGame = {
    ...games[gameIndex],
    title,
    description,
    genre,
    platform,
    rating,
    releaseDate,
    imageUrl,
  };

  games[gameIndex] = updatedGame;
  res.status(200).json(updatedGame);
});

// DELETE game
app.delete("/api/games/:id", (req, res) => {
  const gameIndex = findGameIndexById(req.params.id);
  if (gameIndex === -1) {
    return res.status(404).json({
      message: `404 Not Found : No such game found with id ${req.params.id}`,
    });
  }

  games.splice(gameIndex, 1);
  res.status(200).json({ message: "Game deleted successfully" });
});

// PATCH favorite status
app.patch("/api/games/:id/favorite", (req, res) => {
  const gameIndex = findGameIndexById(req.params.id);
  if (gameIndex === -1) {
    return res.status(404).json({
      message: `404 Not Found : No such game found with id ${req.params.id}`,
    });
  }

  games[gameIndex].isFavorite = !games[gameIndex].isFavorite;
  res.status(200).json(games[gameIndex]);
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Game Manager API is running!",
    version: "1.0.0",
    endpoints: [
      "GET /api/games - Get all games",
      "GET /api/games/:id - Get game by ID",
      "POST /api/games - Create new game",
      "PUT /api/games/:id - Update game",
      "DELETE /api/games/:id - Delete game",
      "PATCH /api/games/:id/favorite - Toggle favorite status",
    ],
  });
});

// Handle 404 for API routes
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found. Available endpoints: /games, /games/:id",
  });
});

// Handle all other routes
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Route not found. Please use /api endpoints",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
  console.log(`🎮 ${games.length} games loaded in memory`);
});
