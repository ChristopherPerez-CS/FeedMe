require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Routes
const testRoutes = require("./src/routes/testRoutes");
const mealPlanRoutes = require("./src/routes/mealPlanRoutes");

app.use("/api/test", testRoutes);
app.use("/api/meal-plan", mealPlanRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// http://localhost:3000/api/meal-plan