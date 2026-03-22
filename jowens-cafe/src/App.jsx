import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, ClipboardList, BarChart3, Settings, 
  Coffee, Plus, Minus, Users, Tag, X, Search, Edit, Trash2, 
  TrendingUp, Receipt, Bell, Lock, ShieldAlert, Play, Square, Delete
} from 'lucide-react';
import './App.css';

// --- REUSABLE PIN PAD COMPONENT ---
const PinPad = ({ expectedPin, onSuccess, onCancel, title, hint }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePress = (num) => {
    if (pin.length < 4) setPin(p => p + num);
  };

  const handleBackspace = () => {
    setPin(p => p.slice(0, -1));
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === expectedPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, expectedPin, onSuccess]);

  return (
    <div className="pin-overlay">
      <div className={`pin-card card ${error ? 'shake' : ''}`}>
        <div className="pin-header">
          <Lock size={32} className="text-primary mb-2" />
          <h2>{title}</h2>
          <p className="text-muted text-sm mt-1">Hint: {hint}</p>
        </div>

        <div className="pin-dots">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''} ${error ? 'error' : ''}`}></div>
          ))}
        </div>

        <div className="numpad-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button key={num} className="numpad-btn" onClick={() => handlePress(num.toString())}>{num}</button>
          ))}
          <button className="numpad-btn text-danger" onClick={onCancel}><X size={24} /></button>
          <button className="numpad-btn" onClick={() => handlePress('0')}>0</button>
          <button className="numpad-btn text-warning" onClick={handleBackspace}><Delete size={24} /></button>
        </div>
      </div>
    </div>
  );
};


// --- 1. POS PAGE ---
const PosPage = () => {
  const [customerCount, setCustomerCount] = useState(1);
  const [cart, setCart] = useState([]);
  const [discountType, setDiscountType] = useState('none');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productNote, setProductNote] = useState('');

  const handleCustomerCountInput = (e) => {
    const val = e.target.value;
    if (val === '') { setCustomerCount(''); return; }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0) setCustomerCount(num);
  };

  const handleCustomerCountBlur = () => {
    if (customerCount === '' || customerCount < 1) setCustomerCount(1);
  };

  const incrementCount = () => setCustomerCount(prev => (prev || 0) + 1);
  const decrementCount = () => setCustomerCount(prev => (prev > 1 ? prev - 1 : 1));

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

  const openProductModal = (item) => {
    setSelectedProduct(item);
    setProductNote(''); 
  };

  const handleConfirmAdd = () => {
    if (!selectedProduct) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === selectedProduct.id && i.note === productNote.trim());
      if (existing) {
        return prev.map(i => i.cartItemId === existing.cartItemId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...selectedProduct, qty: 1, note: productNote.trim(), cartItemId: Date.now() + Math.random() }];
    });
    setSelectedProduct(null);
    setProductNote('');
  };

  const removeFromCart = (cartItemId) => setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  const updateQty = (cartItemId, delta) => setCart(prev => prev.map(i => {
    if (i.cartItemId === cartItemId) {
      const newQty = i.qty + delta;
      return newQty > 0 ? { ...i, qty: newQty } : i;
    }
    return i;
  }));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discountMultiplier = 0;
  if (discountType === 'pwd' || discountType === 'senior') discountMultiplier = 0.20; 
  if (discountType === 'promo') discountMultiplier = 0.10; 

  const discountAmount = subtotal * discountMultiplier;
  const total = subtotal - discountAmount;

  return (
    <div className="pos-container">
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add {selectedProduct.name}</h3>
              <button className="btn-icon-small" onClick={() => setSelectedProduct(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <label className="font-semibold text-muted" style={{fontSize: '0.9rem'}}>Special Instructions (Optional)</label>
              <textarea placeholder="e.g., Less sugar, oat milk, extra hot..." value={productNote} onChange={(e) => setProductNote(e.target.value)} className="note-input" autoFocus />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmAdd}>Add to Order - ₱{selectedProduct.price.toFixed(2)}</button>
            </div>
          </div>
        </div>
      )}

      <div className="pos-header">
        <h3>Menu Categories</h3>
        <div className="customer-count-widget">
          <Users size={18} className="text-muted" />
          <span className="font-semibold">Customers:</span>
          <div className="count-controls">
            <button className="btn-icon-small" onClick={decrementCount}><Minus size={14} /></button>
            <input type="number" className="count-input" value={customerCount} onChange={handleCustomerCountInput} onBlur={handleCustomerCountBlur} min="1"/>
            <button className="btn-icon-small" onClick={incrementCount}><Plus size={14} /></button>
          </div>
        </div>
      </div>

      <div className="pos-grid">
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

          <div className="order-summary">
            <div className="discount-selector">
              <label><Tag size={14}/> Discount</label>
              <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                <option value="none">None</option>
                <option value="pwd">PWD (20%)</option>
                <option value="senior">Senior Citizen (20%)</option>
                <option value="promo">Promo (10%)</option>
              </select>
            </div>
            <div className="summary-row"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
            {discountAmount > 0 && (
              <div className="summary-row discount"><span>Discount</span><span>- ₱{discountAmount.toFixed(2)}</span></div>
            )}
            <div className="summary-row total"><span>Total</span><span>₱{total.toFixed(2)}</span></div>
            <button className="btn btn-primary w-full mt-4" disabled={cart.length === 0}>Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- 2. INVENTORY PAGE ---
const InventoryPage = () => {
  const inventoryData = [
    { id: 'INV-001', name: 'Arabica Beans (Dark Roast)', category: 'Ingredients', stock: 12, unit: 'kg', status: 'Good' },
    { id: 'INV-002', name: 'Whole Milk', category: 'Dairy', stock: 4, unit: 'Liters', status: 'Low Stock' },
    { id: 'INV-003', name: 'Oat Milk', category: 'Dairy', stock: 15, unit: 'Liters', status: 'Good' },
  ];

  return (
    <div className="page-content">
      <div className="action-bar">
        <div className="search-bar">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Search inventory..." />
        </div>
        <button className="btn btn-primary"><Plus size={18}/> Add New Item</button>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>In Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventoryData.map(item => (
              <tr key={item.id}>
                <td className="text-muted">{item.id}</td>
                <td className="font-semibold">{item.name}</td>
                <td>{item.category}</td>
                <td>{item.stock} {item.unit}</td>
                <td>
                  <span className={`badge ${item.status === 'Low Stock' ? 'badge-danger' : 'badge-success'}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon-small"><Edit size={14}/></button>
                    <button className="btn-icon-small danger"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- 3. ORDERS PAGE ---
