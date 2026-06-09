import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import fullShirt from "../assets/full.png";
import mugMockup from "../assets/mug.png";
import { getSettings } from "../api/productApi";

const MockupPreview = ({ type = "t-shirt" }) => {
  const isMug = type === "mug";
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontConfig, setFrontConfig] = useState({
    scale: 1,
    borderRadius: 0,
    position: { x: 0, y: 0 },
    placement: "full-front",
  });
  const [backConfig, setBackConfig] = useState({
    scale: 1,
    borderRadius: 0,
    position: { x: 0, y: 0 },
    placement: "round",
  });
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [fabrics, setFabrics] = useState([]);
  const [printTypes, setPrintTypes] = useState([]);
  const [selectedFabric, setSelectedFabric] = useState("");
  const [selectedPrintType, setSelectedPrintType] = useState("");
  const frontFileInputRef = useRef(null);
  const backFileInputRef = useRef(null);

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
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = imageSrc;
    });
  };

  const handleImageUploadForView = (e, targetView) => {
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
        if (targetView === "front") {
          setFrontImage(processedImage);
          setFrontConfig((prev) => ({
            ...prev,
            placement: "full-front",
            scale: 0.8,
            position: { x: 0, y: 110 },
          }));
        } else {
          setBackImage(processedImage);
          setBackConfig((prev) => ({
            ...prev,
            placement: "round",
            scale: 0.8,
            position: { x: 0, y: 0 },
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlacement = (viewType, type) => {
    const isMobile = window.innerWidth < 768;
    let newScale = 0.5;
    let newPosition = { x: 0, y: 0 };
    let newBorderRadius = 0;

    if (viewType === "front") {
      switch (type) {
        case "left-chest":
          newScale = isMobile ? 0.2 : 0.25;
          newPosition = {
            x: isMobile ? -25 : -35,
            y: isMobile ? 40 : 55,
          };
          break;
        case "right-chest":
          newScale = isMobile ? 0.2 : 0.25;
          newPosition = {
            x: isMobile ? 45 : 65,
            y: isMobile ? 40 : 55,
          };
          break;
        case "full-front":
          newScale = isMobile ? 0.7 : 0.8;
          newPosition = {
            x: isMobile ? 10 : 13,
            y: isMobile ? 80 : 110,
          };
          break;
        case "left-sleeve":
          newScale = isMobile ? 0.1 : 0.15;
          newPosition = {
            x: isMobile ? -75 : -125,
            y: isMobile ? 50 : 80,
          };
          newBorderRadius = 100;
          break;
        case "right-sleeve":
          newScale = isMobile ? 0.1 : 0.15;
          newPosition = {
            x: isMobile ? 75 : 150,
            y: isMobile ? 50 : 80,
          };
          newBorderRadius = 100;
          break;
        case "custom":
          newScale = 0.5;
          newPosition = { x: 0, y: 0 };
          break;
        default:
          break;
      }
      setFrontConfig((prev) => ({
        ...prev,
        placement: type,
        scale: newScale,
        position: newPosition,
        borderRadius: newBorderRadius,
      }));
    } else {
      switch (type) {
        case "full-back":
          newScale = isMobile ? 0.6 : 0.7;
          newPosition = {
            x: isMobile ? -15 : -20,
            y: isMobile ? -25 : -35,
          };
          newBorderRadius = 0;
          break;
        case "custom":
          newScale = 0.5;
          newPosition = { x: 0, y: 0 };
          newBorderRadius = 0;
          break;
        default:
          break;
      }
      setBackConfig((prev) => ({
        ...prev,
        placement: type,
        scale: newScale,
        position: newPosition,
        borderRadius: newBorderRadius,
      }));
    }
  };

  const resetAll = () => {
    removeImage("front");
    removeImage("back");
  };

  const removeImage = (viewType) => {
    if (viewType === "front") {
      setFrontImage(null);
      setFrontConfig({
        scale: 1,
        borderRadius: 0,
        position: { x: 0, y: 0 },
        placement: "full-front",
      });
      if (frontFileInputRef.current) frontFileInputRef.current.value = "";
    } else {
      setBackImage(null);
      setBackConfig({
        scale: 1,
        borderRadius: 0,
        position: { x: 0, y: 0 },
        placement: "round",
      });
      if (backFileInputRef.current) backFileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setWhatsappNumber(settings?.contact?.whatsapp || "");
        setFabrics(settings?.fabrics || []);
        setPrintTypes(settings?.printTypes || []);
        if (settings?.fabrics?.length) setSelectedFabric(settings.fabrics[0]);
        if (settings?.printTypes?.length)
          setSelectedPrintType(settings.printTypes[0]);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    })();
  }, []);

  const sendToWhatsApp = async () => {
    if (!whatsappNumber) {
      toast.error("WhatsApp contact not configured.");
      return;
    }

    toast.loading("Preparing your design files...", { id: "wa-share" });

    const frontMsg = frontImage
      ? `\nFront Placement: ${
          frontConfig.placement === "left-chest"
            ? "Left Chest"
            : frontConfig.placement === "right-chest"
              ? "Right Chest"
              : frontConfig.placement === "full-front"
                ? "Full Front"
                : frontConfig.placement === "left-sleeve"
                  ? "Left Sleeve"
                  : frontConfig.placement === "right-sleeve"
                    ? "Right Sleeve"
                    : "Custom Placement"
        } (X: ${Math.round(frontConfig.position.x)}, Y: ${Math.round(frontConfig.position.y)}, Scale: ${Math.round(frontConfig.scale * 100)}%, Roundness: ${frontConfig.borderRadius}%)`
      : "";
    const backMsg = backImage
      ? `\nBack Placement: ${
          backConfig.placement === "full-back"
            ? "Full Back"
            : "Custom Placement"
        } (X: ${Math.round(backConfig.position.x)}, Y: ${Math.round(backConfig.position.y)}, Scale: ${Math.round(backConfig.scale * 100)}%, Roundness: ${backConfig.borderRadius}%)`
      : "";
    const fabricMsg = selectedFabric ? `\nFabric: ${selectedFabric}` : "";
    const printMsg = selectedPrintType
      ? `\nPrint Type: ${selectedPrintType}`
      : "";

    const baseMessage = `Hello HRS3! I have designed a custom ${isMug ? "Mug" : "T-shirt"} using your Visual Lab.${frontMsg}${backMsg}${fabricMsg}${printMsg}\n\nI'm interested in getting this printed. Please let me know the next steps.`;

    const encodedMessage = encodeURIComponent(baseMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}?text=${encodedMessage}`;

    toast.success("Opening WhatsApp...", { id: "wa-share" });

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 1000);
  };

  const DesignSection = ({
    viewType,
    image,
    config,
    setConfig,
    fileInputRef,
  }) => {
    return (
      <div className="space-y-4 max-w-[420px] mx-auto w-full">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
            {viewType} Customization
          </span>
          {image && (
            <button
              onClick={() => removeImage(viewType)}
              className="text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {!image ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleImageUploadForView(e, viewType)}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="group relative flex flex-col items-center justify-center w-full p-8 bg-white border-2 border-dashed border-zinc-200 rounded-[2rem] hover:border-indigo-600 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10"
            >
              <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 group-hover:bg-indigo-50">
                <svg
                  className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600 transition-colors"
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
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900 mb-1">
                Upload {viewType} Design
              </span>
              <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                Max 5MB
              </span>
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4 animate-fadeIn bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm">
            {!isMug && viewType === "front" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "left-chest", label: "Left Chest" },
                  { id: "right-chest", label: "Right Chest" },
                  { id: "full-front", label: "Full Front" },
                  { id: "left-sleeve", label: "Left Sleeve" },
                  { id: "right-sleeve", label: "Right Sleeve" },
                  { id: "custom", label: "Custom" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePlacement(viewType, p.id)}
                    className={`flex items-center justify-center px-2 py-2.5 rounded-xl border-2 transition-all ${
                      config.placement === p.id
                        ? "border-black bg-black text-white"
                        : "border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200"
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!isMug && viewType === "back" && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "full-back", label: "Full Back" },
                  { id: "custom", label: "Custom" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePlacement(viewType, p.id)}
                    className={`flex items-center justify-center px-2 py-2.5 rounded-xl border-2 transition-all ${
                      config.placement === p.id
                        ? "border-black bg-black text-white"
                        : "border-zinc-100 bg-white text-zinc-400 hover:border-zinc-200"
                    }`}
                  >
                    <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div
              className={`space-y-4 ${!isMug ? "pt-4 border-t border-zinc-50" : ""}`}
            >
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    Logo Size
                  </span>
                  <span className="text-[9px] font-black text-indigo-600">
                    {Math.round(config.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.05"
                  value={config.scale}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      scale: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Roundness
                    </span>
                    <span className="text-[9px] font-black text-indigo-600">
                      {config.borderRadius}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={config.borderRadius}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        borderRadius: parseInt(e.target.value),
                      }))
                    }
                    className="w-full h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {config.placement === "custom" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Horizontal
                    </span>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      step="1"
                      value={config.position.x}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          position: {
                            ...prev.position,
                            x: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                    />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                      Vertical
                    </span>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      step="1"
                      value={config.position.y}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          position: {
                            ...prev.position,
                            y: parseInt(e.target.value),
                          },
                        }))
                      }
                      className="w-full h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-zinc-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="w-full py-12 bg-zinc-50 border-y border-zinc-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-10">
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <span className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.4em]">
                  Visual Lab
                </span>
                <div className="h-px w-10 bg-indigo-200" />
              </motion.div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-black leading-[0.9]">
                Preview Your <span className="text-zinc-300">Aesthetic</span>
              </h2>
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-tight max-w-md leading-relaxed">
                {isMug
                  ? "Customize your mug with our interactive laboratory."
                  : "Customize front and back independently."}
              </p>
            </div>

            {!isMug && (
              <div className="flex flex-col gap-3 min-w-[280px]">
                <div className="grid grid-cols-2 gap-3">
                  {fabrics.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                        Fabric
                      </label>
                      <select
                        value={selectedFabric}
                        onChange={(e) => setSelectedFabric(e.target.value)}
                        className="w-full bg-white border border-zinc-100 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 appearance-none cursor-pointer"
                      >
                        {fabrics.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {printTypes.length > 0 && (
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                        Technique
                      </label>
                      <select
                        value={selectedPrintType}
                        onChange={(e) => setSelectedPrintType(e.target.value)}
                        className="w-full bg-white border border-zinc-100 rounded-lg px-3 py-2 text-[9px] font-black uppercase tracking-widest outline-none focus:border-indigo-600 appearance-none cursor-pointer"
                      >
                        {printTypes.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MAIN PREVIEW AREA */}
          <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
            {/* MOCKUP STICKY */}
            <div className="w-full lg:w-1/2 lg:sticky lg:top-24">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative w-full aspect-[4/5] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-zinc-100"
              >
                <img
                  src={isMug ? mugMockup : fullShirt}
                  alt="Mockup Preview"
                  className="w-full h-full object-cover brightness-105"
                />

                <AnimatePresence>
                  {/* FRONT DESIGN */}
                  {frontImage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: frontConfig.scale }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      drag
                      dragConstraints={{
                        left: -150,
                        right: 150,
                        top: -200,
                        bottom: 200,
                      }}
                      style={{
                        x: frontConfig.position.x,
                        y: frontConfig.position.y,
                      }}
                      onDragEnd={(_, info) =>
                        setFrontConfig((prev) => ({
                          ...prev,
                          position: {
                            x: prev.position.x + info.offset.x,
                            y: prev.position.y + info.offset.y,
                          },
                        }))
                      }
                      className={`absolute top-[28%] ${isMug ? "left-1/2" : "left-[28%]"} -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing`}
                    >
                      <div
                        style={{ borderRadius: `${frontConfig.borderRadius}%` }}
                        className="relative w-24 h-24 sm:w-40 sm:h-40 group/design flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={frontImage}
                          alt="Front Design"
                          style={{
                            borderRadius: `${frontConfig.borderRadius}%`,
                            mixBlendMode: "multiply",
                            filter: "contrast(1.1) brightness(1.05)",
                          }}
                          className="w-full h-full opacity-90 object-cover"
                        />
                        <div
                          style={{
                            borderRadius: `${frontConfig.borderRadius}%`,
                          }}
                          className="absolute inset-0 border-2 border-dashed border-indigo-500/50 opacity-100 transition-opacity pointer-events-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* BACK DESIGN */}
                  {!isMug && backImage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: backConfig.scale }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      drag
                      dragConstraints={{
                        left: -150,
                        right: 150,
                        top: -200,
                        bottom: 200,
                      }}
                      style={{
                        x: backConfig.position.x,
                        y: backConfig.position.y,
                      }}
                      onDragEnd={(_, info) =>
                        setBackConfig((prev) => ({
                          ...prev,
                          position: {
                            x: prev.position.x + info.offset.x,
                            y: prev.position.y + info.offset.y,
                          },
                        }))
                      }
                      className="absolute top-[28%] left-[72%] -translate-x-1/2 z-10 cursor-grab active:cursor-grabbing"
                    >
                      <div
                        style={{ borderRadius: `${backConfig.borderRadius}%` }}
                        className="relative w-24 h-24 sm:w-40 sm:h-40 group/design flex items-center justify-center overflow-hidden"
                      >
                        <img
                          src={backImage}
                          alt="Back Design"
                          style={{
                            borderRadius: `${backConfig.borderRadius}%`,
                            mixBlendMode: "multiply",
                            filter: "contrast(1.1) brightness(1.05)",
                          }}
                          className="w-full h-full opacity-90 object-cover"
                        />
                        <div
                          style={{
                            borderRadius: `${backConfig.borderRadius}%`,
                          }}
                          className="absolute inset-0 border-2 border-dashed border-indigo-500/50 opacity-100 transition-opacity pointer-events-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute top-6 left-6 bg-indigo-600 border border-indigo-400 px-3 py-1.5 rounded-full shadow-lg">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white">
                    Preview
                  </span>
                </div>
              </motion.div>
            </div>

            {/* CONTROLS AREA */}
            <div className="w-full lg:w-1/2 flex flex-col gap-10">
              <DesignSection
                viewType="front"
                image={frontImage}
                config={frontConfig}
                setConfig={setFrontConfig}
                fileInputRef={frontFileInputRef}
              />

              {!isMug && (
                <DesignSection
                  viewType="back"
                  image={backImage}
                  config={backConfig}
                  setConfig={setBackConfig}
                  fileInputRef={backFileInputRef}
                />
              )}

              {/* FINAL ACTION */}
              <div className="pt-4 space-y-3">
                <button
                  onClick={resetAll}
                  className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 border border-zinc-200"
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
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reset All Designs
                </button>

                <button
                  onClick={sendToWhatsApp}
                  className="w-full py-5 bg-green-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.353-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.131.569-.071 1.758-.699 2.006-1.376.248-.678.248-1.259.173-1.376-.074-.117-.27-.191-.567-.341zM12 0C5.373 0 0 5.373 0 12c0 2.123.55 4.118 1.512 5.859L0 24l6.337-1.663C7.935 23.31 9.894 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.894 0-3.66-.544-5.159-1.482l-.37-.232-3.832 1.004 1.022-3.733-.255-.406C2.488 15.659 2 13.894 2 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
                  </svg>
                  Order via WhatsApp
                </button>
                <p className="text-center mt-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  Tip: Designs are saved automatically as you edit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MockupPreview;
