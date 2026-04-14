import api from "./axios";

// GET ALL PRODUCTS
export const getProducts = async () => {
  const { data } = await api.get("/products");
  return data;
};

// GET HERO SLIDES
export const getHeroSlides = async () => {
  const { data } = await api.get("/products/hero");
  return data;
};

// GET SETTINGS
export const getSettings = async () => {
  const { data } = await api.get("/products/settings");
  return data;
};

// GET CATEGORIES
export const getCategories = async () => {
  const { data } = await api.get("/products/categories");
  return data;
};

// CONTACT FORM
export const sendContactMessage = async (body) => {
  const { data } = await api.post("/products/contact", body);
  return data;
};

// GET NEW ARRIVALS
export const getNewArrivals = async () => {
  const { data } = await api.get("/products/new-arrivals");
  return data;
};

// GET SINGLE PRODUCT
export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};
