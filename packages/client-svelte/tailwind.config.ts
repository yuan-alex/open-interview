import tailwindcss from 'tailwindcss';
import daisyui from 'daisyui';

const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ['light'],
    logs: false
  }
} satisfies tailwindcss.Config;

export default config;
