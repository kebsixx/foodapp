import { Category } from "./types/category";
import { PRODUCTS } from "./products";

export const CATEGORIES: Category[] = [
  {
    name: "Coffee",
    slug: "coffee",
    imageUrl: "https://images.unsplash.com/photo-1506372023823-741c83b836fe?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    products: PRODUCTS.filter((product) => product.category.slug === "coffee"),
  },
  {
    name: "Foods",
    slug: "foods",
    imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    products: PRODUCTS.filter((product) => product.category.slug === "foods"),
  },
  {
    name: "Desserts",
    slug: "desserts",
    imageUrl: "https://images.unsplash.com/photo-1543255006-d6395b6f1171?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjN8fGRlc3NlcnR8ZW58MHx8MHx8fDA%3D",
    products: PRODUCTS.filter((product) => product.category.slug === "desserts"),
  },
  {
    name: "Tea",
    slug: "tea",
    imageUrl: "https://images.unsplash.com/photo-1547149617-609fafa00a6b?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    products: PRODUCTS.filter((product) => product.category.slug === "tea"),
  },
  {
    name: "Packages",
    slug: "packages",
    imageUrl: "https://images.unsplash.com/photo-1558689509-900d3d3cc727?q=80&w=2073&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    products: PRODUCTS.filter((product) => product.category.slug === "packages"),
  },
];
