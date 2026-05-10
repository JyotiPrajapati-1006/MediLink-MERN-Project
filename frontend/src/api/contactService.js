import api from "./api";

const submitContactForm = async (formData) => {
  // Point to the new, public endpoint
  const response = await api.post("/contact", formData);
  return response.data;
};

const contactService = {
  submitContactForm,
};

export default contactService;
