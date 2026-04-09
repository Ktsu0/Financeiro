export const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

import { parse, isValid } from "date-fns";

export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const formats = ["dd/MM/yyyy", "yyyy-MM-dd", "MM/dd/yyyy", "dd-MM-yyyy"];
    for (const f of formats) {
      const parsed = parse(dateStr, f, new Date());
      if (isValid(parsed)) return parsed;
    }
    
    const native = new Date(dateStr);
    if (isValid(native)) return native;
    
    return null;
  } catch {
    return null;
  }
};
export const formatDateMask = (value) => {
  const cleanValue = value.replace(/\D/g, "");
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 4)
    return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2)}`;
  return `${cleanValue.slice(0, 2)}/${cleanValue.slice(2, 4)}/${cleanValue.slice(4, 8)}`;
};

export const formatDateDisplay = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};
