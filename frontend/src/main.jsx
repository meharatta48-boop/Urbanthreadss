import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ProductProvider } from "./context/ProductContext";
import { CategoryProvider } from "./context/CategoryContext";
import { SubCategoryProvider } from "./context/SubCategoryContext";
import { SettingsProvider } from "./context/SettingsContext";

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
