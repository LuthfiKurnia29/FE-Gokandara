// Polyfill for localStorage during SSR
// This prevents "localStorage.getItem is not a function" errors in Next.js

if (typeof window === 'undefined') {
  // Create a mock localStorage for server-side rendering
  const mockStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0
  };

  // @ts-ignore - We're intentionally patching the global object
  global.localStorage = mockStorage;
  // @ts-ignore
  global.sessionStorage = mockStorage;
}

export {};

