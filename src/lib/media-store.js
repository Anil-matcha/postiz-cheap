// In-memory fallback store for media assets when database is offline
let fallbackMediaAssets = [];

export const MediaStore = {
  getAll: (userId) => {
    if (!userId) return [...fallbackMediaAssets];
    return fallbackMediaAssets.filter((a) => a.userId === userId);
  },
  getById: (id) => fallbackMediaAssets.find((a) => a.id === id),
  add: (asset) => {
    const newAsset = {
      id: "media-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folder: asset.folder || "All Media",
      type: asset.type || "image",
      tags: asset.tags || "",
      ...asset,
    };
    fallbackMediaAssets.unshift(newAsset);
    return newAsset;
  },
  update: (id, data) => {
    const idx = fallbackMediaAssets.findIndex((a) => a.id === id);
    if (idx !== -1) {
      fallbackMediaAssets[idx] = {
        ...fallbackMediaAssets[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return fallbackMediaAssets[idx];
    }
    return null;
  },
  delete: (id) => {
    const initialLen = fallbackMediaAssets.length;
    fallbackMediaAssets = fallbackMediaAssets.filter((a) => a.id !== id);
    return fallbackMediaAssets.length < initialLen;
  },
};
