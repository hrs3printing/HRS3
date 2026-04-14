import { useState, useCallback, memo } from "react";
import { Link } from "react-router-dom";
import { PageShell, PageHero, PageContent } from "../components/PageShell";

const faqData = [
  {
    category: "Products & Quality",
    questions: [
      {
        q: "What is the fabric quality of your T-shirts?",
        a: "We use 100% premium combed cotton, ranging from 180 to 240 GSM depending on the collection. Our oversized T-shirts use a heavier weight fabric (240 GSM) for a structured, high-end streetwear look.",
      },
      {
        q: "Are your T-shirts pre-shrunk?",
        a: "Yes, all our T-shirts are pre-shrunk during the manufacturing process to ensure they maintain their original fit and size even after multiple washes.",
      },
      {
        q: "What printing methods do you use?",
        a: "We use high-quality Screen Printing and DTF (Direct to Film) techniques, which provide vibrant colors and exceptional durability. The prints are designed to last and will not crack or peel easily.",
      },
    ],
  },
  {
    category: "Sizing & Fit",
    questions: [
      {
        q: "How do I find my perfect fit?",
        a: "We recommend referring to our size chart available on each product page. For our 'Oversized' collection, if you want a standard fit, we suggest sizing down. For the intended baggy look, go with your regular size.",
      },
      {
        q: "Do you have T-shirts for both men and women?",
        a: "Yes, our entire collection is unisex. The fits are designed to look great on all body types, especially our oversized and round-neck collections.",
      },
    ],
  },
  {
    category: "Shipping & Orders",
    questions: [
      {
        q: "How long will it take to receive my order?",
        a: "Orders are processed within 24-48 hours and typically delivered within 5-7 business days across India. You will receive a tracking link via SMS and email as soon as your order is dispatched.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes, we provide free shipping on all prepaid orders across India. For Cash on Delivery (COD) orders, a small convenience fee may apply.",
      },
    ],
  },
  {
    category: "Care & Maintenance",
    questions: [
      {
        q: "How should I wash my T-shirts?",
        a: "To keep your T-shirts looking new, machine wash them in cold water inside out. Use a mild detergent and avoid bleach. For the best results, air dry them in the shade.",
      },
      {
        q: "Can I iron the prints?",
        a: "We do not recommend ironing directly on the printed areas. If necessary, iron the garment inside out on a low heat setting to protect the design.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day return and exchange policy for all unworn items with original tags. If you receive a damaged or incorrect product, we will provide a free replacement or full refund.",
      },
    ],
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <PageShell>
      <PageHero
        align="left"
        title="FAQs"
        accent="Archive"
        subtitle="Common queries & service guidelines"
      />

      <PageContent>
        <div className="mx-auto max-w-5xl animate-fadeIn will-change-opacity">
          <div className="space-y-10 sm:space-y-14 lg:space-y-20">
            {faqData.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                className="space-y-5 sm:space-y-8 lg:space-y-10 animate-fadeUp will-change-both"
                style={{ animationDelay: `${sectionIndex * 100}ms` }}
              >
                <div className="flex items-center gap-3 sm:gap-6">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-400 shrink-0">
                    {section.category}
                  </h2>
                  <div className="h-px flex-1 bg-zinc-100" />
                </div>

                <div className="grid gap-4 sm:gap-6">
                  {section.questions.map((faq, i) => {
                    const index = `${sectionIndex}-${i}`;
                    const isOpen = openIndex === index;

                    return (
                      <div
                        key={index}
                        className={`group overflow-hidden rounded-4xl border-2 transition-all duration-500 ${
                          isOpen
                            ? "border-zinc-900 bg-white shadow-2xl shadow-black/5"
                            : "border-zinc-50 bg-zinc-50/50 hover:border-zinc-200"
                        }`}
                      >
                        <button
                          className="w-full flex items-center justify-between gap-3 sm:gap-6 p-4 sm:p-8 text-left"
                          onClick={() => toggle(index)}
                        >
                          <h3
                            className={`text-sm sm:text-lg font-black uppercase tracking-tight transition-colors duration-300 ${
                              isOpen ? "text-indigo-600" : "text-zinc-900"
                            }`}
                          >
                            {faq.q}
                          </h3>
                          <div
                            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                              isOpen
                                ? "bg-zinc-900 text-white rotate-45"
                                : "bg-white text-zinc-900 shadow-sm group-hover:bg-zinc-900 group-hover:text-white"
                            }`}
                          >
                            <span className="text-xl font-light">+</span>
                          </div>
                        </button>

                        <div
                          className={`overflow-hidden transition-all duration-500 ease-[0.16,1,0.3,1] ${
                            isOpen
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div className="px-4 sm:px-8 pb-4 sm:pb-8">
                            <div className="h-px w-full bg-zinc-100 mb-4 sm:mb-6" />
                            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-medium max-w-3xl">
                              {faq.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* STILL HAVE QUESTIONS */}
          <div className="relative mt-10 sm:mt-16 lg:mt-20 overflow-hidden rounded-3xl sm:rounded-[3rem] bg-zinc-900 p-8 text-center sm:p-12 lg:p-20 animate-fadeUp will-change-both">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
            <div className="relative z-10 space-y-5 sm:space-y-8">
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                Still have <span className="text-zinc-500">questions?</span>
              </h2>
              <p className="text-zinc-400 text-sm font-medium max-w-md mx-auto">
                Our support team is available for direct help with orders,
                sizing, and customization.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  to="/contact"
                  className="bg-white text-black px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl"
                >
                  Contact Us
                </Link>
                <Link
                  to="/customize"
                  className="bg-zinc-800 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all"
                >
                  Customize a Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContent>
    </PageShell>
  );
};

export default memo(FAQs);
