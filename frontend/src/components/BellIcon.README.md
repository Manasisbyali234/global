# BellIcon Component

A reusable React bell notification icon component with sound and shake animation.

## Features

- Uses `react-icons` FaBell icon
- Plays custom notification sound on click
- Shake animation when clicked
- Customizable size and color
- Fully reusable across all pages
- Clean, minimal code

## Installation

The component uses `react-icons` which is already installed in your project.

## Setup

1. **Add your sound file**: Place your `alert-tone.mp3` file in `public/sounds/alert-tone.mp3`

2. **Import the component**:
```jsx
import BellIcon from './components/BellIcon';
```

## Usage

### Basic Usage
```jsx
<BellIcon />
```

### With Custom Size and Color
```jsx
<BellIcon size={24} color="#007bff" />
```

### With Custom CSS Class
```jsx
<BellIcon 
  size={20} 
  color="#28a745" 
  className="my-custom-bell"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | number | 20 | Size of the bell icon in pixels |
| `color` | string | '#333' | Color of the bell icon |
| `className` | string | '' | Additional CSS classes |

## Examples

### In a Navbar
```jsx
const Navbar = () => (
  <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
    <div>My App</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <span>Notifications</span>
      <BellIcon size={20} color="#007bff" />
    </div>
  </nav>
);
```

### In a Header Component
```jsx
const Header = () => (
  <header>
    <div className="header-content">
      <div className="notifications">
        <BellIcon size={18} color="#666" />
      </div>
    </div>
  </header>
);
```

### Multiple Bells with Different Styles
```jsx
<div style={{ display: 'flex', gap: '1rem' }}>
  <BellIcon size={16} color="#007bff" />
  <BellIcon size={20} color="#28a745" />
  <BellIcon size={24} color="#dc3545" />
</div>
```

## Animation

The component includes a shake animation that triggers when the bell is clicked:
- Duration: 0.6 seconds
- Rotation: -15° to +15°
- Easing: ease-in-out

## Sound

- Plays `alert-tone.mp3` from `public/sounds/`
- Resets to beginning on each click
- Handles audio play failures gracefully
- No sound controls needed - just click the bell

## Browser Compatibility

- Modern browsers with HTML5 audio support
- Graceful fallback if audio fails to play
- Works on mobile devices (may require user interaction first)

## Styling

The component includes hover effects:
- Scale: 1.1x on hover
- Smooth transition: 0.2s ease

You can override styles using the `className` prop or CSS selectors:
```css
.my-custom-bell {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}
```

## Files Created

- `BellIcon.jsx` - Main component
- `BellIcon.css` - Animations and styles
- `ExampleNavbar.jsx` - Usage example in navbar
- `HeaderWithBell.jsx` - Integration with existing header
- `BellIconDemo.jsx` - Demo page with all examples

## Notes

- Component is fully self-contained
- No external dependencies beyond react-icons
- Optimized for performance with useRef for audio
- Clean up handled automatically
- Works on all pages without additional setup