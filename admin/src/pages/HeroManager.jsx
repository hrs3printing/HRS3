import { useEffect, useState, useCallback, memo } from "react";
import toast from "react-hot-toast";
import {
  getHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  uploadAdminImages,
} from "../api/adminApi";

const HeroManager = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    order: 0,
    image: null,
  });

  const load = useCallback(async () => {
    try {
      const data = await getHeroSlides();
      setSlides(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load slides");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleImage = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;

    const formData = new FormData();
    for (let f of files) formData.append("images", f);

    setUploading(true);
    try {
      const res = await uploadAdminImages(formData);
      if (res.success && res.images.length > 0) {
        setForm((f) => ({ ...f, image: res.images[0] }));
        toast.success("Image uploaded");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return toast.error("Please upload an image");

    try {
      if (editing) {
        await updateHeroSlide(editing._id, form);
        toast.success("Slide updated");
      } else {
        await createHeroSlide(form);
        toast.success("Slide created");
      }
      setForm({ title: "", subtitle: "", order: 0, image: null });
      setEditing(null);
      load();
    } catch {
      toast.error("Save failed");
    }
  };

  const startEdit = (slide) => {
    setEditing(slide);
    setForm({
      title: slide.title,
      subtitle: slide.subtitle,
      order: slide.order,
      image: slide.image,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this slide?")) return;
    try {
      await deleteHeroSlide(id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-white">Hero Slides</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage the carousel images and text on your homepage.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6"
      >
        <h2 className="text-lg font-medium text-white">
          {editing ? "Edit Slide" : "Add New Slide"}
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
              placeholder="e.g. Summer Collection"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Subtitle</label>
            <input
              required
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
              placeholder="e.g. Up to 50% off"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Order</label>
            <input
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Image</label>
            <div className="flex items-center gap-3">
              {form.image && (
                <img
                  src={form.image.url}
                  className="h-10 w-10 rounded object-cover"
                  alt=""
                />
              )}
              <input
                type="file"
                onChange={handleImage}
                disabled={uploading}
                className="block w-full text-xs text-zinc-500 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-zinc-200 hover:file:bg-zinc-700"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-lg bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50 sm:w-auto"
          >
            {editing ? "Update Slide" : "Create Slide"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ title: "", subtitle: "", order: 0, image: null });
              }}
              className="w-full rounded-lg border border-zinc-800 px-6 py-2 text-sm font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white sm:w-auto"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mt-12 space-y-4">
        {slides.map((slide) => (
          <div
            key={slide._id}
            className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:flex-row sm:items-center"
          >
            <img
              src={slide.image.url}
              alt=""
              className="h-36 w-full rounded-lg object-cover sm:h-20 sm:w-32 sm:shrink-0"
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-white truncate">{slide.title}</h3>
              <p className="text-sm text-zinc-500 truncate">{slide.subtitle}</p>
              <p className="mt-1 text-xs text-zinc-600">Order: {slide.order}</p>
            </div>
            <div className="flex shrink-0 gap-2 border-t border-zinc-800 pt-3 sm:border-t-0 sm:pt-0">
              <button
                type="button"
                onClick={() => startEdit(slide)}
                className="flex-1 rounded-lg p-2 text-center text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-white sm:flex-none"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(slide._id)}
                className="flex-1 rounded-lg p-2 text-center text-sm text-red-400 transition hover:bg-red-900/20 hover:text-red-300 sm:flex-none"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
            <p className="text-sm text-zinc-500">No slides yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(HeroManager);
