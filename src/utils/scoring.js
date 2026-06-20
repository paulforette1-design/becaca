/**
 * Calcule le score d'un post selon son lieu.
 * Maison (home) = 1pt, Dehors (outdoor) = 2pts
 */
export const getPostScore = (locationType) =>
  locationType === 'outdoor' ? 2 : 1

export const getLocationLabel = (locationType) =>
  locationType === 'outdoor' ? '🌍 Dehors' : '🏠 Chez lui'

export const getLocationBadgeClass = (locationType) =>
  locationType === 'outdoor'
    ? 'bg-caca-success text-white'
    : 'bg-caca-primary text-white'

/**
 * Calcule le score total d'un utilisateur depuis ses posts.
 */
export const computeUserScore = (posts, userId) =>
  posts
    .filter((p) => p.userId === userId)
    .reduce((acc, p) => acc + getPostScore(p.locationType), 0)
