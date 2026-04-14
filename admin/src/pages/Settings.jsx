import { useEffect, useState, memo, useCallback } from "react";
import toast from "react-hot-toast";
import {
  getAdminSettings,
  updateAdminSettings,
  uploadAdminImages,
} from "../api/adminApi";

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    logo: { url: "", public_id: "", width: 120 },
    contact: { email: "", phone: "", address: "", whatsapp: "" },
    socials: { instagram: "", facebook: "", twitter: "", youtube: "" },
    about: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdminSettings();
        if (data) {
          setForm({
            logo: {
              url: data.logo?.url || "",
              public_id: data.logo?.public_id || "",
              width: data.logo?.width || 120,
            },
            contact: {
              email: data.contact?.email || "",
              phone: data.contact?.phone || "",
              address: data.contact?.address || "",
              whatsapp: data.contact?.whatsapp || "",
            },
            socials: {
              instagram: data.socials?.instagram || "",
              facebook: data.socials?.facebook || "",
              twitter: data.socials?.twitter || "",
              youtube: data.socials?.youtube || "",
            },
            about: data.about || "",
          });
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    setUploading(true);
    try {
      const res = await uploadAdminImages(formData);
      if (res.success && res.images.length > 0) {
        setForm((f) => ({
          ...f,
          logo: { ...f.logo, url: res.images[0].url, public_id: res.images[0].public_id },
        }));
        toast.success("Logo uploaded");
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminSettings(form);
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm text-zinc-500">Loading…</p>;

  return (
    <div className="max-w-4xl pb-20">
      <h1 className="text-2xl font-semibold text-white">System Settings</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Manage store logo, contact information, and social media.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* LOGO */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-medium text-white mb-6">Store Logo</h2>
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="mx-auto h-20 w-full max-w-40 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden sm:mx-0 sm:w-40 sm:max-w-none sm:shrink-0">
                {form.logo.url ? (
                  <img
                    src={form.logo.url}
                    alt="Logo"
                    style={{ width: `${form.logo.width}px` }}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-xs text-zinc-600">No Logo</span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="block text-xs font-medium text-zinc-400">
                  Change Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="block w-full text-xs text-zinc-500 file:mr-4 file:rounded-full file:border-0 file:bg-zinc-800 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-zinc-200 hover:file:bg-zinc-700 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-medium text-zinc-400">
                  Logo Width (px)
                </label>
                <span className="text-xs font-mono text-white">
                  {form.logo.width}px
                </span>
              </div>
              <input
                type="range"
                min="40"
                max="300"
                value={form.logo.width}
                onChange={(e) =>
                  setForm({
                    ...form,
                    logo: { ...form.logo, width: Number(e.target.value) },
                  })
                }
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>
        </div>

        {/* CONTACT */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-medium text-white mb-6">Contact Info</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Email</label>
              <input
                value={form.contact.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contact: { ...form.contact, email: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Phone</label>
              <input
                value={form.contact.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contact: { ...form.contact, phone: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">
                WhatsApp Number
              </label>
              <input
                value={form.contact.whatsapp}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contact: { ...form.contact, whatsapp: e.target.value },
                  })
                }
                placeholder="e.g. 919876543210"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-zinc-400">
                Address
              </label>
              <textarea
                value={form.contact.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contact: { ...form.contact, address: e.target.value },
                  })
                }
                rows={2}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* SOCIALS */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-medium text-white mb-6">
            Social Media Links
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.keys(form.socials).map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-zinc-400 capitalize">
                  {key}
                </label>
                <input
                  value={form.socials[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      socials: { ...form.socials, [key]: e.target.value },
                    })
                  }
                  placeholder={`https://${key}.com/...`}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="text-lg font-medium text-white mb-6">About Store</h2>
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">
              Description
            </label>
            <textarea
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
              placeholder="Short description for the footer..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-white px-8 py-2.5 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default memo(Settings);
