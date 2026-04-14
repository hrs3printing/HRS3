import api from "./axios";

export const getAdminStats = () =>
  api.get("/admin/stats").then((r) => r.data);

export const getAdminOrders = () =>
  api.get("/admin/orders").then((r) => r.data);

export const patchAdminOrder = (id, body) =>
  api.patch(`/admin/orders/${id}`, body).then((r) => r.data);

export const createAdminProduct = (body) =>
  api.post("/admin/products", body).then((r) => r.data);

export const updateAdminProduct = (id, body) =>
  api.put(`/admin/products/${id}`, body).then((r) => r.data);

export const deleteAdminProduct = (id) =>
  api.delete(`/admin/products/${id}`).then((r) => r.data);

export const getHeroSlides = () =>
  api.get("/admin/hero").then((r) => r.data);
export const createHeroSlide = (body) =>
  api.post("/admin/hero", body).then((r) => r.data);
export const updateHeroSlide = (id, body) =>
  api.put(`/admin/hero/${id}`, body).then((r) => r.data);
export const deleteHeroSlide = (id) =>
  api.delete(`/admin/hero/${id}`).then((r) => r.data);

export const getAdminSettings = () =>
  api.get("/admin/settings").then((r) => r.data);
export const updateAdminSettings = (body) =>
  api.put("/admin/settings", body).then((r) => r.data);

export const createAdminCategory = (body) =>
  api.post("/admin/categories", body).then((r) => r.data);
export const updateAdminCategory = (id, body) =>
  api.put(`/admin/categories/${id}`, body).then((r) => r.data);
export const deleteAdminCategory = (id) =>
  api.delete(`/admin/categories/${id}`).then((r) => r.data);

export const uploadAdminImages = (formData) =>
  api
    .post("/admin/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
