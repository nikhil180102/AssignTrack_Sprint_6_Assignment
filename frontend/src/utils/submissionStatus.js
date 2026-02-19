const STORAGE_KEY_PREFIX = 'submittedAssignmentIds_';
function getStorageKey(userId) {
  return userId != null ? `${STORAGE_KEY_PREFIX}${userId}` : null;
}
export const getSubmittedIds = (userId) => {
  const key = getStorageKey(userId);
  if (!key) return new Set();
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

export const addSubmittedId = (assignmentId, userId) => {
  if (userId == null) return;
  const key = getStorageKey(userId);
  const set = getSubmittedIds(userId);
  set.add(Number(assignmentId));
  localStorage.setItem(key, JSON.stringify(Array.from(set)));
};