const OrdersPage = () => {
  const ordersData = [
    { id: '#10045', time: '10:42 AM', items: '2x Latte, 1x Croissant', customer: 'Walk-in', total: 450.00, status: 'Completed' },
    { id: '#10047', time: '11:15 AM', items: '3x Iced Matcha, 1x Cold Brew', customer: 'Table 4', total: 840.00, status: 'Preparing' },
  ];

  return (
    <div className="page-content">
      <div className="action-bar">
        <div className="search-bar">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Search order ID..." />
        </div>
        <button className="btn btn-secondary">Filter by Date</button>
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Time</th>
              <th>Items</th>
              <th>Type</th>
              <th>Total</th>
              <th>Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {ordersData.map(order => (
              <tr key={order.id}>
                <td className="font-semibold text-primary">{order.id}</td>
                <td className="text-muted">{order.time}</td>
                <td>{order.items}</td>
                <td>{order.customer}</td>
                <td className="font-semibold">₱{order.total.toFixed(2)}</td>
                <td>
                  <span className={`badge ${ order.status === 'Completed' ? 'badge-success' : 'badge-warning' }`}>
                    {order.status}
                  </span>
                </td>
                <td><button className="btn-icon-small"><Receipt size={14}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- 4. REPORTS PAGE ---
const ReportsPage = () => {
  return (
    <div className="page-content reports-page">
      <div className="metrics-grid">
        <div className="card metric-card">
          <div className="metric-icon bg-success-light"><TrendingUp size={24} className="text-success" /></div>
          <div className="metric-info">
            <p className="text-muted">Total Sales (Today)</p>
            <h3>₱ 12,450.00</h3>
            <span className="trend positive">+14% vs yesterday</span>
          </div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon bg-primary-light"><ClipboardList size={24} className="text-primary" /></div>
          <div className="metric-info">
            <p className="text-muted">Total Orders</p>
            <h3>48</h3>
            <span className="trend positive">+5% vs yesterday</span>
          </div>
        </div>
        <div className="card metric-card">
          <div className="metric-icon bg-warning-light"><Users size={24} className="text-warning" /></div>
          <div className="metric-info">
            <p className="text-muted">Avg Customer Spend</p>
            <h3>₱ 259.00</h3>
            <span className="trend neutral">0% vs yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- 5. SETTINGS PAGE (Updated with Role & Session Logic) ---
const SettingsPage = ({ userRole, setUserRole, isSessionActive, setIsSessionActive }) => {
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleAdminSuccess = () => {
    setUserRole('admin');
    setShowAdminModal(false);
  };

  const toggleSession = () => {
    setIsSessionActive(!isSessionActive);
  };

  return (
    <div className="page-content settings-page">
      
      {/* Admin PIN Modal */}
      {showAdminModal && (
        <PinPad 
          expectedPin="0000" 
          onSuccess={handleAdminSuccess} 
          onCancel={() => setShowAdminModal(false)}
          title="Enter Admin PIN"
          hint="0000"
        />
      )}

      <div className="settings-grid">
        
        {/* Profile & Access Control */}
        <div className="card">
          <h3 className="mb-4 border-b pb-2">Access Control</h3>
          
          <div className="role-status mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={20} className={userRole === 'admin' ? "text-primary" : "text-muted"} />
              <span className="font-semibold text-lg">Current Role: {userRole === 'admin' ? 'Administrator' : 'Staff'}</span>
            </div>
            <p className="text-muted text-sm mb-4">
              {userRole === 'admin' 
                ? "You have full access to configuration and session tracking." 
                : "Your access is limited to POS and standard operations."}
            </p>
            
            {userRole === 'staff' ? (
              <button className="btn btn-primary" onClick={() => setShowAdminModal(true)}>
                Switch to Admin
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={() => setUserRole('staff')}>
                Switch to Staff
              </button>
            )}
          </div>
        </div>

        {/* Session Tracking (Only for Admin) */}
        {userRole === 'admin' && (
          <div className="card admin-highlight">
            <h3 className="mb-4 border-b pb-2 text-primary">Session Management</h3>
            
            <div className="session-status">
              <div className="status-indicator flex items-center gap-2 mb-4">
                <div className={`status-dot ${isSessionActive ? 'active' : ''}`}></div>
                <span className="font-semibold">
                  Status: {isSessionActive ? 'Session Running' : 'No Active Session'}
                </span>
              </div>
              
              <button 
                className={`btn w-full ${isSessionActive ? 'btn-danger' : 'btn-success'}`}
                onClick={toggleSession}
              >
                {isSessionActive ? (
                  <><Square size={18} /> End Current Session</>
                ) : (
                  <><Play size={18} /> Start New Session</>
                )}
              </button>
              {isSessionActive && <p className="text-sm text-muted mt-2 text-center">Session started for tracking sales and inventory.</p>}
            </div>
          </div>
        )}

        {/* General Settings */}
        <div className="card">
          <h3 className="mb-4 border-b pb-2">General Information</h3>
          <div className="form-group">
            <label>Store Name</label>
            <input type="text" className="form-input" defaultValue="Jowens Cafe" disabled={userRole !== 'admin'} />
          </div>
          <div className="form-group">
            <label>Currency Format</label>
            <select className="form-input" disabled={userRole !== 'admin'}>
              <option>PHP (₱)</option>
              <option>USD ($)</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
};


// --- MAIN APP SHELL ---
function App() {
  // Global States
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [currentPage, setCurrentPage] = useState('pos');
  const [userRole, setUserRole] = useState('staff'); // 'staff' | 'admin'
  const [isSessionActive, setIsSessionActive] = useState(false);

  const menuItems = [
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ClipboardList },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Render App Lock Screen initially
  if (!isAppUnlocked) {
    return (
      <PinPad 
        expectedPin="1234" 
        onSuccess={() => setIsAppUnlocked(true)} 
        onCancel={() => {}} // Does nothing on cancel initially
        title="Unlock Jowens Cafe POS"
        hint="1234"
      />
    );
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'pos': return <PosPage />;
      case 'inventory': return <InventoryPage />;
      case 'orders': return <OrdersPage />;
      case 'reports': return <ReportsPage />;
      case 'settings': 
        return <SettingsPage 
          userRole={userRole} 
          setUserRole={setUserRole} 
          isSessionActive={isSessionActive}
          setIsSessionActive={setIsSessionActive}
        />;
      default: return <PosPage />;
    }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1><Coffee size={24} color="var(--color-accent)" /> Jowens Cafe</h1>
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

      <main className="main-content">
        <header className="top-header">
          <div className="flex items-center gap-4">
            <h2>{menuItems.find(i => i.id === currentPage)?.label}</h2>
            {isSessionActive && (
              <span className="badge badge-success pulse-animation">● Session Active</span>
            )}
          </div>
          
          <div className="header-actions">
            <button className="btn-icon-small"><Bell size={18} /></button>
            <div className="user-profile">
              <div className="avatar">{userRole === 'admin' ? 'A' : 'S'}</div>
              <span style={{textTransform: 'capitalize'}}>{userRole}</span>
            </div>
            {/* Lock App Button */}
            <button className="btn-icon-small" onClick={() => setIsAppUnlocked(false)} title="Lock App">
              <Lock size={18} className="text-muted" />
            </button>
          </div>
        </header>

        <div className="page-container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;