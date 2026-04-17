import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { getCategories } from "../api/productApi";
import { createAdminCategory, updateAdminCategory } from "../api/adminApi";

const HierarchicalCategorySelector = ({
  selectedCategories,
  selectedSubCategories,
  onCategoryChange,
  onSubCategoryChange,
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [isAddingNewSub, setIsAddingNewSub] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [selectedMainCat, setSelectedMainCat] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Sync selectedMainCat with selectedCategories if empty
  useEffect(() => {
    if (!selectedMainCat && selectedCategories.length > 0) {
      setSelectedMainCat(selectedCategories[0]);
    }
  }, [selectedCategories, selectedMainCat]);

  // Derived category data
  const categoryDataMap = useMemo(() => {
    const data = {};
    categories.forEach((cat) => {
      data[cat.name] = {
        id: cat._id,
        image: cat.image,
        subCategories: cat.subCategories || [],
      };
    });
    return data;
  }, [categories]);

  const handleAddNewCategory = async () => {
    const name = newCatName.trim();
    if (!name) return toast.error("Category name cannot be empty");

    // Check for duplicates
    if (categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      return toast.error("Category already exists");
    }

    try {
      const newCat = await createAdminCategory({ name, subCategories: [] });
      toast.success(`Category "${name}" created`);
      setNewCatName("");
      setIsAddingNewCat(false);
      await loadCategories();
      // Auto-select the new category
      setSelectedMainCat(name);
      if (!selectedCategories.includes(name)) {
        onCategoryChange([...selectedCategories, name]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create category");
    }
  };

  const handleAddNewSubCategory = async () => {
    const nameInput = newSubName.trim();
    if (!nameInput) return toast.error("Sub-category name cannot be empty");
    if (!selectedMainCat) return toast.error("Select a main category first");

    const category = categories.find((c) => c.name === selectedMainCat);
    if (!category) return;

    // Split by comma and filter out empty strings
    const newNames = nameInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (newNames.length === 0) return;

    const existingSubs = category.subCategories || [];
    const namesToAdd = newNames.filter(
      (n) =>
        !existingSubs.some((s) => {
          const sName = typeof s === "string" ? s : s.name;
          return sName.toLowerCase() === n.toLowerCase();
        }),
    );

    if (namesToAdd.length === 0) {
      return toast.error("All sub-categories already exist in this category");
    }

    try {
      const updatedSubCats = [
        ...existingSubs,
        ...namesToAdd.map((n) => ({ name: n, image: null })),
      ];
      await updateAdminCategory(category._id, {
        ...category,
        subCategories: updatedSubCats,
      });

      toast.success(
        namesToAdd.length > 1
          ? `${namesToAdd.length} sub-categories added to ${selectedMainCat}`
          : `Sub-category "${namesToAdd[0]}" added to ${selectedMainCat}`,
      );

      setNewSubName("");
      setIsAddingNewSub(false);
      await loadCategories();

      // Auto-select the newly added sub-categories
      const newSelectedSubs = [
        ...new Set([...selectedSubCategories, ...namesToAdd]),
      ];
      onSubCategoryChange(newSelectedSubs);
    } catch (err) {
      toast.error("Failed to add sub-categories");
    }
  };

  if (loading)
    return <div className="h-10 w-full animate-pulse rounded bg-zinc-800" />;

  return (
    <div className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 shadow-sm sm:p-5">
      {/* PRIMARY CATEGORY DROPDOWN */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-zinc-300">
          Select Main Category
        </label>
        {!isAddingNewCat ? (
          <div className="flex gap-2">
            <select
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-800"
              value={selectedMainCat}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "ADD_NEW") {
                  setIsAddingNewCat(true);
                } else {
                  setSelectedMainCat(val);
                  if (val && !selectedCategories.includes(val)) {
                    onCategoryChange([...selectedCategories, val]);
                  }
                }
              }}
            >
              <option value="">Choose a category...</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name} {selectedCategories.includes(c.name) ? "✓" : ""}
                </option>
              ))}
              <option value="ADD_NEW" className="font-bold text-indigo-400">
                + Add New Category
              </option>
            </select>
          </div>
        ) : (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 sm:flex-row sm:items-center">
            <input
              autoFocus
              type="text"
              placeholder="Enter new category name..."
              className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddNewCategory();
                if (e.key === "Escape") setIsAddingNewCat(false);
              }}
            />
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 sm:flex-none"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsAddingNewCat(false)}
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-700 sm:flex-none"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Selected Category Pills */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          {selectedCategories.map((c) => (
            <div
              key={c}
              onClick={() => setSelectedMainCat(c)}
              className={`group flex cursor-pointer items-center gap-2 rounded-xl border p-1.5 pr-3 transition-all duration-300 ${
                selectedMainCat === c
                  ? "border-indigo-500 bg-indigo-600 shadow-lg shadow-indigo-500/20"
                  : "border-zinc-800 bg-zinc-950 hover:border-zinc-600"
              }`}
            >
              {/* Category Image */}
              <div className="h-8 w-8 overflow-hidden rounded-lg bg-zinc-800">
                {categoryDataMap[c]?.image?.url ? (
                  <img
                    src={categoryDataMap[c].image.url}
                    alt={c}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-zinc-600 uppercase">
                    No Img
                  </div>
                )}
              </div>

              <span
                className={`text-[11px] font-bold uppercase tracking-wide ${
                  selectedMainCat === c ? "text-white" : "text-zinc-400"
                }`}
              >
                {c}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryChange(
                    selectedCategories.filter((cat) => cat !== c),
                  );
                  if (selectedMainCat === c) setSelectedMainCat("");
                }}
                className={`ml-1 flex h-5 w-5 items-center justify-center rounded-full transition-colors ${
                  selectedMainCat === c
                    ? "bg-white/10 text-white hover:bg-white/20"
                    : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300"
                }`}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECONDARY SUBCATEGORY DROPDOWN */}
      {selectedMainCat && (
        <div className="animate-in fade-in slide-in-from-top-4 space-y-3 border-t border-zinc-800/50 pt-5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
              Sub-categories for {selectedMainCat}
            </label>
            <span className="text-[10px] text-zinc-500 italic">
              {categoryDataMap[selectedMainCat]?.subCategories?.length || 0}{" "}
              Available
            </span>
          </div>
          {!isAddingNewSub ? (
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition-all focus:border-zinc-600 focus:ring-2 focus:ring-zinc-800"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "ADD_NEW_SUB") {
                    setIsAddingNewSub(true);
                  } else if (val && !selectedSubCategories.includes(val)) {
                    onSubCategoryChange([...selectedSubCategories, val]);
                  }
                }}
              >
                <option value="">Quick Add Sub-category...</option>
                {(categoryDataMap[selectedMainCat]?.subCategories || []).map(
                  (s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}{" "}
                      {selectedSubCategories.includes(s.name) ? "✓" : ""}
                    </option>
                  ),
                )}
                <option
                  value="ADD_NEW_SUB"
                  className="font-bold text-indigo-400"
                >
                  + Create New Sub-category
                </option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 sm:flex-row sm:items-center">
              <input
                autoFocus
                type="text"
                placeholder={`Sub-categories for ${selectedMainCat} (comma separated)...`}
                className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-500"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddNewSubCategory();
                  if (e.key === "Escape") setIsAddingNewSub(false);
                }}
              />
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={handleAddNewSubCategory}
                  className="flex-1 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-colors sm:flex-none"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingNewSub(false)}
                  className="flex-1 rounded-lg bg-zinc-800 px-5 py-2 text-sm font-bold text-zinc-400 hover:bg-zinc-700 transition-colors sm:flex-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Selected Subcategory Pills for THIS main category */}
          <div className="flex flex-wrap gap-2 pt-1">
            {(categoryDataMap[selectedMainCat]?.subCategories || [])
              .filter((s) => selectedSubCategories.includes(s.name))
              .map((s) => (
                <div
                  key={s.name}
                  className="flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 px-3 py-1.5 text-[10px] font-bold text-indigo-400"
                >
                  {s.name}
                  <button
                    type="button"
                    onClick={() =>
                      onSubCategoryChange(
                        selectedSubCategories.filter((sub) => sub !== s.name),
                      )
                    }
                    className="flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-indigo-400/20"
                  >
                    <svg
                      className="h-2.5 w-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchicalCategorySelector;
