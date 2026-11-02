const allergyMap = {
  dairy: ["milk", "cheese", "butter", "cream", "yogurt"],
  nuts: ["almond", "cashew", "peanut", "walnut", "pecan"],
  gluten: ["flour", "bread", "pasta", "wheat"],
  soy: ["soy", "tofu", "soy sauce"],
  eggs: ["egg"],
  shellfish: ["shrimp", "crab", "lobster"],
};

function expandTerms(inputList, map) {
  let expanded = [];

  inputList.forEach((item) => {
    if (map[item]) {
      expanded = expanded.concat(map[item]);
    } else {
      expanded.push(item);
    }
  });

  return expanded;
}

const { fetchRecipes } = require("./spoonacularService");
const invalidUnits = [
  "serving",
  "servings",
  "handful",
  "bag",
  "dash",
  "dashes",
  "additional",
  "optional",
  "pinch",
  "pinches",
  "to taste",
];
const noQuantityIngredients = [
  "salt",
  "pepper",
  "sea salt",
  "black pepper",
  "sesame seed",
  "water",
  "oil",
  "olive oil",
  "vegetable oil",
];
function normalizeIngredientName(name) {
  if (!name) return "";

  let normalized = name.toLowerCase().trim();

  // Remove descriptors
  const descriptors = [
    "fresh",
    "large",
    "small",
    "medium",
    "chopped",
    "diced",
    "minced",
    "ground",
    "sliced",
    "shredded",
    "extra",
    "virgin",
    "additional",
    "optional",
    "of",
    "whole",
  ];

  descriptors.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "g");
    normalized = normalized.replace(regex, "");
  });

  // 🔥 NEW: unify similar ingredients
  if (normalized.includes("sea salt")) normalized = "salt";
  if (normalized.includes("kosher salt")) normalized = "salt";
  if (normalized.includes("black pepper")) normalized = "pepper";

  // 🔥 REMOVE "and" combos like "salt and pepper"
  if (normalized.includes("salt and pepper")) normalized = "salt";

  normalized = normalized.replace(/[^a-zA-Z\s-]/g, "");

  return normalized.trim();
}

function normalizeUnit(unit) {
  if (!unit) {
    return "";
  }
  const normalized = unit.toLowerCase().trim();
  const unitMap = {
    cups: "cup",
    cup: "cup",
    c: "cup",
    tablespoons: "tbsp",
    tablespoon: "tbsp",
    tbsp: "tbsp",
    teaspoons: "tsp",
    teaspoon: "tsp",
    tsp: "tsp",
    t: "tsp",
    grams: "g",
    gram: "g",
    g: "g",
    kilograms: "kg",
    kilogram: "kg",
    kg: "kg",
    ounces: "oz",
    ounce: "oz",
    oz: "oz",
    pounds: "lb",
    pound: "lb",
    lb: "lb",
    liters: "l",
    liter: "l",
    l: "l",
    milliliters: "ml",
    milliliter: "ml",
    ml: "ml",
    cloves: "clove",
    clove: "clove",
  };
  return unitMap[normalized] || normalized;
}

