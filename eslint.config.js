import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    // Tool renderers are data modules: each exports a `renderer` descriptor
    // next to the Summary/Detail components it references, so the fast-refresh
    // "only export components" rule does not apply.
    files: ['src/components/chat/messages/tools/renderers/**/*.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
