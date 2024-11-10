export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const isNewPost = (created_at: string) => {
  const postDate = new Date(created_at);
  const currentDate = new Date();
  const differenceInDays =
    (currentDate.getTime() - postDate.getTime()) / (1000 * 3600 * 24);
  return differenceInDays <= 30;
};
