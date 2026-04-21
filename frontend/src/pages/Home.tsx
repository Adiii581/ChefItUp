import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Clock, Search, ChevronDown } from "lucide-react";

const mockDatabase = [
  {
    id: 1,
    title: "5-Minute Mug Cake",
    appliance: "Microwave",
    time: "5 mins",
    ingredients: ["flour", "sugar", "cocoa"],
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    title: "Dorm Room Ramen",
    appliance: "Kettle",
    time: "10 mins",
    ingredients: ["ramen", "egg", "spinach"],
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 3,
    title: "Overnight Oats",
    appliance: "Mini-Fridge",
    time: "8 hours",
    ingredients: ["oats", "milk", "honey"],
    image:
      "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80&w=400",
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [appliance, setAppliance] = useState("All");
  const navigate = useNavigate();

  const filteredRecipes = mockDatabase.filter((recipe) => {
    const matchesAppliance =
      appliance === "All" || recipe.appliance === appliance;
    const matchesSearch =
      recipe.ingredients.some((ing) =>
        ing.toLowerCase().includes(searchQuery.toLowerCase()),
      ) || searchQuery === "";
    return matchesAppliance && matchesSearch;
  });

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Please register or log in to save favorite recipes!");
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-[300px_1fr] gap-12">
        {/* Sidebar - Translucent & Square */}
        <aside className="space-y-6">
          <div className="sticky top-2 border-slate-200 p-6">
            {/* INGREDIENT FILTER */}
            <div className="mb-8">
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-3">
                Ingredients
              </p>

              <div className="relative">
                {searchQuery === "" && (
                  <Search
                    size={14}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 transition-opacity duration-200"
                  />
                )}

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-white text-sm
    focus:outline-none focus:border-rose-500
    transition-all"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-100 mb-8" />

            {/* APPLIANCE FILTER */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 mb-3">
                Appliance
              </p>

              <div className="relative">
                <select
                  value={appliance}
                  onChange={(e) => setAppliance(e.target.value)}
                  className="w-full appearance-none px-3 py-2 border border-slate-200 bg-white text-sm cursor-pointer
          focus:outline-none focus:border-rose-500
          transition-all"
                >
                  <option value="All">All Appliances</option>
                  <option value="Microwave">Microwave</option>
                  <option value="Kettle">Kettle</option>
                  <option value="Mini-Fridge">No Cooking</option>
                </select>

                <ChevronDown
                  size={14}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Recipe Feed */}
        <main>
          <header className="mb-10 border-l-4 border-rose-500 pl-6">
            <h1 className="text-4xl font-black tracking-tight mb-2 text-slate-900 uppercase">
              Recommended for you
            </h1>
            <p className="text-slate-500 text-lg italic">
              Quick, delicious meals optimized for dorm life.
            </p>
          </header>

          {filteredRecipes.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredRecipes.map((recipe) => (
                <article
                  key={recipe.id}
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                  className="group bg-white border border-slate-200 rounded-sm overflow-hidden hover:border-rose-400 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                >
                  {/* Card Media Container - Fixed Spacing */}
                  <div className="aspect-square bg-slate-100 overflow-hidden relative m-3 rounded-sm">
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={handleSaveClick}
                      className="absolute top-2 right-2 p-2 bg-white/90 border border-slate-100 text-slate-400 hover:text-rose-500 transition-all shadow-sm"
                    >
                      <Heart size={18} />
                    </button>
                  </div>

                  {/* Card Content - Generous Inner Padding */}
                  <div className="px-6 pb-6 pt-2">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-white bg-slate-900 px-2.5 py-0.5 rounded-sm">
                        {recipe.appliance}
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-tighter">
                        <Clock size={12} /> {recipe.time}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-800 leading-tight group-hover:text-rose-600 transition-colors">
                      {recipe.title}
                    </h3>

                    <div className="mt-4 pt-4 border-t border-slate-50">
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.1em] mb-1">
                        Staples Required
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 italic">
                        {recipe.ingredients.join(", ")}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-slate-300 rounded-sm bg-white">
              <Search className="text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">
                No Results Found
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setAppliance("All");
                }}
                className="mt-4 text-rose-500 text-xs font-black uppercase border-b-2 border-rose-500"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
