exports.generateMealPlan = (req, res) => {
  const { diet, mealsPerWeek } = req.body;

  // Recipe data
  const recipes = [
    {
      name: "Vegetable Stir Fry",
      diet: "vegetarian",
      ingredients: [
        { item: "Broccoli", category: "Produce" },
        { item: "Bell Pepper", category: "Produce" },
        { item: "Soy Sauce", category: "Condiments" }
      ]
    },
    {
      name: "Chicken Rice Bowl",
      diet: "omnivore",
      ingredients: [
        { item: "Chicken Breast", category: "Meat" },
        { item: "Rice", category: "Grains" }
      ]
    }
  ];
  // Filter recipes by diet
  const filteredRecipes = recipes.filter(
    (recipe) => recipe.diet === diet
  );
  // Select number of meals requested
  const selectedMeals = filteredRecipes.slice(0, mealsPerWeek);
  // Build grocery list
  const groceryList = {};
  selectedMeals.forEach((meal) => {
    meal.ingredients.forEach((ing) => {
      if (!groceryList[ing.category]) {
        groceryList[ing.category] = [];
      }
      groceryList[ing.category].push(ing.item);
    });
  });
  res.json({
    meals: selectedMeals,
    groceryList
  });
};
