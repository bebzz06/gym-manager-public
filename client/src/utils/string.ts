/**
 * Extracts the subdomain from the current hostname
 * @param defaultName The default name to return if no subdomain is found
 * @returns The subdomain name with first letter capitalized
 */
export const getSubdomain = (defaultName: string = 'Dojo Manager'): string => {
  const hostname = window.location.hostname;

  // For localhost development
  if (hostname === 'localhost') return defaultName;

  // Split the hostname by dots
  const parts = hostname.split('.');

  // If we have a subdomain (e.g., "dojo.mywebsite.com" has 3 parts)
  if (parts.length > 2) {
    // Capitalize first letter of subdomain for nicer display
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  }

  return defaultName;
};

export const formatToTitleCase = (str: string) => {
  if (!str) return '';

  // Handle snake_case
  if (str.includes('_')) {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Handle all caps case
  if (str === str.toUpperCase()) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Handle camelCase and PascalCase
  const words = str.split(/(?=[A-Z])/);
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};
