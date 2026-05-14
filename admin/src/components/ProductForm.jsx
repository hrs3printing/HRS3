import { useState, useCallback, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import HierarchicalCategorySelector from "./HierarchicalCategorySelector";
import { uploadAdminImages } from "../api/adminApi";

const STEPS = [
  { id: 1, title: "Product Info", description: "Basic details & images" },
  { id: 2, title: "Specifications", description: "Fabric, color & size" },
  { id: 3, title: "Additional", description: "Custom attributes" },
  { id: 4, title: "Confirm", description: "Final review & publish" },
];

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "FREE SIZE"];
const NECK_TYPES = [
  "Round Neck",
  "V-Neck",
  "Polo",
  "Crew Neck",
  "Hooded",
  "High Neck",
  "Other",
];
const FABRIC_TYPES = [
  "100% Cotton",
  "Poly-Cotton",
  "Polyester",
  "Linen",
  "Oversized Cotton",
  "Supima Cotton",
  "Other",
];
const FIT_TYPES = [
  "Regular Fit",
  "Slim Fit",
  "Oversized",
  "Relaxed Fit",
  "Loose Fit",
];
const SLEEVE_LENGTHS = [
  "Short Sleeves",
  "Long Sleeves",
  "Three-Quarter Sleeves",
  "Sleeveless",
  "Half Sleeves",
];
const OCCASIONS = ["Casual", "Formal", "Party", "Sports", "Workwear", "Travel"];
const PATTERNS = [
  "Solid",
  "Printed",
  "Striped",
  "Checkered",
  "Colorblock",
  "Graphic",
];
const PRINT_TECHNOLOGIES = [
  "DTG (Direct to Garment)",
  "Screen Printing",
  "Sublimation",
  "Heat Transfer",
  "Embroidery",
  "Vinyl Cut",
  "Other",
];
const PRINT_AREAS = [
  "Front (Center)",
  "Back (Center)",
  "Left Side",
  "Right Side",
  "Round",
  "Both Side",
  "Left Sleeve",
  "Right Sleeve",
  "Full Wrap",
  "Pocket Area",
];

