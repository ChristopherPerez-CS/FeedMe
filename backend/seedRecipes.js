const fs = require("fs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_KEY = "55350f86b4e34c5e830cbc49ec73f638";
console.log("API KEY:", API_KEY ? "Loaded" : "Missing");
async function fetchBatch(offset = 0, number = 20) {
  const url = `https://api.spoonacular.com/recipes/complexSearch` +
  `?apiKey=${API_KEY}&number=${number}&offset=${offset}` +
  `&addRecipeInformation=true` +
  `&fillIngredients=true`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    console.error(data);
    throw new Error("API request failed");
  }

  return data.results || [];
}

async function seed(total = 80) {
  const pageSize = 20;
  let allRecipes = [];

  for (let offset = 0; offset < total; offset += pageSize) {
    console.log(`Fetching recipes ${offset} → ${offset + pageSize}`);

    try {
      const batch = await fetchBatch(offset, pageSize);
      allRecipes = allRecipes.concat(batch);

      // SAVE AFTER EACH BATCH
      const unique = Array.from(
        new Map(allRecipes.map((r) => [r.id, r])).values(),
      );

      fs.writeFileSync(
        "./src/data/realRecipes.json",
        JSON.stringify(unique, null, 2),
      );

      console.log(`Saved ${unique.length} recipes so far`);
    } catch (err) {
      console.error("Stopped early due to error:", err.message);
      break; // stop when API limit hits
    }

    await new Promise((r) => setTimeout(r, 1200));
  }
}

seed(80).catch(console.error);
