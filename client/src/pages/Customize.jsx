import { useState, useEffect, useCallback, memo } from "react";
import toast from "react-hot-toast";
import { getSettings } from "../api/productApi";
import { PageShell, PageHero, PageContent } from "../components/PageShell";

const Customize = () => {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    productType: "",
    description: "",
    name: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsApp = useCallback(() => {
    const whatsappNumber = settings?.contact?.whatsapp;
    if (!whatsappNumber) {
      toast.error("WhatsApp contact is not configured by admin.");
      return;
    }

    if (!form.productType || !form.description || !form.name) {
      toast.error("Please fill in all fields.");
      return;
    }

    const message = `Hello HRS3! I'd like to request a custom product.\n\n*My Name:* ${form.name}\n*Product Type:* ${form.productType}\n*Details:* ${form.description}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  }, [form, settings]);

  return (
    <PageShell>
      <PageHero
        align="left"
        title="Custom"
        accent="Designs"
        subtitle="Tell us your idea — we’ll shape it on WhatsApp"
      />

      <PageContent>
        <div className="mx-auto max-w-3xl">
          <div className="rounded-[3rem] border-2 border-zinc-100 bg-zinc-50 p-8 sm:p-12 animate-fadeUp will-change-both">
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-900">
                  Identity
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="FULL NAME"
                  className="w-full rounded-2xl border-2 border-zinc-100 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest outline-none transition-colors focus:border-indigo-600"
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-900">
                  Product Type
                </label>
                <select
                  name="productType"
                  value={form.productType}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-2xl border-2 border-zinc-100 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest outline-none transition-colors focus:border-indigo-600"
                >
                  <option value="">SELECT A PRODUCT…</option>
                  <option value="T-Shirt">Custom T-Shirt</option>
                  <option value="Hoodie">Custom Hoodie</option>
                  <option value="Mug">Custom Mug</option>
                  <option value="Phone Case">Custom Phone Case</option>
                  <option value="Other">Other (specify below)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-900">
                  Design Brief
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="COLORS, TEXT, REFERENCES, DEADLINE…"
                  className="w-full resize-none rounded-4xl border-2 border-zinc-100 bg-white px-6 py-4 text-xs font-black uppercase tracking-widest outline-none transition-colors focus:border-indigo-600"
                />
              </div>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] py-5 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-lg shadow-green-900/10 transition-all hover:bg-[#128C7E] active:scale-[0.98]"
              >
                <svg
                  className="h-5 w-5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.131.569-.071 1.758-.699 2.006-1.376.248-.678.248-1.259.173-1.376-.074-.117-.27-.191-.567-.341zM12 0C5.373 0 0 5.373 0 12c0 2.123.55 4.118 1.512 5.859L0 24l6.337-1.663C7.935 23.31 9.894 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.894 0-3.66-.544-5.159-1.482l-.37-.232-3.832 1.004 1.022-3.733-.255-.406C2.488 15.659 2 13.894 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
                Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
};

export default memo(Customize);
