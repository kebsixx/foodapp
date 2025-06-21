import React, { createContext, useContext } from "react";

// Tipe untuk nilai yang akan kita bagikan di dalam context
type ScrollContextType = {
  onScroll: (...args: any[]) => void;
};

// Buat context dengan nilai default
const ScrollContext = createContext<ScrollContextType>({
  onScroll: () => {},
});

// Buat custom hook agar lebih mudah digunakan di komponen lain
export const useScroll = () => {
  return useContext(ScrollContext);
};

// Komponen Provider tidak dibutuhkan di sini karena kita akan provide langsung dari layout
export default ScrollContext;
