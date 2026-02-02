// Tax calculation utility for Indian GST/IGST
export const calculateTax = (amount, userState, userCountry, taxConfig) => {
  const isIndia = userCountry?.toLowerCase() === 'india';

if (!taxConfig || !taxConfig.is_tax_enabled) {
  return {
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalTax: 0,
    taxType: 'none',
    taxLabel: 'No Tax'
  };
}

  if (!taxConfig || !taxConfig.is_tax_enabled) {
    return {
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalTax: 0,
      taxType: 'none',
      taxLabel: 'No Tax'
    };
  }
  


  const baseAmount = amount || 0;
  // 🌍 INTERNATIONAL / USD TAX (IGST only)
if (!isIndia) {
  const igst = (baseAmount * taxConfig.igst_rate) / 100;
  return {
    cgst: 0,
    sgst: 0,
    igst,
    totalTax: igst,
    taxType: 'igst',
    taxLabel: `IGST (${taxConfig.igst_rate}%)`
  };
}


  const normalize = (str = '') =>
    str.toLowerCase().replace(/\s+/g, '');

  const userStateNorm = normalize(userState);
  const homeStateNorm = normalize(taxConfig.home_state);

  if (userStateNorm === homeStateNorm) {
    const cgst = (baseAmount * taxConfig.cgst_rate) / 100;
    const sgst = (baseAmount * taxConfig.sgst_rate) / 100;
    return {
      cgst,
      sgst,
      igst: 0,
      totalTax: cgst + sgst,
      taxType: 'cgst_sgst',
      taxLabel: `CGST (${taxConfig.cgst_rate}%) + SGST (${taxConfig.sgst_rate}%)`
    };
  }

  const igst = (baseAmount * taxConfig.igst_rate) / 100;
  return {
    cgst: 0,
    sgst: 0,
    igst,
    totalTax: igst,
    taxType: 'igst',
    taxLabel: `IGST (${taxConfig.igst_rate}%)`
  };
};


export const formatTaxBreakdown = (taxCalculation, currency = 'INR') => {
    const symbol = currency === 'INR' ? '₹' : '$';
    const breakdown = [];

    if (taxCalculation.taxType === 'cgst_sgst') {
        breakdown.push(`CGST: ${symbol}${taxCalculation.cgst.toFixed(2)}`);
        breakdown.push(`SGST: ${symbol}${taxCalculation.sgst.toFixed(2)}`);
    } else if (taxCalculation.taxType === 'igst') {
        breakdown.push(`IGST: ${symbol}${taxCalculation.igst.toFixed(2)}`);
    }

    return breakdown;
};