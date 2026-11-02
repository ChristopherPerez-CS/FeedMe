const express = require("express");
const router = express.Router();
const mealPlanController = require("../controllers/mealPlanController");

router.post("/", mealPlanController.generateMealPlan);
router.post("/options", mealPlanController.getMealOptions);
router.post("/generate", mealPlanController.generateFromSelection);

module.exports = router;
// http://localhost:3000/api/meal-plan