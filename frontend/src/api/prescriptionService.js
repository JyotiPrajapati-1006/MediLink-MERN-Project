// src/api/prescriptionService.js
import api from "./api";

const getMyPrescriptions = async () => {
  const response = await api.get("/prescriptions");
  return response.data;
};

const prescriptionService = {
  getMyPrescriptions,
};

export default prescriptionService;
