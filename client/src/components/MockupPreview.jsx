import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import whiteShirt from "../assets/white-shirt.webp";
import { getSettings } from "../api/productApi";

const MockupPreview = () => {
  const [userImage, setUserImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [placement, setPlacement] = useState("full-front");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setWhatsappNumber(settings?.contact?.whatsapp || "");
      } catch (err) {
        console.error("Failed to load whatsapp number", err);
      }
    })();
  }, []);

  const processImageTransparency = (imageSrc) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple background removal: convert near-white pixels to transparent
        // This is highly effective for logos with white backgrounds
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If pixel is very bright (near white), make it transparent
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Alpha channel to 0
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = imageSrc;
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image too large. Max 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const processedImage = await processImageTransparency(
          event.target.result,
        );
        setUserImage(processedImage);
        handlePlacement("full-front");
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlacement = (type) => {
    setPlacement(type);
    const isMobile = window.innerWidth < 768;

    if (type === "full-front") {
      setScale(1.1);
      setPosition({ x: 0, y: 0 });
    } else if (type === "left-chest") {
      setScale(isMobile ? 0.3 : 0.35);
      setPosition({
        x: isMobile ? -50 : -75,
        y: isMobile ? -60 : -90,
      });
    }
  };

  const removeImage = () => {
    setUserImage(null);
    setPlacement("full-front");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendToWhatsApp = () => {
    if (!whatsappNumber) {
      toast.error("WhatsApp contact not configured.");
      return;
    }

    const message = `Hello HRS3! I have created a custom design preview using your Visual Lab. \n\nDesign Style: ${placement === "full-front" ? "Full Front Print" : "Left Chest Logo"}\n\nI am interested in getting this printed. Please let me know the process.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <section className="w-full py-20 bg-zinc-50 border-y border-zinc-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: MOCKUP VIEW */}
          <div className="relative group flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-[500px] aspect-[4/5] bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-100"
            >
              {/* T-Shirt Base Mockup (White Tee on Hanger) */}
              <img
                src={whiteShirt}
                alt="White T-Shirt Mockup"
                className="w-full h-full object-cover brightness-105"
              />

              {/* Overlay User Design */}
              <AnimatePresence>
                {userImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: scale }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    drag
                    dragConstraints={{
                      left: window.innerWidth < 768 ? -80 : -120,
                      right: window.innerWidth < 768 ? 80 : 120,
                      top: window.innerWidth < 768 ? -100 : -150,
                      bottom: window.innerWidth < 768 ? 150 : 200,
                    }}
                    style={{
                      x: position.x,
                      y: position.y,
                    }}
                    onDragEnd={(_, info) =>
                      setPosition({ x: info.offset.x, y: info.offset.y })
                    }
                    className="absolute top-[28%] left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing z-10"
                  >
                    <div className="relative w-40 h-40 sm:w-56 sm:h-56 group/design flex items-center justify-center">
                      <img
                        src={userImage}
                        alt="User Design"
                        className="w-full h-full object-contain opacity-90 drop-shadow-sm brightness-105 contrast-110"
                      />
                      <div className="absolute inset-0 border-2 border-dashed border-indigo-500/50 opacity-0 group-hover/design:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Glassmorphism Badge */}
              <div className="absolute top-8 left-8 bg-white/80 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                  Interactive Preview
                </span>
              </div>
            </motion.div>

            {/* Decorative background glow */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
          </div>

          {/* RIGHT: CONTROLS */}
          <div className="space-y-12">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em]">
                  Visual Lab
                </span>
                <div className="h-px w-12 bg-indigo-200" />
              </motion.div>
              <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-[0.9]">
                Preview Your <span className="text-zinc-300">Aesthetic</span>
              </h2>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-tight max-w-md leading-relaxed">
                Upload your art or logo to see how it integrates with our
                signature heavyweight oversized fit.
              </p>
            </div>

            <div className="space-y-8">
              {!userImage ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="group relative flex flex-col items-center justify-center w-full p-12 bg-white border-2 border-dashed border-zinc-200 rounded-[2.5rem] hover:border-indigo-600 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10"
                  >
                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-indigo-50">
                      <svg
                        className="w-6 h-6 text-zinc-400 group-hover:text-indigo-600 transition-colors"
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
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-2">
                      Initialize Design
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                      PNG, JPG up to 5MB
                    </span>
                  </button>
                </motion.div>
              ) : (
                <div className="space-y-8">
                  {/* PLACEMENT OPTIONS */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handlePlacement("left-chest")}
                      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 ${
                        placement === "left-chest"
                          ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-500/10"
                          : "border-zinc-100 bg-white hover:border-zinc-200"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                        <div className="w-3 h-3 bg-indigo-600 rounded-sm translate-x-[-8px] translate-y-[-4px]" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                        Left Chest
                      </span>
                    </button>
                    <button
                      onClick={() => handlePlacement("full-front")}
                      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all duration-300 ${
                        placement === "full-front"
                          ? "border-indigo-600 bg-indigo-50/50 shadow-lg shadow-indigo-500/10"
                          : "border-zinc-100 bg-white hover:border-zinc-200"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center">
                        <div className="w-6 h-6 bg-indigo-600 rounded-md" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">
                        Full Front
                      </span>
                    </button>
                  </div>

                  {/* CONTROL SLIDERS */}
                  <div className="space-y-6 bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                          Scale Archive
                        </span>
                        <span className="text-[10px] font-black text-indigo-600">
                          {Math.round(scale * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2"
                        step="0.05"
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                        className="w-full accent-indigo-600"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={removeImage}
                        className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                      >
                        Reset Design
                      </button>
                      <button
                        onClick={sendToWhatsApp}
                        className="flex-1 py-4 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                      >
                        <svg
                          className="w-4 h-4 fill-current"
                          viewBox="0 0 24 24"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.131.569-.071 1.758-.699 2.006-1.376.248-.678.248-1.259.173-1.376-.074-.117-.27-.191-.567-.341zM12 0C5.373 0 0 5.373 0 12c0 2.123.55 4.118 1.512 5.859L0 24l6.337-1.663C7.935 23.31 9.894 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.894 0-3.66-.544-5.159-1.482l-.37-.232-3.832 1.004 1.022-3.733-.255-.406C2.488 15.659 2 13.894 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
                        </svg>
                        Share via WhatsApp
                      </button>
                    </div>
                  </div>

                  <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-relaxed">
                      Tip: You can drag the design directly on the mockup to
                      reposition it.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockupPreview;
