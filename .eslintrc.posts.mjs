import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Posts-specific rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
      'react-hooks/exhaustive-deps': 'error',
      'jsx-a11y/alt-text': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      '@typescript-eslint/prefer-optional-chain': 'warn',
      'react/jsx-key': 'error',
      'no-console': 'warn'
    },
    overrides: [
      {
        files: ['components/ui/post-*.tsx', 'convex/posts.ts'],
        rules: {
          // Stricter rules for posts components
          '@typescript-eslint/no-non-null-assertion': 'warn',
          'react/prop-types': 'off', // Using TypeScript for props
          '@typescript-eslint/explicit-function-return-type': 'off'
        }
      }
    ]
  }
];