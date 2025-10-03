// Currency utility functions for Pakistani Rupee (PKR)

/**
 * Format price in Pakistani Rupees
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the currency symbol (default: true)
 * @returns {string} Formatted price string
 */
export const formatPrice = (amount, showSymbol = true) => {
    if (!amount && amount !== 0) return showSymbol ? 'PKR 0' : '0';

    const formattedAmount = parseFloat(amount).toLocaleString('en-PK', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

    return showSymbol ? `PKR ${formattedAmount}` : formattedAmount;
};

/**
 * Format price with decimal places
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the currency symbol (default: true)
 * @returns {string} Formatted price string with decimals
 */
export const formatPriceWithDecimals = (amount, showSymbol = true) => {
    if (!amount && amount !== 0) return showSymbol ? 'PKR 0.00' : '0.00';

    const formattedAmount = parseFloat(amount).toLocaleString('en-PK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return showSymbol ? `PKR ${formattedAmount}` : formattedAmount;
};

/**
 * Convert USD to PKR (approximate conversion)
 * Note: In production, this should use a real-time currency API
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in PKR
 */
export const convertUsdToPkr = (usdAmount) => {
    const exchangeRate = 280; // Approximate USD to PKR rate
    return usdAmount * exchangeRate;
};

/**
 * Get currency symbol
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = () => 'PKR';

/**
 * Get free shipping threshold in PKR
 * @returns {number} Free shipping threshold
 */
export const getFreeShippingThreshold = () => 25000; // PKR 25,000 (approx $100 USD converted)

/**
 * Get default shipping cost in PKR
 * @returns {number} Shipping cost
 */
export const getShippingCost = () => 4200; // PKR 4,200 (approx $15 USD converted)