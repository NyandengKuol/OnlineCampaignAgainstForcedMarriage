export const readSavedResourceIds = (userId) => {
  if (!userId) return [];
  try {
    const saved = JSON.parse(localStorage.getItem(`saved_resources_${userId}`) || '[]');
    return Array.isArray(saved) ? saved.map(String) : [];
  } catch {
    return [];
  }
};

export const writeSavedResourceIds = (userId, ids) => {
  if (!userId) return;
  localStorage.setItem(`saved_resources_${userId}`, JSON.stringify([...new Set(ids.map(String))]));
  window.dispatchEvent(new CustomEvent('saved-resources-changed', { detail: { userId } }));
};
