import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const formatCurrency = (amount) => {
    if (amount == null) return 'N/A' // Use loose comparison for 0 or null

    // Note: Using 'id-ID' locale for Rupiah, adjust as needed
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 2, // Ensure at least 2 decimal places
        maximumFractionDigits: 2  // Ensure no more than 2 decimal places
    }).format(amount)
}