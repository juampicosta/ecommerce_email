// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest', // Soporta la última versión de ECMAScript
      sourceType: 'module',
      globals: {
        ...globals.node, // Variables globales de Node.js
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Variables sin usar → advertencia
      'no-console': 'off', // Permitir console.log
      quotes: ['error', 'single'], // Comillas simples
    },
    ...js.configs.recommended, // Reglas recomendadas de ESLint
  },
])
