const isEnabled = (value: string | undefined, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return value === "1" || value.toLowerCase() === "true";
};

export const isPublicBlogEnabled = () =>
  isEnabled(process.env.NEXT_PUBLIC_BLOG_ENABLED, false);
