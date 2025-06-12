  export function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      const val = num / 1000;
      return val.toFixed(val % 1 === 0 ? 0 : 1) + 'K';
    }
    return num.toString();
  }
