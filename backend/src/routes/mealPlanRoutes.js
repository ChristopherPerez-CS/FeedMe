const express = require("express");
const router = express.Router();
const mealPlanController = require("../controllers/mealPlanController");
// POST because we are sending data
router.post("/", mealPlanController.generateMealPlan);
module.exports = router;
// http://localhost:3000/api/meal-plan