async function generateMealPlanLogic(
  diet,
  mealsPerWeek,
  allergies = [],
  dislikes = [],
  providedRecipes = null,
  selectedMeals = [],
) {
  function matchesDiet(recipe, diet) {
    if (!diet || diet === "omnivore") return true;

    if (diet === "vegetarian") {
      return recipe.vegetarian === true;
    }

    if (diet === "vegan") {
      return recipe.vegan === true;
    }

    if (diet === "pescatarian") {
      // vegetarian but NOT vegan (allows fish typically, but Spoonacular doesn't flag fish cleanly)
      return recipe.vegetarian === true;
    }

    return true;
  }
  const fetchCount = mealsPerWeek * 3;
  let recipes;

  if (providedRecipes) {
    recipes = providedRecipes;
  } else {
    const fetchCount = mealsPerWeek * 3;
    recipes = await fetchRecipes(diet, fetchCount);
  }

  if (!recipes || recipes.length === 0) {
    return { error: "No recipes found." };
  }

  // Normalize inputs
  const cleanedAllergies = allergies
    .map((a) => a.toLowerCase().trim())
    .filter((a) => a !== "");

  const cleanedDislikes = dislikes
    .map((d) => d.toLowerCase().trim())
    .filter((d) => d !== "");

  const allergyList = expandTerms(cleanedAllergies, allergyMap);
  const dislikeList = cleanedDislikes;

  // Filter recipes
  const filteredRecipes = recipes.filter((recipe) => {
    const passesDiet = matchesDiet(recipe, diet);

    const hasAllergen = recipe.extendedIngredients.some((ing) => {
      const name = ing.name.toLowerCase();
      return allergyList.some((allergy) => name.includes(allergy));
    });

    const hasDislike = recipe.extendedIngredients.some((ing) => {
      const name = ing.name.toLowerCase();
      return dislikeList.some((dislike) => name.includes(dislike));
    });

    return passesDiet && !hasAllergen && !hasDislike;
  });

  if (filteredRecipes.length === 0) {
    return { error: "No recipes match your filters." };
  }

  let finalRecipes;

  if (selectedMeals && selectedMeals.length > 0) {
    finalRecipes = filteredRecipes.filter((recipe) =>
      selectedMeals.includes(recipe.id),
    );
  } else {
    finalRecipes = filteredRecipes.slice(0, mealsPerWeek);
  }

  const groceryList = {};
  let weeklyCalories = 0;
  let weeklyProtein = 0;
  let weeklyCarbs = 0;
  let weeklyFat = 0;

  finalRecipes.forEach((recipe) => {
    // Nutrition
    if (recipe.nutrition && recipe.nutrition.nutrients) {
      recipe.nutrition.nutrients.forEach((nutrient) => {
        if (nutrient.name === "Calories") {
          weeklyCalories += nutrient.amount;
        }
        if (nutrient.name === "Protein") {
          weeklyProtein += nutrient.amount;
        }
        if (nutrient.name === "Carbohydrates") {
          weeklyCarbs += nutrient.amount;
        }
        if (nutrient.name === "Fat") {
          weeklyFat += nutrient.amount;
        }
      });
    }

    // Ingredients
    recipe.extendedIngredients.forEach((ing) => {
      const category = ing.aisle || "Other";
      const name = normalizeIngredientName(ing.name);
      const unit = normalizeUnit(ing.unit);
      const amount = ing.amount || 0;

      let cleanedUnit = unit;
      if (invalidUnits.includes(unit)) {
        cleanedUnit = "";
      }
      if (name.includes("salt and pepper")) {
        name = "salt"; // or split if you want (optional)
      }
      const key = name;

      if (!groceryList[category]) {
        groceryList[category] = {};
      }

      if (groceryList[category][key]) {
        groceryList[category][key].amount += amount;
      } else {
        groceryList[category][key] = {
          name,
          amount,
          unit: cleanedUnit || "",
        };
      }
    });
  });

  const formattedGroceryList = {};
  for (const category in groceryList) {
    formattedGroceryList[category] = Object.values(groceryList[category])
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => {
        let roundedAmount = Math.round(item.amount * 100) / 100;
        // If it's produce and fractional → round up
        if (!item.unit && roundedAmount % 1 !== 0) {
          roundedAmount = Math.ceil(roundedAmount);
        }

        if (noQuantityIngredients.includes(item.name)) {
          return item.name;
        }

        if (item.unit) {
          return `${roundedAmount} ${item.unit} ${item.name}`;
        }

        return `${roundedAmount} ${item.name}`;
      });
  }

  const dailyCalories = weeklyCalories / mealsPerWeek;
  const dailyProtein = weeklyProtein / mealsPerWeek;
  const dailyCarbs = weeklyCarbs / mealsPerWeek;
  const dailyFat = weeklyFat / mealsPerWeek;

  return {
    meals: finalRecipes.map((r) => ({
      name: r.title,
      readyInMinutes: r.readyInMinutes,
      servings: r.servings,
      image: r.image,
      ingredients: r.extendedIngredients,
      instructions: r.instructions,
      sourceUrl: r.sourceUrl,
    })),
    groceryList: formattedGroceryList,
    weeklyNutrition: {
      weeklyCalories: Math.round(weeklyCalories),
      weeklyProtein: Math.round(weeklyProtein),
      weeklyCarbs: Math.round(weeklyCarbs),
      weeklyFat: Math.round(weeklyFat),
      dailyCalories: Math.round(dailyCalories),
      dailyProtein: Math.round(dailyProtein),
      dailyCarbs: Math.round(dailyCarbs),
      dailyFat: Math.round(dailyFat),
    },
  };
}
module.exports = { generateMealPlanLogic };
