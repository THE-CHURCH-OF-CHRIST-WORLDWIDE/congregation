// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Nuxt/Vue conventions use single-word names for pages and layouts
    'vue/multi-word-component-names': 'off',

    // Allow TypeScript `any` in edge cases (repositories, Firebase responses)
    '@typescript-eslint/no-explicit-any': 'warn',

    // Allow unused vars prefixed with _ (conventional for ignored params)
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],

    // TypeScript already enforces optional prop types — explicit undefined defaults are noise
    'vue/require-default-prop': 'off',

    // Consistent Vue component definition order
    'vue/component-api-style': ['error', ['script-setup']],

    // Enforce self-closing tags for void elements and components
    'vue/html-self-closing': [
      'error',
      {
        html: { void: 'always', normal: 'never', component: 'always' },
      },
    ],
  },
})
