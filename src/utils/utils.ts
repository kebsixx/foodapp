import { nanoid } from "nanoid";

export const generateOrderSlug = () => {
  const randomString = nanoid(4);
  const timestamp = new Date().getDate();
  return `order-${randomString}-${timestamp}`;
};
