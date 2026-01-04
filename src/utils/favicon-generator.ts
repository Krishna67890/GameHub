// Utility to generate favicon dynamically
// This creates a simple blue square with game controller emoji

export function generateFavicon(): string {
  // Create canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Draw blue background
  if (ctx) {
    ctx.fillStyle = '#0096FF';
    ctx.fillRect(0, 0, 32, 32);
    
    // Draw game controller emoji (simplified representation)
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🎮', 16, 16);
  }
  
  // Convert to data URL
  return canvas.toDataURL('image/png');
}

// Call this function when the app loads to set the favicon
export function setFavicon(): void {
  const link = document.querySelector('link[rel~="icon"]') || document.createElement('link');
  if (link instanceof HTMLLinkElement) {
    link.rel = 'icon';
    link.href = generateFavicon();
    document.head.appendChild(link);
  }
}