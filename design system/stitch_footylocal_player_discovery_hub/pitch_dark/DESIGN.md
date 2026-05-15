---
name: Pitch Dark
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bccbb9'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#869585'
  outline-variant: '#3d4a3d'
  surface-tint: '#4ae176'
  primary: '#4be277'
  on-primary: '#003915'
  primary-container: '#22c55e'
  on-primary-container: '#004b1e'
  inverse-primary: '#006e2f'
  secondary: '#ffca45'
  on-secondary: '#3f2e00'
  secondary-container: '#e4ae00'
  on-secondary-container: '#5b4400'
  tertiary: '#7cd0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#2eb7f2'
  on-tertiary-container: '#00455f'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6bff8f'
  primary-fixed-dim: '#4ae176'
  on-primary-fixed: '#002109'
  on-primary-fixed-variant: '#005321'
  secondary-fixed: '#ffdf9a'
  secondary-fixed-dim: '#f7be1d'
  on-secondary-fixed: '#251a00'
  on-secondary-fixed-variant: '#5a4300'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 1.25rem
  gutter: 1rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style
The design system is engineered for **FootyLocal**, targeting a community of passionate football players and fans. The brand personality is **energetic, professional, and atmospheric**, capturing the feeling of a night match under stadium floodlights. 

The visual style leverages a **Corporate Modern** foundation infused with **Glassmorphism**. It utilizes deep, immersive backgrounds to create a focused environment where high-contrast "Electric" accents guide the user toward action. The goal is to evoke the excitement of the pitch while maintaining the utility of a high-performance discovery tool.

## Colors
This design system utilizes a high-contrast dark palette to simulate a premium sports broadcast aesthetic.

- **Primary (Electric Green):** Used for primary CTAs, success states, and "live" indicators. It represents the pitch and vital energy.
- **Secondary (Gold):** Reserved for highlights, achievements, and premium features.
- **Background (Deep Blue/Slate):** The foundation is `#0F172A`, providing a deep canvas that reduces eye strain.
- **Surface (Slate):** Secondary surfaces and card backgrounds use `#1E293B`, often with varying levels of opacity to create glass effects.

## Typography
The system uses **Inter** for all primary communication to ensure maximum legibility and a modern, systematic feel. Tight letter-spacing on larger headlines mimics sports editorial layouts. **JetBrains Mono** is introduced sparingly for labels, scores, and technical data (like match times or coordinates) to provide a "technical/precision" edge that contrasts with the fluid UI.

## Layout & Spacing
The layout follows a **fluid grid** model optimized for mobile-first interaction, heavily influenced by Ionic Framework's structural standards. 

- **Grid:** A 4-column grid for mobile, expanding to 12 columns for desktop.
- **Margins:** A standard 20px (`1.25rem`) horizontal margin for all main content containers.
- **Rhythm:** An 8pt spacing system governs all vertical rhythms to maintain mathematical harmony.
- **Reflow:** On larger screens, content cards transition from full-width stacks to multi-column masonry layouts to maximize discovery real estate.

## Elevation & Depth
Depth is created through **Glassmorphism** and **Tonal Layering** rather than traditional shadows.

1.  **Base Layer:** `#0F172A` (Pure Background).
2.  **Content Layer:** `#1E293B` with 80% opacity and a 12px backdrop-blur.
3.  **Overlay Layer:** `#334155` with 90% opacity for modals and tooltips.
4.  **Accents:** Thin, 1px semi-transparent white borders (inner-glow) are used on cards to define edges against the dark background, simulating the crisp lines of a football pitch.

## Shapes
The shape language is defined by **Rounded-2XL** curves. 

- **Cards & Modals:** Use a `1.5rem` (24px) corner radius to feel approachable and modern.
- **Buttons:** Follow a "Semi-Pill" style with `1rem` (16px) radius to maintain a professional yet energetic stance.
- **Inputs:** Match the button radius for visual consistency across the "Action" layer.

## Components
Consistent styling across the Ionic-based component library:

- **Buttons:** Primary buttons use a solid Electric Green (`#22C55E`) with dark Slate text for maximum contrast. Secondary buttons use a "Ghost" style with a 1px Gold border.
- **Cards:** Semi-transparent backgrounds with backdrop-blur. Use a 1px top-border (opacity 10% white) to create a subtle "lighting" effect from above.
- **Chips/Badges:** Use JetBrains Mono for text. High-saturation backgrounds (Green for "Open Spot", Red for "Full") with low-opacity fills.
- **Inputs:** Deep Slate backgrounds with a focus state that glows slightly in Electric Green.
- **Lists:** Inset lists with rounded corners, separated by subtle borders. Items should have a clear active state using a primary-tinted background.
- **Football Specifics:** Pitch-map components should use a dark-green gradient background with crisp white linework.