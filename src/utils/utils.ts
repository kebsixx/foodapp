import { nanoid } from "nanoid";

export const generateOrderSlug = () => {
  const randomString = nanoid(4);
  const timestamp = new Date().getDate();
  return `order-${randomString}-${timestamp}`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};
