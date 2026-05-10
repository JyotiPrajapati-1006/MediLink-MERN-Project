import api from "./api";

const createRoleRequest = async (formData) => {
  const response = await api.post("/notifications/role-request", formData);
  return response.data;
};

// For admins to get all pending requests
const getAdminNotifications = async () => {
  const response = await api.get("/notifications/admin");
  return response.data;
};

// For admins to approve or reject a request
const resolveRoleRequest = async (notificationId, status) => {
  const response = await api.patch(
    `/notifications/admin/${notificationId}/resolve`,
    { status }
  );
  return response.data;
};

const notificationService = {
  createRoleRequest,
  getAdminNotifications,
  resolveRoleRequest,
};

export default notificationService;
