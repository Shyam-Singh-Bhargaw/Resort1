import React from "react";

type Props = {
  quantity: number;
  max?: number;
  onAdd: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

export const QuantityButton: React.FC<Props> = ({ quantity, max = 999, onAdd, onIncrement, onDecrement }) => {
  if (!quantity || quantity <= 0) {
    return (
      <button type="button" className="px-3 py-1 bg-primary text-white rounded" onClick={onAdd}>
        ADD
      </button>
    );
  }

  return (
    <div className="inline-flex items-center border rounded overflow-hidden">
      <button type="button" className="px-3 py-1" onClick={onDecrement}>-</button>
      <div className="px-4">{quantity}</div>
      <button type="button" className="px-3 py-1" onClick={onIncrement} disabled={quantity >= max}>+</button>
    </div>
  );
};

export default QuantityButton;
