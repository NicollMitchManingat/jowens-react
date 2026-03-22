import React, { useState } from 'react';
import { 
  ShoppingCart, Package, ClipboardList, 
  BarChart3, Settings, Coffee, Plus, 
  Minus, Users, Tag, X
} from 'lucide-react';
import './App.css';

// --- POS Page Component ---
const PosPage = () => {
  // Customer Count State
  const [customerCount, setCustomerCount] = useState(1);
  
  // Cart & Discount State
  const [cart, setCart] = useState([]);
  const [discountType, setDiscountType] = useState('none'); // none, pwd, senior, promo

  // Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productNote, setProductNote] = useState('');

  // Customer Count Handlers
  const handleCustomerCountInput = (e) => {
    const val = e.target.value;
    if (val === '') {
      setCustomerCount('');
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0) {
      setCustomerCount(num);
    }
  };

  const handleCustomerCountBlur = () => {
    if (customerCount === '' || customerCount < 1) {
      setCustomerCount(1);
    }
  };

  const incrementCount = () => setCustomerCount(prev => (prev || 0) + 1);
  const decrementCount = () => setCustomerCount(prev => (prev > 1 ? prev - 1 : 1));

  // Placeholder Menu Data (Prices in PHP)
  const menuItems = [
    { id: 1, name: 'Espresso', price: 150 },
    { id: 2, name: 'Latte', price: 180 },
    { id: 3, name: 'Cappuccino', price: 170 },
    { id: 4, name: 'Americano', price: 160 },
    { id: 5, name: 'Mocha', price: 190 },
    { id: 6, name: 'Caramel Macchiato', price: 200 },
    { id: 7, name: 'Iced Matcha Latte', price: 220 },
    { id: 8, name: 'Cold Brew', price: 180 },
  ];

  // Cart Handlers
  const openProductModal = (item) => {
    setSelectedProduct(item);
    setProductNote(''); // Reset note when opening
  };

  const handleConfirmAdd = () => {
    if (!selectedProduct) return;

    setCart(prev => {
      // Check if exact same product WITH exact same note already exists
      const existing = prev.find(i => i.id === selectedProduct.id && i.note === productNote.trim());
      
      if (existing) {
        return prev.map(i => 
          i.cartItemId === existing.cartItemId 
            ? { ...i, qty: i.qty + 1 } 
            : i
        );
      }
      
      // If new, add it with a unique cartItemId so we can delete/update specific note variations
      return [...prev, { 
        ...selectedProduct, 
        qty: 1, 
        note: productNote.trim(), 
        cartItemId: Date.now() + Math.random() 
      }];
    });

    // Close Modal
    setSelectedProduct(null);
    setProductNote('');
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const updateQty = (cartItemId, delta) => {
    setCart(prev => prev.map(i => {
      if (i.cartItemId === cartItemId) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : i;
      }
      return i;
    }));
  };

  // Financial Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let discountMultiplier = 0;
  if (discountType === 'pwd' || discountType === 'senior') discountMultiplier = 0.20; // 20% discount
  if (discountType === 'promo') discountMultiplier = 0.10; // 10% promo discount

  const discountAmount = subtotal * discountMultiplier;
  const total = subtotal - discountAmount;

  return (
    <div className="pos-container">
      {/* Product Selection Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add {selectedProduct.name}</h3>
              <button className="btn-icon-small" onClick={() => setSelectedProduct(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              <label className="font-semibold text-muted" style={{fontSize: '0.9rem'}}>
                Special Instructions (Optional)
              </label>
              <textarea 
                placeholder="e.g., Less sugar, oat milk, extra hot..."
                value={productNote}
                onChange={(e) => setProductNote(e.target.value)}
                className="note-input"
                autoFocus
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmAdd}>
                Add to Order - ₱{selectedProduct.price.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Top Action Bar */}
      <div className="pos-header">
        <h3>Menu Categories</h3>
        
        {/* Customer Count Widget */}
        <div className="customer-count-widget">
          <Users size={18} className="text-muted" />
          <span className="font-semibold">Customers:</span>
          <div className="count-controls">
            <button className="btn-icon-small" onClick={decrementCount}><Minus size={14} /></button>
            <input 
              type="number" 
              className="count-input" 
              value={customerCount} 
              onChange={handleCustomerCountInput}
              onBlur={handleCustomerCountBlur}
              min="1"
            />
            <button className="btn-icon-small" onClick={incrementCount}><Plus size={14} /></button>
          </div>
        </div>
      </div>

      <div className="pos-grid">
        {/* Menu Items Grid */}
        <div className="menu-section">
          <div className="product-grid">
            {menuItems.map(item => (
              <div key={item.id} className="product-card" onClick={() => openProductModal(item)}>
                <Coffee size={32} className="product-icon" />
                <h4>{item.name}</h4>
                <p className="price">₱{item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Cart Sidebar */}
        <div className="order-section card">
          <div className="order-header">
            <h3>Current Order</h3>
            <span className="badge">{cart.reduce((sum, i) => sum + i.qty, 0)} Items</span>
          </div>

          <div className="order-items">
            {cart.length === 0 ? (
              <div className="empty-cart">No items added yet.</div>
            ) : (
              cart.map(item => (
                <div key={item.cartItemId} className="cart-item">
                  <div className="item-info">
                    <h5>{item.name}</h5>
                    {item.note && <p className="item-note">"{item.note}"</p>}
                    <p className="item-price">₱{item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-controls">
                    <button className="btn-icon-small" onClick={() => updateQty(item.cartItemId, -1)}><Minus size={12}/></button>
                    <span className="qty">{item.qty}</span>
                    <button className="btn-icon-small" onClick={() => updateQty(item.cartItemId, 1)}><Plus size={12}/></button>
                    <button className="btn-icon-small danger" onClick={() => removeFromCart(item.cartItemId)}><X size={12}/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Summary & Discounts */}
          <div className="order-summary">
            <div className="discount-selector">
              <label><Tag size={14}/> Discount Type</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                <option value="none">No Discount</option>
                <option value="pwd">PWD (20%)</option>
                <option value="senior">Senior Citizen (20%)</option>
                <option value="promo">Jowens Promo (10%)</option>
              </select>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₱{subtotal.toFixed(2)}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Discount ({discountType === 'promo' ? '10%' : '20%'})</span>
                <span>- ₱{discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="summary-row total">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            
            <button className="btn btn-primary w-full mt-4" disabled={cart.length === 0}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Placeholder Component for other tabs ---
const PlaceholderPage = ({ title, icon: Icon, description }) => (
  <div className="placeholder-page">
    <div className="card placeholder-card">
      <div className="placeholder-icon-wrapper">
        <Icon size={48} color="var(--color-accent)" />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="btn btn-primary mt-4">Feature Coming Soon</button>
    </div>
  </div>
);

// --- Main App Dashboard Shell ---
function App() {
  const [currentPage, setCurrentPage] = useState('pos');

  // Navigation Items
  const menuItems = [
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Routing Logic
  const renderContent = () => {
    switch (currentPage) {
      case 'pos': 
        return <PosPage />;
      case 'inventory': 
        return <PlaceholderPage title="Inventory Management" icon={Package} description="Manage stock levels, ingredient supplies, and automated reorder alerts for Jowens Cafe." />;
      case 'orders': 
        return <PlaceholderPage title="Order History" icon={ClipboardList} description="View past transactions, reprint receipts, and track live order statuses." />;
      case 'reports': 
        return <PlaceholderPage title="Financial Reports" icon={BarChart3} description="Analyze daily sales, peak hours, and track the overall performance of the cafe." />;
      case 'settings': 
        return <PlaceholderPage title="System Settings" icon={Settings} description="Configure tax rates, manage staff accounts, and customize your POS receipt formats." />;
      default: 
        return <PosPage />;
    }
  };

  return (
    <div className="app-container">
      
      {/* Fixed Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>
            <Coffee size={24} color="var(--color-accent)" /> 
            Jowens Cafe
          </h1>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div 
                key={item.id}
                className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(item.id)}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main Content (Scrollable) */}
      <main className="main-content">
        <header className="top-header">
          <h2>{menuItems.find(i => i.id === currentPage)?.label}</h2>
        </header>

        <div className="page-container">
          {renderContent()}
        </div>
      </main>

    </div>
  );
}

export default App;