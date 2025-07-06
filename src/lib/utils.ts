import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(
  value: number | string,
  options = { style: 'currency' as const, currency: 'IDR' as const }
): string {
  return Intl.NumberFormat('id-ID', options).format(Number(value));
}

export function uncurrency(value: string) {
  // Example: "Rp 760.000,00"
  // Remove currency symbol, dots as thousand separators, and replace comma with dot for decimal
  return Number(
    value
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.')
  );
}

export function blockElement(element: HTMLElement | string) {
  if (typeof element === 'string') {
    element = document.querySelector(element) as HTMLElement;
  }

  // Store original position if not already set
  if (!element.dataset.originalPosition) {
    element.dataset.originalPosition = element.style.position || '';
  }

  // Set styles for blocking
  element.style.pointerEvents = 'none';
  element.style.opacity = '0.5';
  element.style.position = 'relative';

  // Create and append loading spinner if it doesn't exist
  if (!element.querySelector('.loading-spinner')) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.style.position = 'absolute';
    spinner.style.top = '50%';
    spinner.style.left = '50%';
    spinner.style.transform = 'translate(-50%, -50%)';
    spinner.style.width = '24px';
    spinner.style.height = '24px';
    spinner.style.border = '3px solid rgba(0, 0, 0, 0.1)';
    spinner.style.borderTopColor = 'hsl(var(--primary))';
    spinner.style.borderRadius = '50%';
    spinner.style.animation = 'spin 1s linear infinite';

    // Add keyframes for the spinner animation if not already in the document
    if (!document.getElementById('spinner-keyframes')) {
      const style = document.createElement('style');
      style.id = 'spinner-keyframes';
      style.textContent = `
        @keyframes spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    element.appendChild(spinner);
  }
}

export function unblockElement(element: HTMLElement | string) {
  if (typeof element === 'string') {
    element = document.querySelector(element) as HTMLElement;
  }

  // Set styles for blocking
  element.style.pointerEvents = 'auto';
  element.style.opacity = '1';
  element.style.position = 'relative';

  // Restore original position
  element.style.position = element.dataset.originalPosition || '';
  delete element.dataset.originalPosition;

  // Remove loading spinner if it exists
  const spinner = element.querySelector('.loading-spinner');

  if (spinner) {
    spinner.remove();
  }
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
