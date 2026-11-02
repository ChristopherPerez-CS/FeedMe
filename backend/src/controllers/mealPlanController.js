const { fetchRecipes } = require("../utils/spoonacularService");
const { generateMealPlanLogic } = require("../utils/mealPlanner");

function passesFilters(recipe, diet, allergies, dislikes) {
  const ingredients = recipe.extendedIngredients.map((ing) =>
    ing.name.toLowerCase(),
  );

  // DIET
  if (diet === "vegetarian" && recipe.vegetarian !== true) return false;
  if (diet === "vegan" && recipe.vegan !== true) return false;

  // ALLERGIES
  if (allergies.length > 0) {
    if (
      ingredients.some((ing) =>
        allergies.some((a) => ing.includes(a.toLowerCase())),
      )
    ) {
      return false;
    }
  }

  // DISLIKES
  if (dislikes.length > 0) {
    if (
      ingredients.some((ing) =>
        dislikes.some((d) => ing.includes(d.toLowerCase())),
      )
    ) {
      return false;
    }
  }

  return true;
}

exports.getMealOptions = async (req, res) => {
  try {
    const { diet, allergies = [], dislikes = [] } = req.body;

    // TEMP: use local JSON directly instead of fetchRecipes
    const recipes = require("../data/realRecipes.json");

    const filtered = recipes.filter((r) => passesFilters(r, diet, allergies, dislikes));

    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    const simplified = shuffled.slice(0, 40).map((r) => ({
      id: r.id,
      name: r.title,
      image: r.image,
      readyInMinutes: r.readyInMinutes,
    }));

    res.json(simplified);
  } catch (err) {
    console.error("OPTIONS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch meal options" });
  }
};

//  GENERATE FROM SELECTED MEALS
exports.generateFromSelection = async (req, res) => {
  try {
    const { selectedMeals, allergies = [], dislikes = [], diet } = req.body;

    if (!selectedMeals || selectedMeals.length === 0) {
      return res.status(400).json({ error: "No meals selected" });
    }

    // Use SAME recipes as options
    const recipes = require("../data/realRecipes.json");

    const result = await generateMealPlanLogic(
      diet,
      selectedMeals.length,
      allergies,
      dislikes,
      recipes, // <-- pass recipes
      selectedMeals, // <-- pass selected IDs
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate meal plan" });
  }
};

exports.generateMealPlan = async (req, res) => {
  try {
    const { diet, mealsPerWeek, allergies = [], dislikes = [] } = req.body;

    if (!diet || !mealsPerWeek) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await generateMealPlanLogic(
      diet,
      mealsPerWeek,
      allergies,
      dislikes,
    );

    if (result.error) {
      return res.status(404).json(result);
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate meal plan" });
  }
};
