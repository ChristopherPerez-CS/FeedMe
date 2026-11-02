const axios = require("axios");
const API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = "https://api.spoonacular.com";
//const { mockRecipes } = require("../data/mockRecipes");
const realRecipes = require("../data/realRecipes.json");
const USE_API = false;

async function fetchRecipes(diet, number) {
  if (!USE_API) {
    return realRecipes.slice(0, number);
  }
  try {
    // Search for recipes
    const searchResponse = await axios.get(
      `${BASE_URL}/recipes/complexSearch`,
      {
        params: {
          apiKey: API_KEY,
          diet: diet,
          number: number,
          //offset: Math.floor(Math.random() * 100) 
        },
      },
    );
    const recipes = searchResponse.data.results;
    const detailedRecipes = [];
    for (let recipe of recipes) {
      const detailResponse = await axios.get(
        `${BASE_URL}/recipes/${recipe.id}/information`,
        {
          params: {
            apiKey: API_KEY,
            includeNutrition: true,
          },
        },
      );

      detailedRecipes.push(detailResponse.data);
    }
    const fs = require("fs");
    const path = require("path");

    const filePath = path.join(__dirname, "../data/realRecipes.json");

    // Read existing recipes
    let existing = [];
    if (fs.existsSync(filePath)) {
      existing = JSON.parse(fs.readFileSync(filePath));
    }

    // Combine old + new
    const combined = [...existing, ...detailedRecipes];

    // Remove duplicates by ID
    const unique = Array.from(new Map(combined.map((r) => [r.id, r])).values());

    // Save back to file
    //fs.writeFileSync(filePath, JSON.stringify(unique, null, 2));

    //console.log("Recipes appended successfully!");
    return detailedRecipes;
  } catch (error) {
    console.error(
      "Spoonacular API error:",
      error.response?.data || error.message,
    );

    console.log("Using mock recipe dataset instead.");

    return [];
  }
}

module.exports = { fetchRecipes };
