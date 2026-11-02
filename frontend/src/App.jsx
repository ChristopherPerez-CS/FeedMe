import { useState } from "react";

function App() {
  const [diet, setDiet] = useState("");
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedDislikes, setSelectedDislikes] = useState([]);
  const [mealOptions, setMealOptions] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState([]);
  const [expandedMeals, setExpandedMeals] = useState([]);
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState(false);
  const pageSize = 10;

  const paginatedMeals = mealOptions.slice(
    page * pageSize,
    (page + 1) * pageSize,
  );

  const toggleExpand = (index) => {
    setExpandedMeals(
      expandedMeals.includes(index)
        ? expandedMeals.filter((i) => i !== index)
        : [...expandedMeals, index],
    );
  };

  const toggleMeal = (id) => {
    setSelectedMeals(
      selectedMeals.includes(id)
        ? selectedMeals.filter((m) => m !== id)
        : [...selectedMeals, id],
    );
  };

  const toggleItem = (item, list, setList) => {
    setList(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
    );
  };

  const copyGroceryList = () => {
    if (!mealPlan?.groceryList) return;

    let text = "Grocery List:\n\n";

    for (const [category, items] of Object.entries(mealPlan.groceryList)) {
      text += `${category}:\n`;
      items.forEach((item) => {
        text += `- ${item}\n`;
      });
      text += "\n";
    }

    navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => setCopied(false), 2000);
  };

  const allergyOptions = [
    "shellfish",
    "fish",
    "gluten",
    "dairy",
    "peanut",
    "treenut",
    "soy",
    "egg",
    "sesame",
    "mustard",
  ];
  const dislikeOptions = [
    "avocado",
    "beef",
    "beets",
    "bell pepper",
    "blue cheese",
    "brussel sprouts",
    "eggplant",
    "eggs",
    "lamb",
    "mushrooms",
    "shrimp",
    "tuna",
    "tofu",
    "quinoa",
    "salmon",
    "olives",
    "pork",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMealOptions([]);
    setMealPlan(null);
    setSelectedMeals([]);

    try {
      const res = await fetch("http://localhost:3000/api/meal-plan/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diet,
          allergies: selectedAllergies,
          dislikes: selectedDislikes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMealOptions(data);
      setPage(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "#121212",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
        padding: "2rem",
        maxWidth: "1100px",
        margin: "0 auto",
        width: "100%",
        padding: "2.5rem 1.5rem",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "2rem", borderBottom: "1px solid #333" }}>
        <h1
          style={{
            color: "#4CAF50",
            fontSize: "2.5rem",
            fontWeight: "700",
            letterSpacing: "1px",
          }}
        >
          Feed Me
        </h1>
        <p style={{ color: "#aaa", fontSize: "1.1rem" }}>
          Meal Planning Made Simple
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ color: "#4CAF50" }}>Diet</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              "vegetarian",
              "omnivore",
              "vegan",
              "pescatarian",
              "paleo",
              "low carb",
            ].map((item) => {
              const isSelected = diet === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDiet(item)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: isSelected ? "2px solid #4CAF50" : "1px solid #555",
                    background: isSelected ? "#1f3d2b" : "#1E1E1E",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    transition: "0.2s",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ color: "#4CAF50" }}>Allergies</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {allergyOptions.map((item) => {
              const isSelected = selectedAllergies.includes(item);

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    toggleItem(item, selectedAllergies, setSelectedAllergies)
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: isSelected ? "2px solid #4CAF50" : "1px solid #555",
                    background: isSelected ? "#1f3d2b" : "#1E1E1E",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ color: "#FF7043" }}>Dislikes</h3>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {dislikeOptions.map((item) => {
              const isSelected = selectedDislikes.includes(item);

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    toggleItem(item, selectedDislikes, setSelectedDislikes)
                  }
                  style={{
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: isSelected ? "2px solid #FF7043" : "1px solid #555",
                    background: isSelected ? "#3d1f1f" : "#1E1E1E",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
        <button
          style={{
            marginTop: "1rem",
            background: "#4CAF50",
            color: "#fff",
            padding: "10px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Find Meals
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* MEAL SELECTION */}
      {mealOptions.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Select Meals ({selectedMeals.length})</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            {paginatedMeals.map((meal) => {
              const isSelected = selectedMeals.includes(meal.id);

              return (
                <div
                  key={meal.id}
                  onClick={() => toggleMeal(meal.id)}
                  style={{
                    cursor: "pointer",
                    background: isSelected ? "#1f3d2b" : "#1E1E1E",
                    border: isSelected ? "2px solid #4CAF50" : "1px solid #333",
                    borderRadius: "10px",
                    padding: "10px",
                    transition: "0.2s",
                  }}
                >
                  <img
                    src={meal.image}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                  <h4>{meal.name}</h4>
                  <p style={{ color: "#aaa" }}>{meal.readyInMinutes} min</p>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: "1rem", display: "flex", gap: "10px" }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: "8px 16px",
                background: "#2a2a2a",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              Previous
            </button>

            <button
              onClick={() =>
                setPage((p) =>
                  (p + 1) * pageSize < mealOptions.length ? p + 1 : p,
                )
              }
              disabled={(page + 1) * pageSize >= mealOptions.length}
              style={{
                padding: "8px 16px",
                background: "#4CAF50",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "0.2s",
              }}
            >
              Next
            </button>
          </div>

          <button
            disabled={selectedMeals.length === 0}
            style={{
              marginTop: "1rem",
              background: selectedMeals.length ? "#4CAF50" : "#555",
              color: "#fff",
              padding: "10px",
              border: "none",
              borderRadius: "6px",
            }}
            onClick={async () => {
              setLoading(true);
              try {
                const res = await fetch(
                  "http://localhost:3000/api/meal-plan/generate",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      selectedMeals,
                      allergies: selectedAllergies,
                      dislikes: selectedDislikes,
                      diet,
                    }),
                  },
                );

                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                setMealPlan(data);
              } catch (err) {
                setError(err.message);
              } finally {
                setLoading(false);
              }
            }}
          >
            Build Grocery List
          </button>
        </div>
      )}

      {/* RESULTS */}
      {mealPlan && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Meal Plan</h2>
          {mealPlan.meals.map((meal, index) => {
            const isExpanded = expandedMeals.includes(index);

            return (
              <div key={index} style={{ marginBottom: "2rem" }}>
                <h3>{meal.name}</h3>

                <img src={meal.image} style={{ width: "250px" }} />

                <br />

                <button
                  onClick={() => toggleExpand(index)}
                  style={{
                    marginTop: "10px",
                    background: "#FF7043",
                    color: "#fff",
                    padding: "6px",
                    border: "none",
                    borderRadius: "5px",
                  }}
                >
                  {isExpanded ? "Hide Recipe" : "Show Recipe"}
                </button>

                {isExpanded && (
                  <div>
                    <h4>Ingredients</h4>
                    <ul>
                      {Array.isArray(meal.ingredients) &&
                        meal.ingredients.map((ing, i) => (
                          <li key={i}>
                            {ing.amount} {ing.unit} {ing.name}
                          </li>
                        ))}
                    </ul>

                    <h4>Instructions</h4>
                    <p>
                      {meal.instructions ||
                        "Click below to view full recipe instructions."}
                    </p>

                    {meal.sourceUrl && (
                      <a
                        href={meal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#4CAF50" }}
                      >
                        View Full Recipe
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <h2>Grocery List</h2>
          <button
            onClick={copyGroceryList}
            style={{
              marginBottom: "1rem",
              background: "#4CAF50",
              color: "#fff",
              padding: "8px 12px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {copied ? "Copied!" : "Copy Grocery List"}
          </button>
          {Object.entries(mealPlan.groceryList).map(([cat, items]) => (
            <div key={cat}>
              <h4>{cat}</h4>
              <ul>
                {items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
