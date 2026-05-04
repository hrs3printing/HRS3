import { useEffect, useState, useCallback, useMemo, memo } from "react";
import toast from "react-hot-toast";
import { getProducts, getCategories } from "../api/productApi";
import ProductForm from "../components/ProductForm";
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
  size: ["S", "M", "L", "XL"],
  colors: [],
  fabric: "",
  fit: "",
  weight: "",
  genericName: "",
  netQuantity: 1,
  neckType: "",
  occasion: "",
  pattern: "",
  patternType: "",
  sleeveLength: "",
  manufacturerDetails: {
    name: "",
    address: "",
    countryOfOrigin: "India",
  },
  printingDetails: {
    technology: "",
    area: "",
    dimensions: "",
    washCare: "",
  },
  mrp: "",
  costPrice: "",
  taxPercent: 5,
  hsnCode: "",
  attributes: [],
  description: "",
  status: "published",
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

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

  const handleSubmit = async (formData) => {
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
      };

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
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Save failed");
    }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      _id: p._id,
      name: p.name || "",
      price: String(p.price ?? ""),
      image: p.image || null,
      images: p.images || [],
      category: p.category || [],
      subCategory: p.subCategory || [],
      size: p.size || [],
      colors: p.colors || [],
      fabric: p.fabric || "",
      fit: p.fit || "",
      weight: p.weight || "",
      genericName: p.genericName || "",
      netQuantity: p.netQuantity || 1,
      neckType: p.neckType || "",
      occasion: p.occasion || "",
      pattern: p.pattern || "",
      patternType: p.patternType || "",
      sleeveLength: p.sleeveLength || "",
      manufacturerDetails: p.manufacturerDetails || {
        name: "",
        address: "",
        countryOfOrigin: "India",
      },
      printingDetails: p.printingDetails || {
        technology: "",
        area: "",
        dimensions: "",
        washCare: "",
      },
      mrp: String(p.mrp ?? ""),
      costPrice: String(p.costPrice ?? ""),
      taxPercent: p.taxPercent ?? 5,
      hsnCode: p.hsnCode || "",
      attributes: p.attributes || [],
      description: p.description || "",
      status: p.status || "published",
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
            setShowForm(true);
          }}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
        >
          Add product
        </button>
      </div>

      {showForm && (
        <div className="mt-8">
          <ProductForm
            initialData={form}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
              setForm(emptyForm);
            }}
          />
        </div>
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
