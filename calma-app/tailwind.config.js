export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { navy: '#002E6B', navyDeep: '#001B44' },
        sand: { DEFAULT: '#F5F8FB', deep: '#EAF0F7' },
        ink: { DEFAULT: '#0A2540', soft: '#55677E' },
        auxilio: { 1: '#FF7A59', 2: '#FFB199', bg: '#FFF4EF' },
        aire: { 1: '#002E6B', 2: '#0A4B94', glow: '#EAF7FB', accent: '#6FE3D6' },
        faro: { 1: '#F2A93B', 2: '#FFD37A', bg: '#FFF8EA' },
        senales: { 1: '#3FA796', bg: '#EAF7F3' },
        acomp: { 1: '#2FBF9F', 2: '#4E8FE0', bg: '#F1FBF7' },
      },
      fontFamily: {
        display: ['"Comba Test"', 'Poppins', 'sans-serif'],
        sans: ['Poppins', 'sans-serif'],
      },
      borderRadius: { lg: '28px', xl: '36px' },
    },
  },
}
