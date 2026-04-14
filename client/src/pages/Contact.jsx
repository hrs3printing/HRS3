import { memo, useEffect, useState, useCallback } from "react";
import { getSettings } from "../api/productApi";
import toast from "react-hot-toast";
import { PageShell, PageHero, PageContent } from "../components/PageShell";

const Contact = () => {
  const [settings, setSettings] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error("Contact settings load error:", err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleWhatsApp = useCallback(
    (e) => {
      e.preventDefault();
      const whatsappNumber = settings?.contact?.whatsapp;

      if (!whatsappNumber) {
        toast.error("WhatsApp contact is not configured by admin.");
        return;
      }

      if (!form.name || !form.email || !form.message) {
        toast.error("Please fill in all fields.");
        return;
      }

      const messageText = `Hello HRS3!\n\n*New Inquiry*\n*Name:* ${form.name}\n*Email:* ${form.email}\n*Message:* ${form.message}`;
      const encodedMessage = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodedMessage}`;

      window.open(whatsappUrl, "_blank");
    },
    [form, settings],
  );

  return (
    <PageShell>
      <PageHero
        align="left"
        title="Get in"
        accent="Touch"
        subtitle="Human assistance for premium collections"
      />

      <PageContent>
        <div className="grid gap-20 lg:grid-cols-2">
          {/* LEFT: INFO */}
          <div className="space-y-20 animate-slideRight will-change-both">
            <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">
                Communication Channels
              </h2>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed max-w-sm">
                Our team is dedicated to providing high-end support for your
                archive experience.
              </p>
            </div>

            <div className="space-y-8">
              {settings?.contact?.email && (
                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    Digital Mail
                  </p>
                  <p className="text-lg font-black text-black group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                    {settings.contact.email}
                  </p>
                </div>
              )}
              {settings?.contact?.phone && (
                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    Direct Line
                  </p>
                  <p className="text-lg font-black text-black group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                    {settings.contact.phone}
                  </p>
                </div>
              )}
              {settings?.contact?.address && (
                <div className="group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                    Archive Location
                  </p>
                  <p className="text-lg font-black text-black leading-tight uppercase tracking-tight">
                    {settings.contact.address}
                  </p>
                </div>
              )}
              <div className="group">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                  Operating Hours
                </p>
                <p className="text-lg font-black text-black uppercase tracking-tight">
                  Mon — Sat / 10am — 6pm
                </p>
              </div>
            </div>

            {/* SOCIALS */}
            <div className="flex gap-8 pt-8 border-t border-zinc-100">
              {["Instagram", "Facebook", "Twitter"].map((social) => (
                <button
                  key={social}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: FORM */}
          <div className="animate-slideLeft will-change-both">
            <form
              onSubmit={handleWhatsApp}
              className="bg-zinc-50 p-8 sm:p-12 rounded-[3rem] border-2 border-zinc-100 space-y-8"
            >
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Identity
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="FULL NAME"
                    required
                    className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Digital Reach
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="EMAIL ADDRESS"
                    required
                    className="w-full bg-white border-2 border-zinc-100 rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-900 ml-1">
                    Archive Inquiry
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="HOW CAN WE ASSIST?"
                    required
                    rows="4"
                    className="w-full bg-white border-2 border-zinc-100 rounded-4xl px-6 py-4 text-xs font-black uppercase tracking-widest outline-none focus:border-indigo-600 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-4 bg-black text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl shadow-black/10"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.131.569-.071 1.758-.699 2.006-1.376.248-.678.248-1.259.173-1.376-.074-.117-.27-.191-.567-.341zM12 0C5.373 0 0 5.373 0 12c0 2.123.55 4.118 1.512 5.859L0 24l6.337-1.663C7.935 23.31 9.894 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.894 0-3.66-.544-5.159-1.482l-.37-.232-3.832 1.004 1.022-3.733-.255-.406C2.488 15.659 2 13.894 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
                </svg>
                Send via WhatsApp
              </button>
            </form>
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
};

export default memo(Contact);
