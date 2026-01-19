/**
 * RawLifeMD Theme JavaScript
 * Handles interactive components and functionality
 */

// Theme utilities
const RawLifeMD = {
  // Initialize theme
  init() {
    this.initMegaMenu();
    this.initMobileMenu();
    this.initIngredients();
    this.initSmoothScroll();
    this.initAnimations();
  },

  // Mega menu functionality
  initMegaMenu() {
    const megaMenus = document.querySelectorAll('.mega-menu');
    
    megaMenus.forEach(menu => {
      const summary = menu.querySelector('summary');
      const content = menu.querySelector('.mega-menu__content');
      
      if (!summary || !content) return;
      
      // Handle hover events
      menu.addEventListener('mouseenter', () => {
        menu.setAttribute('open', '');
      });
      
      menu.addEventListener('mouseleave', () => {
        menu.removeAttribute('open');
      });
      
      // Handle keyboard navigation
      summary.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (menu.hasAttribute('open')) {
            menu.removeAttribute('open');
          } else {
            menu.setAttribute('open', '');
          }
        }
      });
    });
  },

  // Mobile menu functionality
  initMobileMenu() {
    const menuDrawer = document.querySelector('#Details-menu-drawer-container');
    const menuToggle = document.querySelector('.header__icon--menu');
    
    if (!menuDrawer || !menuToggle) return;
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (menuDrawer.hasAttribute('open') && 
          !menuDrawer.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        menuDrawer.removeAttribute('open');
      }
    });
    
    // Handle submenu toggles
    const submenuToggles = document.querySelectorAll('.menu-drawer__menu details');
    submenuToggles.forEach(toggle => {
      const summary = toggle.querySelector('summary');
      const closeButton = toggle.querySelector('.menu-drawer__close-button');
      
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          toggle.removeAttribute('open');
        });
      }
    });
  },

  // Ingredients page functionality
  initIngredients() {
    const ingredientCategories = document.querySelectorAll('.ingredient-category');
    const ingredientItems = document.querySelectorAll('.ingredient-item');
    
    // Category toggles
    ingredientCategories.forEach(category => {
      const header = category.querySelector('.ingredient-category__header');
      const toggle = category.querySelector('.ingredient-category__toggle');
      
      if (!header || !toggle) return;
      
      header.addEventListener('click', () => {
        const isOpen = category.hasAttribute('open');
        
        if (isOpen) {
          category.removeAttribute('open');
        } else {
          category.setAttribute('open', '');
        }
        
        // Animate toggle icon
        toggle.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
      });
    });
    
    // Individual ingredient toggles
    ingredientItems.forEach(item => {
      const header = item.querySelector('.ingredient-item__header');
      const description = item.querySelector('.ingredient-item__description');
      
      if (!header || !description) return;
      
      header.addEventListener('click', () => {
        const isOpen = item.hasAttribute('open');
        
        if (isOpen) {
          item.removeAttribute('open');
          description.style.display = 'none';
        } else {
          item.setAttribute('open', '');
          description.style.display = 'block';
        }
      });
    });
  },

  // Smooth scrolling for anchor links
  initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (!target) return;
        
        e.preventDefault();
        
        const headerHeight = document.querySelector('.header-wrapper')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  },

  // Intersection Observer for animations
  initAnimations() {
    const animatedElements = document.querySelectorAll('.card, .ingredient-category, .hero__content');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in-up');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
      observer.observe(el);
    });
  },

  // Utility functions
  utils: {
    // Debounce function
    debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle function
    throttle(func, limit) {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // Format price
    formatPrice(cents, currency = 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(cents / 100);
    },

    // Show notification
    showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.className = `notification notification--${type}`;
      notification.textContent = message;
      
      // Add styles
      Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        backgroundColor: type === 'success' ? '#10b981' : 
                        type === 'error' ? '#ef4444' : 
                        type === 'warning' ? '#f59e0b' : '#3b82f6'
      });
      
      document.body.appendChild(notification);
      
      // Animate in
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
      }, 100);
      
      // Remove after 3 seconds
      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 3000);
    }
  }
};

// Cart functionality
const Cart = {
  // Add item to cart
  async addItem(variantId, quantity = 1) {
    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: variantId,
          quantity: quantity
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      const item = await response.json();
      this.updateCartCount();
      RawLifeMD.utils.showNotification('Item added to cart!', 'success');
      
      return item;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      RawLifeMD.utils.showNotification('Failed to add item to cart', 'error');
      throw error;
    }
  },

  // Update cart count in header
  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const cartBubble = document.querySelector('.cart-count-bubble');
      const cartIcon = document.querySelector('#cart-icon-bubble');
      
      if (cart.item_count > 0) {
        if (cartBubble) {
          cartBubble.querySelector('span[aria-hidden="true"]').textContent = cart.item_count;
        } else if (cartIcon) {
          const bubble = document.createElement('div');
          bubble.className = 'cart-count-bubble';
          bubble.innerHTML = `<span aria-hidden="true">${cart.item_count}</span>`;
          cartIcon.appendChild(bubble);
        }
      } else if (cartBubble) {
        cartBubble.remove();
      }
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }
};

