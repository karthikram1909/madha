// ===================================================
// LOCAL DEV MOCK INTEGRATIONS (Base44 REMOVED)
// ===================================================

// These are dummy functions so the app does not crash.
// Later, you will replace these with real backend APIs.

export const Core = {
  InvokeLLM: async () => ({
    success: true,
    output: "Mock LLM response",
  }),

  SendEmail: async () => ({
    success: true,
  }),

  UploadFile: async () => ({
    success: true,
    fileUrl: "",
  }),

  GenerateImage: async () => ({
    success: true,
    imageUrl: "",
  }),

  ExtractDataFromUploadedFile: async () => ({
    success: true,
    data: {},
  }),

  CreateFileSignedUrl: async () => ({
    success: true,
    url: "",
  }),

  UploadPrivateFile: async () => ({
    success: true,
    fileUrl: "",
  }),
};

// Optional named exports (if used directly elsewhere)
export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = Core.CreateFileSignedUrl;
export const UploadPrivateFile = Core.UploadPrivateFile;
