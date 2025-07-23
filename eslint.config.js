import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow unused variables and arguments
      '@typescript-eslint/no-unused-vars': 'off',
      // Allow explicit any
      '@typescript-eslint/no-explicit-any': 'off',
      // Allow non-null assertions
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow empty functions
      '@typescript-eslint/no-empty-function': 'off',
      // Allow inferrable types
      '@typescript-eslint/no-inferrable-types': 'off',
      // Allow unused imports
      'no-unused-vars': 'off',
      // Allow console statements
      'no-console': 'off',
      // Allow empty blocks
      'no-empty': 'off',
    },
  },
])
