import api from "./api";

// Get all of the current user's resumes
export const getAllResumes = async () => {
  const res = await api.get("/resumes/all");
  return res.data;
};

// Get a single resume by ID
export const getResumeById = async (id) => {
  const res = await api.get(`/resumes/${id}`);
  return res.data;
};

// Add a new resume
export const addResume = async (resumeData) => {
  const res = await api.post("/resumes/add", resumeData);
  return res.data;
};

// Update an existing resume
export const updateResume = async (id, resumeData) => {
  const res = await api.put(`/resumes/${id}`, resumeData);
  return res.data;
};

// Delete a resume
export const deleteResume = async (id) => {
  const res = await api.delete(`/resumes/${id}`);
  return res.data;
};
