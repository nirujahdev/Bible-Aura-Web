import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				md: '2rem',
				lg: '2rem',
				xl: '2rem',
				'2xl': '2rem'
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'montserrat': ['Montserrat', 'sans-serif'],
				'sans': ['Montserrat', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					50: 'hsl(var(--primary-50))',
					100: 'hsl(var(--primary-100))',
					200: 'hsl(var(--primary-200))',
					300: 'hsl(var(--primary-300))',
					400: 'hsl(var(--primary-400))',
					500: 'hsl(var(--primary-500))',
					600: 'hsl(var(--primary-600))',
					700: 'hsl(var(--primary-700))',
					800: 'hsl(var(--primary-800))',
					900: 'hsl(var(--primary-900))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				spiritual: {
					DEFAULT: 'hsl(var(--spiritual))',
					foreground: 'hsl(var(--spiritual-foreground))',
					light: 'hsl(var(--spiritual-light))',
					dark: 'hsl(var(--spiritual-dark))',
				},
				divine: {
					DEFAULT: 'hsl(var(--divine))',
					foreground: 'hsl(var(--divine-foreground))',
					light: 'hsl(var(--divine-light))',
					dark: 'hsl(var(--divine-dark))',
				},
				aura: {
					orange: 'hsl(var(--aura-orange))',
					'orange-light': 'hsl(var(--aura-orange-light))',
					'orange-dark': 'hsl(var(--aura-orange-dark))',
					white: 'hsl(var(--aura-white))',
					black: 'hsl(var(--aura-black))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'divine-gradient': 'var(--gradient-divine)',
				'spiritual-gradient': 'var(--gradient-spiritual)',
				'aura-gradient': 'var(--gradient-aura)',
				'aura-hover': 'var(--gradient-aura-hover)',
				'sacred-radial': 'var(--gradient-sacred-radial)',
				'celestial-glow': 'var(--gradient-celestial-glow)',
			},
			boxShadow: {
				'spiritual': 'var(--shadow-spiritual)',
				'divine': 'var(--shadow-divine)',
				'aura-glow': 'var(--shadow-aura-glow)',
				'sacred-glow': 'var(--shadow-sacred-glow)',
				'celestial': 'var(--shadow-celestial)',
				'holy-light': 'var(--shadow-holy-light)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				// Basic animations
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				// Spiritual animations
				'divine-pulse': {
					'0%, 100%': { 
						transform: 'scale(1)', 
						boxShadow: '0 0 20px rgba(248, 87, 0, 0.3)' 
					},
					'50%': { 
						transform: 'scale(1.05)', 
						boxShadow: '0 0 40px rgba(248, 87, 0, 0.6)' 
					}
				},
				'sacred-glow': {
					'0%, 100%': { 
						filter: 'drop-shadow(0 0 10px rgba(248, 87, 0, 0.4))',
						opacity: '0.9'
					},
					'50%': { 
						filter: 'drop-shadow(0 0 25px rgba(248, 87, 0, 0.8))',
						opacity: '1'
					}
				},
				'celestial-float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'33%': { transform: 'translateY(-10px) rotate(1deg)' },
					'66%': { transform: 'translateY(5px) rotate(-1deg)' }
				},
				'holy-shimmer': {
					'0%': { transform: 'translateX(-100%) skewX(-15deg)' },
					'100%': { transform: 'translateX(100%) skewX(-15deg)' }
				},
				'divine-breathe': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.02)' }
				},
				'sacred-spin': {
					'0%': { transform: 'rotate(0deg) scale(1)' },
					'50%': { transform: 'rotate(180deg) scale(1.1)' },
					'100%': { transform: 'rotate(360deg) scale(1)' }
				},
				'aura-ripple': {
					'0%': { transform: 'scale(0)', opacity: '1' },
					'100%': { transform: 'scale(4)', opacity: '0' }
				},
				'spiritual-wave': {
					'0%, 100%': { transform: 'translateX(0)' },
					'50%': { transform: 'translateX(10px)' }
				},
				'divine-typing': {
					'0%': { width: '0' },
					'100%': { width: '100%' }
				},
				'celestial-bounce': {
					'0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
					'40%': { transform: 'translateY(-20px)' },
					'60%': { transform: 'translateY(-10px)' }
				},
				'holy-slide-in': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'sacred-fade-in': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'divine-scale-in': {
					'0%': { transform: 'scale(0)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'aura-rotate': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'spiritual-gradient': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'holy-text-glow': {
					'0%, 100%': { textShadow: '0 0 5px rgba(248, 87, 0, 0.5)' },
					'50%': { textShadow: '0 0 20px rgba(248, 87, 0, 0.8), 0 0 30px rgba(248, 87, 0, 0.6)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'divine-pulse': 'divine-pulse 3s ease-in-out infinite',
				'sacred-glow': 'sacred-glow 4s ease-in-out infinite',
				'celestial-float': 'celestial-float 6s ease-in-out infinite',
				'holy-shimmer': 'holy-shimmer 2s ease-in-out infinite',
				'divine-breathe': 'divine-breathe 4s ease-in-out infinite',
				'sacred-spin': 'sacred-spin 8s linear infinite',
				'aura-ripple': 'aura-ripple 0.6s ease-out',
				'spiritual-wave': 'spiritual-wave 2s ease-in-out infinite',
				'divine-typing': 'divine-typing 3s steps(40, end)',
				'celestial-bounce': 'celestial-bounce 2s infinite',
				'holy-slide-in': 'holy-slide-in 0.8s ease-out',
				'sacred-fade-in': 'sacred-fade-in 0.6s ease-out',
				'divine-scale-in': 'divine-scale-in 0.5s ease-out',
				'aura-rotate': 'aura-rotate 10s linear infinite',
				'spiritual-gradient': 'spiritual-gradient 3s ease infinite',
				'holy-text-glow': 'holy-text-glow 2s ease-in-out infinite',
				// Fast animations
				'divine-pulse-fast': 'divine-pulse 1.5s ease-in-out infinite',
				'sacred-glow-fast': 'sacred-glow 2s ease-in-out infinite',
				'celestial-float-fast': 'celestial-float 3s ease-in-out infinite',
			},
			transitionProperty: {
				'divine': 'transform, box-shadow, filter, opacity',
				'sacred': 'all',
			},
			transitionDuration: {
				'divine': '300ms',
				'sacred': '500ms',
				'celestial': '700ms',
			},
			transitionTimingFunction: {
				'divine': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'sacred': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
				'celestial': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
