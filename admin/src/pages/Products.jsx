import { useEffect, useState, useCallback, useMemo, memo } from "react";
import toast from "react-hot-toast";
import { getProducts, getCategories } from "../api/productApi";
import HierarchicalCategorySelector from "../components/HierarchicalCategorySelector";
import {
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  uploadAdminImages,
} from "../api/adminApi";

const emptyForm = {
  name: "",
  price: "",
  image: null,
  images: [],
  category: [],
  subCategory: [],
  sizeText: "S,M,L,XL",
  description: "",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // --- TAG INPUT STATE ---
  const [catInput, setCatInput] = useState("");
  const [subCatInputs, setSubCatInputs] = useState({}); // Track inputs per category
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [activeSubCatDropdown, setActiveSubCatDropdown] = useState(null); // Track which dropdown is open

  const categoryData = useMemo(() => {
    const data = {};
    categories.forEach((cat) => {
      data[cat.name] = cat.subCategories || [];
    });
    return data;
  }, [categories]);

  const categoryNames = useMemo(
    () => Object.keys(categoryData),
    [categoryData],
  );

  const load = useCallback(async () => {
    try {
      const [prodData, catData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    setUploading(true);
    try {
      const response = await uploadAdminImages(formData);
      const images = response.images || [];

      setForm((f) => {
        const newImages = [...(f.images || []), ...images];
        return {
          ...f,
          image: f.image || newImages[0], // Set first as main if none exists
          images: newImages,
        };
      });
      toast.success(`${images.length} image(s) uploaded`);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  };

  const onFileChange = (e) => {
    handleUpload(e.target.files);
  };

  const removeImage = (index) => {
    setForm((f) => {
      const removedImg = f.images[index];
      const newImages = f.images.filter((_, i) => i !== index);
      const isMain = f.image && f.image.public_id === removedImg.public_id;
      return {
        ...f,
        images: newImages,
        image: isMain ? newImages[0] || null : f.image,
      };
    });
  };

  const setMainImage = (img) => {
    setForm((f) => ({ ...f, image: img }));
  };

  const parsePayload = () => {
    const size = form.sizeText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      name: form.name.trim(),
      price: Number(form.price),
      image: form.image,
      images: form.images,
      category: form.category,
      subCategory: form.subCategory,
      size: size.length ? size : undefined,
      description: form.description.trim() || undefined,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = parsePayload();
      if (!payload.name || Number.isNaN(payload.price)) {
        toast.error("Name and valid price are required");
        return;
      }
      if (!payload.image) {
        toast.error("At least one image is required");
        return;
      }
      if (editingId) {
        await updateAdminProduct(editingId, payload);
        toast.success("Product updated");
      } else {
        await createAdminProduct(payload);
        toast.success("Product created");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      setCatInput("");
      setSubCatInputs({});
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || "",
      price: String(p.price ?? ""),
      image: p.image || null,
      images: p.images || [],
      category: Array.isArray(p.category)
        ? p.category
        : p.category
          ? [p.category]
          : [],
      subCategory: Array.isArray(p.subCategory)
        ? p.subCategory
        : p.subCategory
          ? [p.subCategory]
          : [],
      sizeText: (p.size || []).join(","),
      description: p.description || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteAdminProduct(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return <p className="text-sm text-zinc-500">Loading products…</p>;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Products</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {products.length} items in catalog
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setCatInput("");
            setSubCatInputs({});
            setShowForm(true);
          }}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Add product
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-8 max-w-2xl space-y-4 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5"
        >
          <h2 className="text-lg font-medium text-white">
            {editingId ? "Edit product" : "New product"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-zinc-400">Name *</span>
              <input
                required
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-400">Price (₹) *</span>
              <input
                required
                type="number"
                min="0"
                step="1"
                className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </label>
          </div>
          <div className="space-y-2 text-sm">
            <span className="text-zinc-400">
              Product Images (Drag & drop multiple)
            </span>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                isDragging
                  ? "border-white bg-zinc-800"
                  : "border-zinc-700 bg-zinc-900 hover:border-zinc-500"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={onFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <p className="text-zinc-500">Uploading images...</p>
                </div>
              ) : (
                <div className="text-center p-4">
                  <p className="text-zinc-400">
                    Drag & drop multiple images or click to browse
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    PNG, JPG, WEBP (Max 10)
                  </p>
                </div>
              )}
            </div>

            {form.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {form.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`group relative aspect-square rounded-lg border-2 overflow-hidden ${
                      form.image?.public_id === img.public_id
                        ? "border-white"
                        : "border-zinc-800"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={`Product ${idx}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setMainImage(img)}
                        className="rounded bg-white px-2 py-1 text-[10px] font-bold text-black"
                      >
                        {form.image?.public_id === img.public_id
                          ? "Main"
                          : "Set Main"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="rounded bg-red-600 px-2 py-1 text-[10px] font-bold text-white"
                      >
                        Remove
                      </button>
                    </div>
                    {form.image?.public_id === img.public_id && (
                      <div className="absolute top-1 left-1 rounded bg-white px-1.5 py-0.5 text-[8px] font-black text-black uppercase">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* CATEGORIZATION SECTION */}
          <HierarchicalCategorySelector
            selectedCategories={form.category}
            selectedSubCategories={form.subCategory}
            onCategoryChange={(newCats) =>
              setForm((f) => ({ ...f, category: newCats }))
            }
            onSubCategoryChange={(newSubs) =>
              setForm((f) => ({ ...f, subCategory: newSubs }))
            }
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Sizes</span>
              <div className="flex gap-2">
                {[
                  { label: "Apparel", val: "S,M,L,XL,XXL" },
                  { label: "Footwear", val: "7,8,9,10,11" },
                  { label: "Cup/Volume", val: "250ml,500ml,750ml" },
                  { label: "One Size", val: "OS" },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({ ...f, sizeText: preset.val }))
                    }
                    className="rounded bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-500 transition hover:bg-zinc-700 hover:text-zinc-300"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <input
              placeholder="e.g. S, M, L or 500ml, 1L"
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
              value={form.sizeText}
              onChange={(e) =>
                setForm((f) => ({ ...f, sizeText: e.target.value }))
              }
            />
          </div>

          <label className="block text-sm">
            <span className="text-zinc-400">Description</span>
            <textarea
              rows={3}
              className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>
          <div className="flex flex-col-reverse gap-2 border-t border-zinc-800 pt-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
                setCatInput("");
                setSubCatInputs({});
              }}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-zinc-400 transition-all hover:bg-zinc-800 hover:text-white sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full rounded-lg bg-white px-10 py-2.5 text-sm font-bold text-black shadow-lg shadow-white/5 transition-all hover:bg-zinc-200 active:scale-95 sm:w-auto"
            >
              {editingId ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 -mx-4 overflow-x-auto rounded-xl border border-zinc-800 sm:mx-0">
        <table className="w-full min-w-xl text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-3 py-3 font-medium sm:px-4">Product</th>
              <th className="px-3 py-3 font-medium sm:px-4">Price</th>
              <th className="px-3 py-3 font-medium sm:px-4">Category</th>
              <th className="px-3 py-3 font-medium text-right sm:px-4">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {Array.isArray(products) &&
              products.map((p) => (
                <tr key={p._id} className="hover:bg-zinc-800/40">
                  <td className="px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      {p.image?.url ||
                      (typeof p.image === "string" ? p.image : null) ? (
                        <img
                          src={p.image?.url || p.image}
                          alt=""
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-zinc-800" />
                      )}
                      <span className="font-medium text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-zinc-300 sm:px-4">
                    ₹{p.price}
                  </td>
                  <td className="px-3 py-3 text-zinc-400 sm:px-4">
                    <div>
                      {Array.isArray(p.category)
                        ? p.category.join(", ")
                        : p.category || "—"}
                    </div>
                    {p.subCategory && p.subCategory.length > 0 && (
                      <div className="text-[10px] text-zinc-500">
                        {p.subCategory.join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right sm:px-4">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="mr-2 text-xs text-zinc-400 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p._id)}
                      className="text-xs text-red-400 hover:text-red-300"
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

export default memo(Products);
