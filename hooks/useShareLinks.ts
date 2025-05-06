/**
 * Custom hook for generating share links
 */
export const useShareLinks = (itemType: "file" | "folder", itemId: string) => {
  const getShareLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/share/${itemType}/${itemId}`;
  };

  const getInvitationLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/share/invitation/${token}`;
  };

  return {
    getShareLink,
    getInvitationLink,
  };
};
