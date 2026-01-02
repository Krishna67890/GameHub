import gsap from 'gsap';

// Define animation types
interface AnimationConfig {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
}

interface HoverConfig {
  hover: gsap.TweenVars;
  leave: gsap.TweenVars;
}

// PS5 Animation Presets
export const PS5_ANIMATIONS: Record<string, AnimationConfig | HoverConfig> = {
  // Entrance animations
  slideInFromBottom: {
    from: { y: 100, opacity: 0 },
    to: { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
  },
  
  slideInFromLeft: {
    from: { x: -100, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
  },
  
  slideInFromRight: {
    from: { x: 100, opacity: 0 },
    to: { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
  },
  
  fadeInScale: {
    from: { scale: 0.8, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
  },
  
  // Hover effects
  buttonHover: {
    hover: { scale: 1.05, duration: 0.3, ease: "power2.out" },
    leave: { scale: 1, duration: 0.3, ease: "power2.out" }
  },
  
  cardHover: {
    hover: { y: -8, scale: 1.03, duration: 0.4, ease: "power2.out" },
    leave: { y: 0, scale: 1, duration: 0.4, ease: "power2.out" }
  },
  
  // Game element animations
  gameElementPop: {
    from: { scale: 0, opacity: 0 },
    to: { scale: 1, opacity: 1, duration: 0.5, ease: "elastic.out(1, 0.5)" }
  },
  
  gameSuccess: {
    from: { scale: 1 },
    to: { scale: 1.2, duration: 0.3, yoyo: true, repeat: 1, ease: "power2.inOut" }
  },
  
  gameError: {
    from: { x: 0 },
    to: { x: -10, duration: 0.1, yoyo: true, repeat: 3, ease: "power2.inOut" }
  }
};

// Utility functions for PS5 animations
export class PS5Animator {
  static animateEntrance(element: HTMLElement | null, animationType: string = 'fadeInScale') {
    if (!element) return;
    
    const animation = PS5_ANIMATIONS[animationType] as AnimationConfig;
    if (animation && 'from' in animation) {
      gsap.fromTo(element, animation.from, animation.to);
    }
  }
  
  static animateStagger(elements: (HTMLElement | null)[], animationType: string = 'slideInFromBottom', stagger = 0.1) {
    const animation = PS5_ANIMATIONS[animationType] as AnimationConfig;
    if (animation && 'from' in animation) {
      gsap.fromTo(elements.filter(Boolean), animation.from, {
        ...animation.to,
        stagger
      });
    }
  }
  
  static addHoverEffect(element: HTMLElement | null, effectType: 'button' | 'card' = 'button') {
    if (!element) return;
    
    const effectKey = effectType === 'button' ? 'buttonHover' : 'cardHover';
    const effect = PS5_ANIMATIONS[effectKey] as HoverConfig;
    
    if (effect && 'hover' in effect) {
      element.addEventListener('mouseenter', () => {
        gsap.to(element, effect.hover);
      });
      
      element.addEventListener('mouseleave', () => {
        gsap.to(element, effect.leave);
      });
    }
  }
  
  static animateGameElement(element: HTMLElement | null, animation: 'pop' | 'success' | 'error') {
    if (!element) return;
    
    let animConfig: AnimationConfig;
    switch (animation) {
      case 'pop':
        animConfig = PS5_ANIMATIONS.gameElementPop as AnimationConfig;
        break;
      case 'success':
        animConfig = PS5_ANIMATIONS.gameSuccess as AnimationConfig;
        break;
      case 'error':
        animConfig = PS5_ANIMATIONS.gameError as AnimationConfig;
        break;
      default:
        return;
    }
    
    if ('from' in animConfig) {
      gsap.fromTo(element, animConfig.from, animConfig.to);
    }
  }
  
  static createBorderGlow(element: HTMLElement | null) {
    if (!element) return;
    
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(element, {
      boxShadow: "0 0 30px rgba(0, 247, 255, 0.8)",
      duration: 1.5,
      ease: "power1.inOut"
    });
  }
  
  static animateScoreChange(element: HTMLElement | null, newScore: number) {
    if (!element) return;
    
    gsap.fromTo(element, 
      { scale: 1.5, color: "#00f7ff" },
      { 
        scale: 1, 
        color: "#ffffff", 
        duration: 0.5, 
        ease: "elastic.out(1, 0.3)" 
      }
    );
  }
  
  static createNotification(message: string, type: 'success' | 'warning' | 'error' = 'success') {
    const notification = document.createElement('div');
    notification.className = 'ps5-notification';
    notification.textContent = message;
    
    // Add type-specific styling
    switch (type) {
      case 'success':
        notification.style.background = 'linear-gradient(135deg, #00c853, #007e33)';
        break;
      case 'warning':
        notification.style.background = 'linear-gradient(135deg, #ffab00, #cc8800)';
        break;
      case 'error':
        notification.style.background = 'linear-gradient(135deg, #ff5252, #d32f2f)';
        break;
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    gsap.fromTo(notification,
      { x: 400, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
    );
    
    // Auto remove after delay
    setTimeout(() => {
      gsap.to(notification, {
        x: 400,
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }
      });
    }, 3000);
  }
  
  static animateMenuOpen(menuElement: HTMLElement | null) {
    if (!menuElement) return;
    
    gsap.fromTo(menuElement,
      { x: "-100%", opacity: 0 },
      { x: "0%", opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }
  
  static animateMenuClose(menuElement: HTMLElement | null) {
    if (!menuElement) return;
    
    gsap.to(menuElement, {
      x: "-100%",
      opacity: 0,
      duration: 0.4,
      ease: "power2.in"
    });
  }
}

// Predefined timeline animations
export const PS5_TIMELINES = {
  gameStart: () => {
    const tl = gsap.timeline();
    tl.fromTo(".ps5-header", 
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" }
    )
    .fromTo(".ps5-game-grid", 
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.6"
    );
    return tl;
  },
  
  gameOver: () => {
    const tl = gsap.timeline();
    tl.to(".ps5-game-board", 
      { scale: 0.9, opacity: 0.7, duration: 0.3, yoyo: true, repeat: 1 }
    )
    .to(".ps5-notification", 
      { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1 },
      "-=0.3"
    );
    return tl;
  }
};

export default PS5Animator;