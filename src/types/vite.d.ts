/// <reference types="vite/client" />

interface ImportMeta {
  glob: <T = string>(pattern: string, options?: { as?: 'raw' | 'url' | 'string', eager?: boolean }) => Record<string, T>;
}

declare module '*.md' {
  const content: string;
  export default content;
} 