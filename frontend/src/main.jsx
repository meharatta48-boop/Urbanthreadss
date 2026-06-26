import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import ReactPixel from "react-facebook-pixel";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";
import { SubCategoryProvider } from "./context/SubCategoryContext";
import { SettingsProvider } from "./context/SettingsContext";

// Initialize Facebook Pixel
ReactPixel.init("1707714900441940");
ReactPixel.pageView();

ReactDOM.createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <AuthProvider>
      <SettingsProvider>
        <CategoryProvider>
          <SubCategoryProvider>
            <ProductProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </ProductProvider>
          </SubCategoryProvider>
        </CategoryProvider>
      </SettingsProvider>
    </AuthProvider>
  </ThemeProvider>
);
