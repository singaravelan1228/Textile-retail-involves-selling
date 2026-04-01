import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      if (exists) return prev.map((i) => i._id === product._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  }, []);

  const changeQty = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => i._id === id ? { ...i, qty: i.qty + delta } : i)
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = items.reduce((s, i) => s + i.pricePerUnit * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, changeQty, clearCart, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