// Bundle builder functionality
const BundleBuilder = {
  selectedProducts: [],
  
  init() {
    this.bindEvents();
    this.updateSummary();
  },
  
  bindEvents() {
    const productCards = document.querySelectorAll('.bundle-product-card');
    const quantityInputs = document.querySelectorAll('.quantity-input');
    
    productCards.forEach(card => {
      const checkbox = card.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          this.toggleProduct(e.target.dataset.productId, e.target.checked);
        });
      }
    });
    
    quantityInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.updateQuantity(e.target.dataset.productId, parseInt(e.target.value));
      });
    });
  },
  
  toggleProduct(productId, selected) {
    if (selected) {
      this.selectedProducts.push({
        id: productId,
        quantity: 1
      });
    } else {
      this.selectedProducts = this.selectedProducts.filter(p => p.id !== productId);
    }
    this.updateSummary();
  },
  
  updateQuantity(productId, quantity) {
    const product = this.selectedProducts.find(p => p.id === productId);
    if (product) {
      product.quantity = quantity;
      this.updateSummary();
    }
  },
  
  updateSummary() {
    const summaryElement = document.querySelector('.bundle-summary');
    if (!summaryElement) return;
    
    const totalItems = this.selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
    const totalPrice = this.calculateTotal();
    
    summaryElement.querySelector('.total-items').textContent = totalItems;
    summaryElement.querySelector('.total-price').textContent = RawLifeMD.utils.formatPrice(totalPrice);
    
    // Update savings
    const savings = this.calculateSavings();
    if (savings > 0) {
      summaryElement.querySelector('.savings').textContent = RawLifeMD.utils.formatPrice(savings);
      summaryElement.querySelector('.savings-container').style.display = 'block';
    } else {
      summaryElement.querySelector('.savings-container').style.display = 'none';
    }
  },
  
  calculateTotal() {
    // This would be implemented based on your product pricing logic
    return this.selectedProducts.reduce((sum, product) => {
      // Get product price from data attributes or API
      const price = parseInt(document.querySelector(`[data-product-id="${product.id}"]`)?.dataset.price || 0);
      return sum + (price * product.quantity);
    }, 0);
  },
  
  calculateSavings() {
    // Calculate bundle savings based on your business logic
    const total = this.calculateTotal();
    const itemCount = this.selectedProducts.reduce((sum, p) => sum + p.quantity, 0);
    
    if (itemCount >= 3) {
      return total * 0.15; // 15% savings for 3+ items
    } else if (itemCount >= 2) {
      return total * 0.10; // 10% savings for 2+ items
    }
    
    return 0;
  }
};

// Form handling
const Forms = {
  // Handle newsletter signup
  handleNewsletterSignup(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = form.querySelector('input[type="email"]').value;
      const submitButton = form.querySelector('button[type="submit"]');
      
      // Show loading state
      submitButton.classList.add('loading');
      submitButton.disabled = true;
      
      try {
        // This would integrate with your email service
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        RawLifeMD.utils.showNotification('Successfully subscribed to newsletter!', 'success');
        form.reset();
      } catch (error) {
        RawLifeMD.utils.showNotification('Failed to subscribe. Please try again.', 'error');
      } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
      }
    });
  },

  // Handle contact form
  handleContactForm(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const submitButton = form.querySelector('button[type="submit"]');
      
      submitButton.classList.add('loading');
      submitButton.disabled = true;
      
      try {
        // This would integrate with your contact form handler
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
        
        RawLifeMD.utils.showNotification('Message sent successfully!', 'success');
        form.reset();
      } catch (error) {
        RawLifeMD.utils.showNotification('Failed to send message. Please try again.', 'error');
      } finally {
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
      }
    });
  }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  RawLifeMD.init();
  
  // Initialize bundle builder if on bundle page
  if (document.querySelector('.bundle-builder')) {
    BundleBuilder.init();
  }
  
  // Initialize forms
  const newsletterForms = document.querySelectorAll('.newsletter-form');
  newsletterForms.forEach(form => Forms.handleNewsletterSignup(form));
  
  const contactForms = document.querySelectorAll('.contact-form');
  contactForms.forEach(form => Forms.handleContactForm(form));
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Update cart count when page becomes visible
    Cart.updateCartCount();
  }
});

// Export for use in other scripts
window.RawLifeMD = RawLifeMD;
window.Cart = Cart;
window.BundleBuilder = BundleBuilder;