const ProductForm = ({ initialData, onSubmit, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    price: "",
    mrp: "",
    costPrice: "",
    taxPercent: 5,
    hsnCode: "",
    image: null,
    images: [],
    category: [],
    subCategory: [],
    size: [],
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
    attributes: [],
    description: "",
    status: "published",
    mockupConfig: {
      enabled: true,
      type: "t-shirt",
    },
  });

  const [newAttribute, setNewAttribute] = useState({ key: "", value: "" });
  const [customSize, setCustomSize] = useState("");
  const [availableSizes, setAvailableSizes] = useState(SIZE_OPTIONS);

  // Sync with initialData when it changes (e.g. when starting to edit)
  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        mockupConfig: initialData.mockupConfig || {
          enabled: true,
          type: "t-shirt",
        },
      });
      // If the product has sizes not in our default list, add them to available sizes
      if (initialData.size && Array.isArray(initialData.size)) {
        setAvailableSizes((prev) => {
          const combined = [...new Set([...prev, ...initialData.size])];
          return combined;
        });
      }
    }
  }, [initialData]);

  const addCustomSize = () => {
    const size = customSize.trim().toUpperCase();
    if (!size) return;
    if (!availableSizes.includes(size)) {
      setAvailableSizes((prev) => [...prev, size]);
    }
    if (!form.size.includes(size)) {
      setForm((f) => ({ ...f, size: [...f.size, size] }));
    }
    setCustomSize("");
  };

  const removeAvailableSize = (size) => {
    setAvailableSizes((prev) => prev.filter((s) => s !== size));
    setForm((f) => ({
      ...f,
      size: f.size.filter((s) => s !== size),
    }));
  };

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    setUploading(true);
    try {
      const response = await uploadAdminImages(formData);
      const uploadedImages = response.images || [];

      setForm((f) => {
        const newImages = [...(f.images || []), ...uploadedImages];
        return {
          ...f,
          image: f.image || newImages[0],
          images: newImages,
        };
      });
      toast.success(`${uploadedImages.length} image(s) uploaded`);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!form.name || !form.price || form.images.length === 0) {
        return toast.error("Please fill required fields and upload images");
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const toggleSize = (size) => {
    setForm((f) => {
      const sizes = f.size.includes(size)
        ? f.size.filter((s) => s !== size)
        : [...f.size, size];
      return { ...f, size: sizes };
    });
  };

  const addColor = (color) => {
    if (!color) return;
    setForm((f) => ({
      ...f,
      colors: f.colors.includes(color) ? f.colors : [...f.colors, color],
    }));
  };

  const removeColor = (color) => {
    setForm((f) => ({
      ...f,
      colors: f.colors.filter((c) => c !== color),
    }));
  };

  const addAttribute = () => {
    if (!newAttribute.key || !newAttribute.value) {
      return toast.error("Both key and value are required");
    }
    setForm((f) => ({
      ...f,
      attributes: [...f.attributes, newAttribute],
    }));
    setNewAttribute({ key: "", value: "" });
  };

  const removeAttribute = (index) => {
    setForm((f) => ({
      ...f,
      attributes: f.attributes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (currentStep !== STEPS.length || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Stepper Header */}
      <div className="bg-zinc-900/50 border-b border-zinc-800 p-6">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -translate-y-1/2 z-0"></div>
          {STEPS.map((step) => (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  currentStep >= step.id
                    ? "bg-white text-black scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {currentStep > step.id ? (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="absolute top-12 whitespace-nowrap text-center">
                <p
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    currentStep >= step.id ? "text-white" : "text-zinc-600"
                  }`}
                >
                  {step.title}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter">
            {STEPS[currentStep - 1].title}
          </h2>
          <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">
            {STEPS[currentStep - 1].description}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
            e.preventDefault();
          }
        }}
        className="p-8 space-y-8"
      >
        {/* Step 1: Product Info */}
        {currentStep === 1 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Product Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="E.G. OVERSIZED VINTAGE TEE"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Generic Name
                </label>
                <input
                  value={form.genericName}
                  onChange={(e) =>
                    setForm({ ...form, genericName: e.target.value })
                  }
                  placeholder="E.G. T-SHIRT"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Selling Price (₹) *
                </label>
                <input
                  required
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="999"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  MRP (₹)
                </label>
                <input
                  type="number"
                  value={form.mrp}
                  onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                  placeholder="1499"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Cost Price (₹)
                </label>
                <input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm({ ...form, costPrice: e.target.value })
                  }
                  placeholder="400"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  GST (%)
                </label>
                <select
                  value={form.taxPercent}
                  onChange={(e) =>
                    setForm({ ...form, taxPercent: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all appearance-none"
                >
                  {[0, 5, 12, 18, 28].map((t) => (
                    <option key={t} value={t}>
                      {t}%
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {form.price && form.costPrice && (
              <div className="bg-indigo-600/10 border border-indigo-600/20 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      Estimated Margin
                    </p>
                    <p className="text-xl font-black text-white tracking-tighter">
                      ₹{form.price - form.costPrice}
                      <span className="text-sm font-bold text-indigo-300 ml-2">
                        (
                        {Math.round(
                          ((form.price - form.costPrice) / form.price) * 100,
                        )}
                        %)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  HSN Code
                </label>
                <input
                  value={form.hsnCode}
                  onChange={(e) =>
                    setForm({ ...form, hsnCode: e.target.value })
                  }
                  placeholder="E.G. 6109"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Category Selection *
              </label>
              <div className="bg-zinc-900/50 border-2 border-zinc-800 rounded-xl p-4">
                <HierarchicalCategorySelector
                  selectedCategories={form.category}
                  selectedSubCategories={form.subCategory}
                  onCategoryChange={(newCats) =>
                    setForm({ ...form, category: newCats })
                  }
                  onSubCategoryChange={(newSubs) =>
                    setForm({ ...form, subCategory: newSubs })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Product Images * (Drag & Drop)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleImageUpload(e.dataTransfer.files);
                }}
                className="relative min-h-[200px] border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center group hover:border-white transition-all cursor-pointer bg-zinc-900/30"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
                ) : (
                  <>
                    <svg
                      className="w-10 h-10 text-zinc-600 group-hover:text-white mb-4 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                      Click or Drag to Upload
                    </p>
                  </>
                )}
              </div>

              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-6">
                  {form.images.map((img, idx) => (
                    <div
                      key={idx}
                      className={`group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                        form.image?.public_id === img.public_id
                          ? "border-white"
                          : "border-zinc-800"
                      }`}
                    >
                      <img
                        src={img.url}
                        className="w-full h-full object-cover"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, image: img })}
                          className="bg-white text-black text-[8px] font-black uppercase px-2 py-1 rounded"
                        >
                          Main
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = form.images.filter(
                              (_, i) => i !== idx,
                            );
                            setForm({
                              ...form,
                              images: newImages,
                              image:
                                form.image?.public_id === img.public_id
                                  ? newImages[0] || null
                                  : form.image,
                            });
                          }}
                          className="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                      {form.image?.public_id === img.public_id && (
                        <div className="absolute top-2 left-2 bg-white text-black text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow-lg">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Description (Rich Text)
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows="6"
                placeholder="DESCRIBE THE PRODUCT VIBE, FIT, AND DETAILS..."
                className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-4 text-sm font-medium text-white outline-none focus:border-white transition-all resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Basic Details */}
        {currentStep === 2 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Fabric Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FABRIC_TYPES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setForm({ ...form, fabric: f })}
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                        form.fabric === f
                          ? "bg-white text-black border-white"
                          : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    Neck Type
                  </label>
                  <select
                    value={form.neckType}
                    onChange={(e) =>
                      setForm({ ...form, neckType: e.target.value })
                    }
                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all appearance-none"
                  >
                    <option value="">SELECT NECK TYPE</option>
                    {NECK_TYPES.map((n) => (
                      <option key={n} value={n}>
                        {n.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    Fit / Shape
                  </label>
                  <select
                    value={form.fit}
                    onChange={(e) => setForm({ ...form, fit: e.target.value })}
                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all appearance-none"
                  >
                    <option value="">SELECT FIT</option>
                    {FIT_TYPES.map((f) => (
                      <option key={f} value={f}>
                        {f.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                    Sleeve Length
                  </label>
                  <select
                    value={form.sleeveLength}
                    onChange={(e) =>
                      setForm({ ...form, sleeveLength: e.target.value })
                    }
                    className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all appearance-none"
                  >
                    <option value="">SELECT SLEEVE LENGTH</option>
                    {SLEEVE_LENGTHS.map((s) => (
                      <option key={s} value={s}>
                        {s.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Available Sizes (Multi-select)
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => (
                  <div key={s} className="relative group/size">
                    <button
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-xs font-black transition-all border-2 ${
                        form.size.includes(s)
                          ? "bg-white text-black border-white shadow-lg"
                          : "bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {s}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAvailableSize(s)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover/size:opacity-100 transition-opacity hover:bg-red-700 z-10 shadow-lg"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4 max-w-xs">
                <input
                  value={customSize}
                  onChange={(e) => setCustomSize(e.target.value)}
                  placeholder="ADD CUSTOM SIZE (E.G. 2XL)"
                  className="flex-1 bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-white transition-all"
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCustomSize())
                  }
                />
                <button
                  type="button"
                  onClick={addCustomSize}
                  className="bg-zinc-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Colors
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    onChange={(e) => addColor(e.target.value)}
                    className="w-10 h-10 rounded-full border-2 border-zinc-800 bg-transparent cursor-pointer overflow-hidden"
                  />
                  <div className="flex flex-wrap gap-2">
                    {form.colors.map((c) => (
                      <div
                        key={c}
                        className="group relative w-10 h-10 rounded-full border-2 border-zinc-800 shadow-xl"
                        style={{ backgroundColor: c }}
                      >
                        <button
                          type="button"
                          onClick={() => removeColor(c)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Weight (E.G. 200G)
                </label>
                <input
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="200G"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Net Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.netQuantity}
                  onChange={(e) =>
                    setForm({ ...form, netQuantity: parseInt(e.target.value) })
                  }
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Additional Details */}
        {currentStep === 3 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Occasion
                </label>
                <select
                  value={form.occasion}
                  onChange={(e) =>
                    setForm({ ...form, occasion: e.target.value })
                  }
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all appearance-none"
                >
                  <option value="">SELECT OCCASION</option>
                  {OCCASIONS.map((o) => (
                    <option key={o} value={o}>
                      {o.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Pattern
                </label>
                <select
                  value={form.pattern}
                  onChange={(e) =>
                    setForm({ ...form, pattern: e.target.value })
                  }
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all appearance-none"
                >
                  <option value="">SELECT PATTERN</option>
                  {PATTERNS.map((p) => (
                    <option key={p} value={p}>
                      {p.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Print or Pattern Type
                </label>
                <input
                  value={form.patternType}
                  onChange={(e) =>
                    setForm({ ...form, patternType: e.target.value })
                  }
                  placeholder="E.G. ANIMAL PRINT, STRIPES"
                  className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white">
                    Printing Details
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Technology
                    </label>
                    <select
                      value={form.printingDetails?.technology}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          printingDetails: {
                            ...form.printingDetails,
                            technology: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-white transition-all"
                    >
                      <option value="">SELECT TECHNOLOGY</option>
                      {PRINT_TECHNOLOGIES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Print Area
                    </label>
                    <select
                      value={form.printingDetails?.area}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          printingDetails: {
                            ...form.printingDetails,
                            area: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-white transition-all"
                    >
                      <option value="">SELECT AREA</option>
                      {PRINT_AREAS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Dimensions (Max)
                    </label>
                    <input
                      value={form.printingDetails?.dimensions}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          printingDetails: {
                            ...form.printingDetails,
                            dimensions: e.target.value,
                          },
                        })
                      }
                      placeholder="E.G. 12 X 16 INCHES"
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-white transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-white">
                    Manufacturing
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Manufacturer Name
                    </label>
                    <input
                      value={form.manufacturerDetails?.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          manufacturerDetails: {
                            ...form.manufacturerDetails,
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="E.G. HRS3 APPARELS"
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-white transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Address
                    </label>
                    <textarea
                      rows="2"
                      value={form.manufacturerDetails?.address}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          manufacturerDetails: {
                            ...form.manufacturerDetails,
                            address: e.target.value,
                          },
                        })
                      }
                      placeholder="FACTORY ADDRESS..."
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-white transition-all resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-zinc-500 ml-1">
                      Origin
                    </label>
                    <input
                      value={form.manufacturerDetails?.countryOfOrigin}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          manufacturerDetails: {
                            ...form.manufacturerDetails,
                            countryOfOrigin: e.target.value,
                          },
                        })
                      }
                      placeholder="INDIA"
                      className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Custom Attributes (Key-Value)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
                <div className="space-y-2">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                    Label
                  </span>
                  <input
                    value={newAttribute.key}
                    onChange={(e) =>
                      setNewAttribute({ ...newAttribute, key: e.target.value })
                    }
                    placeholder="E.G. GSM"
                    className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                    Value
                  </span>
                  <input
                    value={newAttribute.value}
                    onChange={(e) =>
                      setNewAttribute({
                        ...newAttribute,
                        value: e.target.value,
                      })
                    }
                    placeholder="E.G. 240"
                    className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-white transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={addAttribute}
                  className="bg-white text-black px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 active:scale-95 transition-all"
                >
                  Add
                </button>
              </div>

              {form.attributes.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  {form.attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-xl group hover:border-zinc-600 transition-all"
                    >
                      <div>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">
                          {attr.key}
                        </p>
                        <p className="text-sm font-bold text-white uppercase mt-1">
                          {attr.value}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttribute(idx)}
                        className="text-zinc-600 hover:text-red-500 p-2 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6 pt-10 border-t border-zinc-800">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white">
                  Visual Lab Configuration
                </h3>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                  Preview Type (Visual Lab)
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        mockupConfig: { ...form.mockupConfig, enabled: false },
                      })
                    }
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                      !form.mockupConfig?.enabled
                        ? "bg-zinc-700 border-zinc-700 text-white shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                        : "bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    None
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        mockupConfig: {
                          enabled: true,
                          type: "t-shirt",
                        },
                      })
                    }
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                      form.mockupConfig?.enabled &&
                      form.mockupConfig?.type === "t-shirt"
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        : "bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    T-Shirt
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        mockupConfig: {
                          enabled: true,
                          type: "mug",
                        },
                      })
                    }
                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${
                      form.mockupConfig?.enabled &&
                      form.mockupConfig?.type === "mug"
                        ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        : "bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    Mug
                  </button>
                </div>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1">
                  Select which interactive customization lab is shown to customers for this product.
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-zinc-800">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">
                Product Status
              </label>
              <div className="flex gap-4 mt-4">
                {["draft", "published"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, status: s })}
                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all border-2 ${
                      form.status === s
                        ? s === "draft"
                          ? "bg-amber-600 border-amber-600 text-white"
                          : "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-zinc-900 text-zinc-600 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Confirm */}
        {currentStep === 4 && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-32 rounded-xl overflow-hidden border border-zinc-800">
                  <img
                    src={form.image?.url || form.images[0]?.url}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    {form.name}
                  </h3>
                  <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mt-1">
                    {form.genericName || "Product"}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="text-xl font-black text-white">
                      ₹{form.price}
                    </span>
                    {form.mrp && (
                      <span className="text-sm font-bold text-zinc-600 line-through">
                        ₹{form.mrp}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-zinc-800/50">
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                    Category
                  </p>
                  <p className="text-xs font-bold text-white uppercase">
                    {form.category[0] || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                    Fabric
                  </p>
                  <p className="text-xs font-bold text-white uppercase">
                    {form.fabric || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                    Fit
                  </p>
                  <p className="text-xs font-bold text-white uppercase">
                    {form.fit || "N/A"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">
                    Sizes
                  </p>
                  <p className="text-xs font-bold text-white uppercase">
                    {form.size.join(", ") || "N/A"}
                  </p>
                </div>
              </div>

              <div className="bg-indigo-600/10 border border-indigo-600/20 rounded-xl p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  Ready to be{" "}
                  {form.status === "published" ? "Published" : "Saved as Draft"}
                </p>
              </div>
            </div>

            <p className="text-center text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              Please review all details before confirming.
            </p>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-zinc-800 mt-12">
          <button
            type="button"
            onClick={
              currentStep === 1 || currentStep === 4 ? onCancel : handleBack
            }
            className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors px-6"
          >
            {currentStep === 1 || currentStep === 4 ? "Cancel" : "Back"}
          </button>

          <div className="flex gap-4">
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-white text-black px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 active:scale-95 transition-all shadow-xl shadow-white/5"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSubmit()}
                className="bg-indigo-600 text-white px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-500 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : initialData?._id ? (
                  "Confirm Update"
                ) : (
                  "Confirm Product"
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
