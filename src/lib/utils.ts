import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Dzień dobry';
  if (hour >= 12 && hour < 17) return 'Popołudniowe plany';
  if (hour >= 17 && hour < 21) return 'Wieczorne przemyślenia';
  return 'Nocna wachta';
}

export function getGreetingSubtext(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Gotowy do działania, Dowódco.';
  if (hour >= 12 && hour < 17) return 'Pora na strategiczne decyzje.';
  if (hour >= 17 && hour < 21) return 'Czas na przegląd sytuacji.';
  return 'Spokojny czas na planowanie.';
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
