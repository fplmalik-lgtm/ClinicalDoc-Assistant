import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stripPII(text: string): string {
  // Regex for common PII
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  // Basic name heuristic is hard with regex, focusing on obvious patterns
  
  return text
    .replace(emailRegex, '[EMAIL REDACTED]')
    .replace(phoneRegex, '[PHONE REDACTED]');
}
