import { useEffect, useState, useCallback, memo } from "react";
import toast from "react-hot-toast";
import {
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  uploadAdminImages,
  reorderAdminCategories,
} from "../api/adminApi";
import { getCategories } from "../api/productApi";

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    image: null,
    subCategories: [], // Array of { name, image, subCategories: [] }
  });
  const [subInput, setSubInput] = useState("");
  const [subImage, setSubImage] = useState(null);
  const [parentSubName, setParentSubName] = useState(""); // For nested sub-categories

  const handleSubImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    setUploading(true);
    try {
      const response = await uploadAdminImages(formData);
      const uploadedImage = response.images?.[0];
      if (uploadedImage) {
        setSubImage(uploadedImage);
        toast.success("Sub-category image uploaded");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const load = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    setUploading(true);
    try {
      const response = await uploadAdminImages(formData);
      const uploadedImage = response.images?.[0];
      if (uploadedImage) {
        setForm((prev) => ({ ...prev, image: uploadedImage }));
        toast.success("Image uploaded");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Please enter a category name");

    // Auto-add pending sub-category if name is typed but not "Added"
    let finalSubCategories = [...form.subCategories];
    if (subInput.trim()) {
      const exists = finalSubCategories.some((s) => s.name === subInput.trim());
      if (!exists) {
        finalSubCategories.push({ name: subInput.trim(), image: subImage });
      }
    }

    try {
      if (editing) {
        await updateAdminCategory(editing._id, {
          name: form.name.trim(),
          image: form.image,
          subCategories: finalSubCategories,
        });
        toast.success("Category updated");
      } else {
        // Bulk creation support for main categories
        const names = form.name
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean);

        if (names.length === 0) return;

        if (names.length === 1) {
          await createAdminCategory({
            name: names[0],
            image: form.image,
            subCategories: finalSubCategories,
          });
          toast.success(`Category "${names[0]}" created`);
        } else {
          for (const name of names) {
            await createAdminCategory({
              name,
              image: form.image,
              subCategories: finalSubCategories,
            });
          }
          toast.success(`${names.length} categories created`);
        }
      }
      setForm({ name: "", image: null, subCategories: [] });
      setSubInput("");
      setSubImage(null);
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  const handleSubAdd = () => {
    if (!subInput.trim()) return;

    if (parentSubName) {
      // Add nested sub-category
      setForm((f) => {
        const updatedSubs = f.subCategories.map((s) => {
          if (s.name === parentSubName) {
            return {
              ...s,
              subCategories: [
                ...(s.subCategories || []),
                { name: subInput.trim(), image: subImage },
              ],
            };
          }
          return s;
        });
        return { ...f, subCategories: updatedSubs };
      });
    } else {
      // Add top-level sub-category
      if (form.subCategories.some((s) => s.name === subInput.trim())) {
        return toast.error("Sub-category already exists");
      }
      setForm((f) => ({
        ...f,
        subCategories: [
          ...f.subCategories,
          { name: subInput.trim(), image: subImage, subCategories: [] },
        ],
      }));
    }

    setSubInput("");
    setSubImage(null);
    setParentSubName("");
  };

  const removeSub = (name, parentName = null) => {
    setForm((f) => {
      if (parentName) {
        const updatedSubs = f.subCategories.map((s) => {
          if (s.name === parentName) {
            return {
              ...s,
              subCategories: s.subCategories.filter((sub) => sub.name !== name),
            };
          }
          return s;
        });
        return { ...f, subCategories: updatedSubs };
      }
      return {
        ...f,
        subCategories: f.subCategories.filter((s) => s.name !== name),
      };
    });
  };

  const startEdit = (cat) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      image: cat.image || null,
      subCategories: cat.subCategories || [],
    });
    setSubInput("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteAdminCategory(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleReorder = async (direction, index) => {
    const newCategories = [...categories];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newCategories.length) return;

    // Swap items
    const temp = newCategories[index];
    newCategories[index] = newCategories[targetIndex];
    newCategories[targetIndex] = temp;

    // Optimistically update UI
    setCategories(newCategories);

    try {
      const orders = newCategories.map((cat, i) => ({
        id: cat._id,
        order: i,
      }));
      await reorderAdminCategories(orders);
      toast.success("Sequence updated");
    } catch {
      toast.error("Failed to update sequence");
      load(); // Rollback
    }
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading...</p>;

  return (
    <div className="max-w-4xl pb-20">
      <h1 className="text-2xl font-semibold text-white">Category Management</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Add or remove categories and their sub-categories.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6"
      >
        <h2 className="text-lg font-medium text-white">
          {editing ? "Edit Category" : "Add New Category"}
        </h2>

        <div className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-zinc-400 font-medium">
                Category Name (comma-separated for multiple)
              </span>
              <input
                required
                placeholder="e.g. T-Shirts, Hoodies, Accessories"
                className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none focus:border-zinc-700 transition"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <div className="block text-sm">
              <span className="text-zinc-400 font-medium">
                Sub-categories (Add one by one with image)
              </span>
              <div className="mt-1.5 space-y-4 rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                <div className="space-y-3">
                  {form.subCategories.map((s) => (
                    <div key={s.name} className="space-y-2">
                      <div className="group relative flex items-center gap-2 rounded-lg bg-zinc-800 p-1.5 pr-3 text-[10px] font-bold text-zinc-300">
                        {s.image?.url && (
                          <img
                            src={s.image.url}
                            className="h-6 w-6 rounded object-cover"
                            alt=""
                          />
                        )}
                        <span>{s.name}</span>
                        <button
                          type="button"
                          onClick={() => removeSub(s.name)}
                          className="ml-auto text-zinc-500 hover:text-white"
                        >
                          ×
                        </button>
                      </div>
                      {/* Nested sub-categories display */}
                      {s.subCategories?.length > 0 && (
                        <div className="ml-6 flex flex-wrap gap-2">
                          {s.subCategories.map((sub) => (
                            <div
                              key={sub.name}
                              className="flex items-center gap-1.5 rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-[9px] text-zinc-400"
                            >
                              {sub.image?.url && (
                                <img
                                  src={sub.image.url}
                                  className="h-4 w-4 rounded-sm object-cover"
                                  alt=""
                                />
                              )}
                              <span>{sub.name}</span>
                              <button
                                type="button"
                                onClick={() => removeSub(sub.name, s.name)}
                                className="text-zinc-600 hover:text-white"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 pt-3 border-t border-zinc-800">
                  <div className="flex flex-col gap-2">
                    <select
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400 outline-none focus:border-zinc-700"
                      value={parentSubName}
                      onChange={(e) => setParentSubName(e.target.value)}
                    >
                      <option value="">No Parent (Top Level Sub)</option>
                      {form.subCategories.map((s) => (
                        <option key={s.name} value={s.name}>
                          Parent: {s.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                        {subImage ? (
                          <>
                            <img
                              src={subImage.url}
                              className="h-full w-full object-cover"
                              alt=""
                            />
                            <button
                              type="button"
                              onClick={() => setSubImage(null)}
                              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="text-white text-lg">×</span>
                            </button>
                          </>
                        ) : (
                          <label className="flex h-full w-full cursor-pointer items-center justify-center hover:bg-zinc-800 transition">
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleSubImageUpload}
                              disabled={uploading}
                            />
                            <svg
                              className="h-4 w-4 text-zinc-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </label>
                        )}
                      </div>
                      <input
                        placeholder={
                          parentSubName
                            ? "Nested sub name..."
                            : "Sub-category name..."
                        }
                        className="flex-1 bg-transparent py-1 text-sm text-white outline-none"
                        value={subInput}
                        onChange={(e) => setSubInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSubAdd();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleSubAdd}
                        className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                        disabled={!subInput.trim() || uploading}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  {uploading && (
                    <p className="text-[10px] text-indigo-400 animate-pulse">
                      Uploading asset...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-zinc-400 font-medium">
              Category Image
            </span>
            <div className="flex items-center gap-4">
              {form.image ? (
                <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-zinc-800">
                  <img
                    src={form.image.url}
                    alt="Category"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: null })}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
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
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-950 hover:border-zinc-700 transition">
                  {uploading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                  ) : (
                    <>
                      <svg
                        className="h-6 w-6 text-zinc-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="mt-1 text-[10px] text-zinc-500">
                        Upload
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
              )}
              <div className="text-xs text-zinc-500">
                <p>Upload a square image for better results.</p>
                <p>Max size: 2MB. Format: JPG, PNG, WEBP.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-zinc-800 pt-6 sm:flex-row sm:justify-end sm:gap-3">
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ name: "", image: null, subCategories: [] });
                setSubInput("");
              }}
              className="w-full rounded-lg border border-zinc-700 px-6 py-2 text-sm font-semibold text-zinc-400 hover:bg-zinc-800 sm:w-auto"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-lg bg-white px-8 py-2 text-sm font-semibold text-black hover:bg-zinc-200 transition disabled:opacity-50 sm:w-auto"
          >
            {editing ? "Update Category" : "Add Category"}
          </button>
        </div>
      </form>

      <div className="mt-12 -mx-4 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/50 sm:mx-0">
        <table className="w-full min-w-xl text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950/50 text-xs uppercase text-zinc-500 font-semibold tracking-wider">
            <tr>
              <th className="px-3 py-3 w-16 sm:px-6 sm:py-4">Seq</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4">Image</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4">Category</th>
              <th className="px-3 py-3 sm:px-6 sm:py-4">Sub-categories</th>
              <th className="px-3 py-3 text-right sm:px-6 sm:py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {categories.map((cat, idx) => (
              <tr key={cat._id} className="hover:bg-zinc-800/30 transition">
                <td className="px-3 py-3 sm:px-6 sm:py-4">
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => handleReorder("up", idx)}
                      disabled={idx === 0}
                      className="text-zinc-500 hover:text-white disabled:opacity-0 transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleReorder("down", idx)}
                      disabled={idx === categories.length - 1}
                      className="text-zinc-500 hover:text-white disabled:opacity-0 transition"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3 sm:px-6 sm:py-4">
                  {cat.image ? (
                    <img
                      src={cat.image.url}
                      alt={cat.name}
                      className="h-10 w-10 rounded object-cover border border-zinc-800"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-600">
                      No Img
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 font-medium text-white sm:px-6 sm:py-4">
                  {cat.name}
                </td>
                <td className="px-3 py-3 text-zinc-400 sm:px-6 sm:py-4">
                  <div className="flex flex-wrap gap-2">
                    {cat.subCategories.map((sub, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 rounded bg-zinc-800 px-2 py-1 text-[10px] border border-zinc-700/50"
                      >
                        {sub.image?.url && (
                          <img
                            src={sub.image.url}
                            className="h-4 w-4 rounded-sm object-cover"
                            alt=""
                          />
                        )}
                        <span className="font-medium text-zinc-300">
                          {typeof sub === "string" ? sub : sub.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-3 text-right sm:px-6 sm:py-4">
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    className="mr-3 text-zinc-400 hover:text-white transition"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat._id)}
                    className="text-red-500 hover:text-red-400 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default memo(CategoryManager);
