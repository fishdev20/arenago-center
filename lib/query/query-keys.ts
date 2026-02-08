export const queryKeys = {
  profile: (userId: string) => ["profile", userId] as const,
  centerProfile: () => ["center-profile"] as const,
  sports: () => ["sports"] as const,
  centerFields: () => ["center-fields"] as const,
  centerAmenities: () => ["center-amenities"] as const,
  notifications: () => ["notifications"] as const,
  centers: () => ["centers"] as const,
  center: (centerId: string) => ["center", centerId] as const,
  bookings: (centerId: string) => ["bookings", centerId] as const,
};
