import { useState } from "react";

const faqs = [
  {
    question: "What is the quality of your T-shirts?",
    answer:
      "Our T-shirts are made from 100% premium combed cotton, typically 180-240 GSM for a perfect balance of durability and comfort. Our oversized collection features a heavier weight fabric for that authentic streetwear feel.",
  },
  {
    question: "How do I choose the right size?",
    answer:
      "We provide a detailed size chart on every product page. For our 'Oversized' collection, we recommend sticking to your usual size for a baggy fit, or sizing down if you prefer a more standard fit. Our 'Polo' and 'Round Neck' shirts are true to size.",
  },
  {
    question: "How should I care for my T-shirts?",
    answer:
      "To maintain the print and fabric quality, we recommend machine washing in cold water, inside out, with similar colors. Avoid bleaching and tumble drying. If ironing is needed, iron on the reverse side of the print.",
  },
  {
    question: "What is your delivery timeline?",
    answer:
      "Standard shipping typically takes 5-7 business days across India. Once your order is dispatched, you will receive a tracking link via email and SMS to monitor your shipment in real-time.",
  },
  {
    question: "Do you offer returns or exchanges?",
    answer:
      "Yes! We offer a 7-day hassle-free return and exchange policy for all non-customized items, provided they are unworn and have the original tags attached. For any manufacturing defects, we provide a full replacement.",
  },
  {
    question: "Are your oversized T-shirts unisex?",
    answer:
      "Absolutely! Our entire collection, including Oversized, Polo, and Round Neck T-shirts, is designed to be unisex and fits perfectly for both men and women.",
  },
];

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggle = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full py-20 animate-fadeIn will-change-opacity">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-black leading-none mb-6 animate-fadeUp will-change-both">
            Got <span className="text-gray-200">Questions?</span>
          </h2>
          <div className="flex items-center justify-center gap-3 animate-fadeUp will-change-both animate-delay-200">
            <span className="h-px w-8 bg-indigo-600" />
            <p className="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-[0.3em]">
              Everything you need to know.
            </p>
            <span className="h-px w-8 bg-indigo-600" />
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group overflow-hidden rounded-[2rem] border transition-all duration-500 animate-fadeUp will-change-both ${
                activeIndex === index
                  ? "border-indigo-600 bg-white shadow-2xl shadow-indigo-500/10"
                  : "border-zinc-100 bg-zinc-50/50 hover:border-zinc-300"
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <button
                className="w-full flex items-center justify-between gap-6 p-6 sm:p-8 text-left"
                onClick={() => toggle(index)}
              >
                <h3
                  className={`text-sm sm:text-lg font-black uppercase tracking-tight transition-colors duration-300 ${
                    activeIndex === index ? "text-indigo-600" : "text-zinc-900"
                  }`}
                >
                  {faq.question}
                </h3>
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                    activeIndex === index
                      ? "bg-indigo-600 text-white rotate-45"
                      : "bg-white text-zinc-900 shadow-sm group-hover:bg-zinc-900 group-hover:text-white"
                  }`}
                >
                  <span className="text-xl font-light">+</span>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-[0.16,1,0.3,1] ${
                  activeIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                  <div className="h-px w-full bg-zinc-100 mb-6" />
                  <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-medium max-w-2xl">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
