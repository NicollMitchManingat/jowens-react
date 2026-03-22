import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, ClipboardList, BarChart3, Settings, 
  Coffee, Plus, Minus, Users, Tag, X, Search, Edit, Trash2, 
  TrendingUp, Receipt, Bell, Lock, ShieldAlert, Play, Square, 
  Delete, RefreshCcw, CakeSlice, Menu, Sparkles
} from 'lucide-react';
import './App.css';

// --- REUSABLE PIN PAD COMPONENT ---
const PinPad = ({ expectedPin, onSuccess, onCancel, title, hint }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handlePress = (num) => {
    if (pin.length < 4) setPin(p => p + num);
  };

  const handleBackspace = () => setPin(p => p.slice(0, -1));

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
const PosPage = ({ userRole }) => {
  const [customerCount, setCustomerCount] = useState(0);
  const [cart, setCart] = useState([]);
  const [discountType, setDiscountType] = useState('none');
  
  // Modals State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productNote, setProductNote] = useState('');
  const [selectedSize, setSelectedSize] = useState('Small');
  
  // Admin Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);

  // Category State
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Drinks', 'Meals', 'Pastries', 'Desserts'];

  const menuItems = [
    { id: 1, name: 'Espresso', price: 150, category: 'Drinks' },
    { id: 2, name: 'Latte', price: 180, category: 'Drinks' },
    { id: 3, name: 'Americano', price: 160, category: 'Drinks' },
    { id: 4, name: 'Iced Matcha', price: 220, category: 'Drinks' },
    { id: 5, name: 'Club Sandwich', price: 250, category: 'Meals' },
    { id: 6, name: 'Bacon & Egg Toast', price: 190, category: 'Meals' },
    { id: 7, name: 'Croissant', price: 120, category: 'Pastries' },
    { id: 8, name: 'Blueberry Muffin', price: 140, category: 'Pastries' },
    { id: 9, name: 'Chocolate Cake', category: 'Desserts', hasSizes: true, sizes: { Small: 150, Big: 850 }, price: 150 },
    { id: 10, name: 'Strawberry Cheesecake', category: 'Desserts', hasSizes: true, sizes: { Small: 180, Big: 950 }, price: 180 },
  ];

  const filteredMenu = activeCategory === 'All' ? menuItems : menuItems.filter(item => item.category === activeCategory);

  const handleCustomerCountInput = (e) => {
    const val = e.target.value;
    if (val === '') { setCustomerCount(''); return; }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 0) setCustomerCount(num);
  };
  const handleCustomerCountBlur = () => { if (customerCount === '') setCustomerCount(0); };
  const incrementCount = () => setCustomerCount(prev => (prev || 0) + 1);
  const decrementCount = () => setCustomerCount(prev => (prev > 0 ? prev - 1 : 0));

  const resetOrder = () => { setCart([]); setCustomerCount(0); setDiscountType('none'); };

  const openProductModal = (item) => {
    setSelectedProduct(item);
    setProductNote(''); 
    setSelectedSize(item.hasSizes ? 'Small' : null);
  };

  const handleConfirmAdd = () => {
    if (!selectedProduct) return;
    const finalPrice = selectedProduct.hasSizes ? selectedProduct.sizes[selectedSize] : selectedProduct.price;
    const displayName = selectedProduct.hasSizes ? `${selectedProduct.name} (${selectedSize})` : selectedProduct.name;
    
    setCart(prev => {
      const existing = prev.find(i => i.baseId === selectedProduct.id && i.note === productNote.trim() && i.size === selectedSize);
      if (existing) {
        return prev.map(i => i.cartItemId === existing.cartItemId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { baseId: selectedProduct.id, name: displayName, price: finalPrice, qty: 1, note: productNote.trim(), size: selectedSize, cartItemId: Date.now() + Math.random() }];
    });

    if (customerCount === 0) setCustomerCount(1);
    setSelectedProduct(null); setProductNote('');
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
    <div className="pos-container relative">
      
      {/* FLOATING ADD PRODUCT BUTTON (ADMIN ONLY) */}
      {userRole === 'admin' && (
        <button 
          className="fab-add-product" 
          onClick={() => setShowAddProductModal(true)}
          title="Add Custom Product"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* 1. Add Custom Product Modal (Admin Only) */}
      {showAddProductModal && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Custom Product</h3>
              <button className="btn-icon-small" onClick={() => setShowAddProductModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" className="form-input" placeholder="e.g., Matcha Croissant" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-input">
                  {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Price (₱)</label>
                <input type="number" className="form-input" placeholder="0.00" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAddProductModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setShowAddProductModal(false)}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Product Options Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add {selectedProduct.name}</h3>
              <button className="btn-icon-small" onClick={() => setSelectedProduct(null)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              {selectedProduct.hasSizes && (
                <div className="size-selector-container mb-4">
                  <label className="font-semibold text-muted text-sm mb-2 block">Select Size:</label>
                  <div className="size-options">
                    <label className={`size-card ${selectedSize === 'Small' ? 'active' : ''}`}>
                      <input type="radio" name="size" value="Small" checked={selectedSize === 'Small'} onChange={() => setSelectedSize('Small')} className="hidden-radio" />
                      <span>Small Slice</span><strong>₱{selectedProduct.sizes.Small.toFixed(2)}</strong>
                    </label>
                    <label className={`size-card ${selectedSize === 'Big' ? 'active' : ''}`}>
                      <input type="radio" name="size" value="Big" checked={selectedSize === 'Big'} onChange={() => setSelectedSize('Big')} className="hidden-radio" />
                      <span>Whole Cake (Big)</span><strong>₱{selectedProduct.sizes.Big.toFixed(2)}</strong>
                    </label>
                  </div>
                </div>
              )}
              <label className="font-semibold text-muted text-sm block mb-1">Special Instructions (Optional)</label>
              <textarea placeholder="e.g., Less sugar, warm..." value={productNote} onChange={(e) => setProductNote(e.target.value)} className="note-input" autoFocus={!selectedProduct.hasSizes} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedProduct(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmAdd}>
                Add to Order - ₱{(selectedProduct.hasSizes ? selectedProduct.sizes[selectedSize] : selectedProduct.price).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS Top Header & Customer Count */}
      <div className="pos-header">
        <div className="categories-wrapper">
          <div className="flex justify-between items-center pr-4">
            <h3>Menu Categories</h3>
          </div>
          <div className="category-filters mt-2">
            {categories.map(cat => (
              <button key={cat} className={`btn-filter ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>
        <div className="customer-count-widget">
          <Users size={18} className="text-muted" />
          <span className="font-semibold">Customers:</span>
          <div className="count-controls">
            <button className="btn-icon-small" onClick={decrementCount}><Minus size={14} /></button>
            <input type="number" className="count-input" value={customerCount} onChange={handleCustomerCountInput} onBlur={handleCustomerCountBlur} min="0"/>
            <button className="btn-icon-small" onClick={incrementCount}><Plus size={14} /></button>
          </div>
        </div>
      </div>

      {/* POS Grid */}
      <div className="pos-grid mt-2">
        <div className="menu-section">
          <div className="product-grid">
            {filteredMenu.map(item => (
              <div key={item.id} className="product-card" onClick={() => openProductModal(item)}>
                {item.category === 'Desserts' ? <CakeSlice size={32} className="product-icon" /> : <Coffee size={32} className="product-icon" />}
                <h4>{item.name}</h4>
                <p className="price">₱{item.price.toFixed(2)}{item.hasSizes && '+'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="order-section card">
          <div className="order-header">
            <h3>Current Order</h3>
            <div className="flex gap-2 items-center">
              <span className="badge">{cart.reduce((sum, i) => sum + i.qty, 0)} Items</span>
              <button className="btn-icon-small text-danger" onClick={resetOrder} title="Clear Order"><RefreshCcw size={16}/></button>
            </div>
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
            {discountAmount > 0 && <div className="summary-row discount"><span>Discount</span><span>- ₱{discountAmount.toFixed(2)}</span></div>}
            
            <div className="summary-row total items-center">
              <span>Total</span>
              <span>₱{total.toFixed(2)}</span>
            </div>
            
            <button className="btn btn-primary w-full mt-4" disabled={cart.length === 0 && customerCount === 0} onClick={resetOrder}>
              Checkout & Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- 2. INVENTORY PAGE ---
const InventoryPage = ({ userRole }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inventoryData = [
    { id: 'INV-001', name: 'Arabica Beans (Dark Roast)', category: 'Ingredients', stock: 12, unit: 'kg', status: 'Good' },
    { id: 'INV-002', name: 'Whole Milk', category: 'Dairy', stock: 4, unit: 'Liters', status: 'Low Stock' },
    { id: 'INV-003', name: 'Oat Milk', category: 'Dairy', stock: 15, unit: 'Liters', status: 'Good' },
    { id: 'INV-004', name: 'Vanilla Syrup', category: 'Syrups', stock: 2, unit: 'Bottles', status: 'Low Stock' },
    { id: 'INV-005', name: 'Paper Cups (12oz)', category: 'Packaging', stock: 450, unit: 'Pcs', status: 'Good' },
  ];
  const filteredData = inventoryData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="action-bar">
        <div className="search-bar">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Search inventory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {userRole === 'admin' && (
          <button className="btn btn-primary"><Plus size={18}/> Add Item</button>
        )}
      </div>
      <div className="card table-card table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>In Stock</th>
              <th>Status</th>
              {userRole === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map(item => (
              <tr key={item.id}>
                <td className="text-muted">{item.id}</td><td className="font-semibold">{item.name}</td><td>{item.category}</td><td>{item.stock} {item.unit}</td>
                <td><span className={`badge ${item.status === 'Low Stock' ? 'badge-danger' : 'badge-success'}`}>{item.status}</span></td>
                {userRole === 'admin' && (
                  <td>
                    <div className="action-buttons">
                      <button className="btn-icon-small"><Edit size={14}/></button>
                      <button className="btn-icon-small danger"><Trash2 size={14}/></button>
                    </div>
                  </td>
                )}
              </tr>
            )) : (<tr><td colSpan={userRole === 'admin' ? "6" : "5"} className="text-center py-4 text-muted">No items match your search.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- 3. ORDERS PAGE ---
const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const ordersData = [
    { id: '#10045', time: '10:42 AM', items: '2x Latte, 1x Croissant', customer: 'Walk-in', total: 450.00, status: 'Completed' },
    { id: '#10046', time: '10:55 AM', items: '1x Americano', customer: 'Walk-in', total: 160.00, status: 'Completed' },
    { id: '#10047', time: '11:15 AM', items: '3x Iced Matcha, 1x Cold Brew', customer: 'Table 4', total: 840.00, status: 'Preparing' },
    { id: '#10048', time: '11:30 AM', items: '1x Chocolate Cake (Big)', customer: 'Takeout', total: 850.00, status: 'Preparing' },
  ];
  const filteredData = ordersData.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) || order.items.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-content">
      <div className="action-bar">
        <div className="search-bar">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Search order ID or items..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button className="btn btn-secondary">Filter by Date</button>
      </div>
      <div className="card table-card table-responsive">
        <table className="data-table">
          <thead>
            <tr><th>Order ID</th><th>Time</th><th>Items</th><th>Type</th><th>Total</th><th>Status</th><th>Receipt</th></tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? filteredData.map(order => (
              <tr key={order.id}>
                <td className="font-semibold text-primary">{order.id}</td><td className="text-muted">{order.time}</td><td>{order.items}</td><td>{order.customer}</td><td className="font-semibold">₱{order.total.toFixed(2)}</td>
                <td><span className={`badge ${ order.status === 'Completed' ? 'badge-success' : 'badge-warning' }`}>{order.status}</span></td>
                <td><button className="btn-icon-small"><Receipt size={14}/></button></td>
              </tr>
            )) : (<tr><td colSpan="7" className="text-center py-4 text-muted">No orders match your search.</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};


// --- 4. REPORTS PAGE ---
const ReportsPage = () => {
  const weeklyRevenue = [
    { day: 'Mon', val: 3200 }, { day: 'Tue', val: 4100 }, { day: 'Wed', val: 3800 },
    { day: 'Thu', val: 5600 }, { day: 'Fri', val: 8200 }, { day: 'Sat', val: 12450 }, { day: 'Sun', val: 9100 }
  ];
  const maxRev = Math.max(...weeklyRevenue.map(d => d.val));

  const hourlyTraffic = [
    { time: '8AM', count: 12 }, { time: '10AM', count: 28 }, { time: '12PM', count: 45 },
    { time: '2PM', count: 32 }, { time: '4PM', count: 50 }, { time: '6PM', count: 18 }
  ];
  const maxTraffic = Math.max(...hourlyTraffic.map(d => d.count));

  const forecastData = [
    { time: '08:00', val: 25 }, { time: '10:00', val: 90 }, { time: '12:00', val: 145 },
    { time: '14:00', val: 65 }, { time: '16:00', val: 95 }, { time: '18:00', val: 110 },
    { time: '20:00', val: 45 }
  ];
  const maxForecast = 160;

  const createLinePath = (data, max, width, height) => {
    const stepX = width / (data.length - 1);
    return data.map((d, i) => {
      const x = i * stepX;
      const y = height - ((d.count / max) * height);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const createForecastPath = (data, max, width, height) => {
    const stepX = width / (data.length - 1);
    return data.map((d, i) => {
      const x = i * stepX;
      const y = height - ((d.val / max) * height);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  const createAreaPath = (data, max, width, height) => {
    const line = createForecastPath(data, max, width, height);
    return `${line} L ${width} ${height} L 0 ${height} Z`;
  };

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
            <p className="text-muted">Total Customers Today</p>
            <h3>124</h3>
            <span className="trend positive">+12% vs yesterday</span>
          </div>
        </div>
      </div>

      <div className="charts-grid mt-4">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-semibold text-lg">Weekly Revenue</h4>
            <span className="badge badge-success">This Week</span>
          </div>
          <div className="svg-chart-container" style={{ height: '220px', width: '100%', position: 'relative' }}>
            <svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="none">
              <line x1="0" y1="50" x2="400" y2="50" stroke="#e5e0d8" strokeDasharray="4" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="#e5e0d8" strokeDasharray="4" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="#e5e0d8" strokeDasharray="4" />
              {weeklyRevenue.map((d, i) => {
                const barWidth = 30;
                const spacing = 400 / weeklyRevenue.length;
                const x = (i * spacing) + (spacing / 2) - (barWidth / 2);
                const barHeight = (d.val / maxRev) * 160;
                const y = 170 - barHeight;
                return (
                  <g key={d.day} className="chart-group">
                    <rect x={x} y={y} width={barWidth} height={barHeight} fill={d.day === 'Sat' ? "var(--color-accent)" : "var(--color-secondary)"} rx="4" className="chart-bar" />
                    <text x={x + 15} y="190" fontSize="12" fill="var(--text-muted)" textAnchor="middle">{d.day}</text>
                    <text x={x + 15} y={y - 10} fontSize="12" fill="var(--text-main)" fontWeight="bold" textAnchor="middle" className="chart-tooltip opacity-0 transition-opacity">₱{d.val}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-semibold text-lg">Live Customer Traffic</h4>
            <span className="badge badge-neutral">Today</span>
          </div>
          <div className="svg-chart-container" style={{ height: '220px', width: '100%', padding: '0 10px' }}>
             <svg viewBox="0 0 400 200" width="100%" height="100%" style={{overflow: 'visible'}} preserveAspectRatio="none">
              <path d={createLinePath(hourlyTraffic, maxTraffic, 400, 160)} fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              {hourlyTraffic.map((d, i) => {
                const stepX = 400 / (hourlyTraffic.length - 1);
                const x = i * stepX;
                const y = 160 - ((d.count / maxTraffic) * 160);
                return (
                  <g key={d.time} className="chart-group">
                    <circle cx={x} cy={y} r="6" fill="var(--bg-surface)" stroke="var(--color-primary)" strokeWidth="3" className="chart-point" />
                    <text x={x} y="190" fontSize="12" fill="var(--text-muted)" textAnchor="middle">{d.time}</text>
                    <text x={x} y={y - 15} fontSize="12" fill="var(--text-main)" fontWeight="bold" textAnchor="middle" className="chart-tooltip opacity-0 transition-opacity">{d.count} Pax</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-semibold text-lg flex items-center gap-2"><Sparkles size={18} className="text-warning"/> AI Demand Forecast</h4>
            <p className="text-muted text-sm mt-1">Predicted incoming customer rush to help staff prepare for peak demand.</p>
          </div>
          <span className="badge badge-warning">Proactive Analysis</span>
        </div>
        <div className="svg-chart-container" style={{ height: '260px', width: '100%', padding: '0 10px' }}>
          <svg viewBox="0 0 800 200" width="100%" height="100%" style={{overflow: 'visible'}} preserveAspectRatio="none">
            <defs>
              <linearGradient id="forecastGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.0"/>
              </linearGradient>
            </defs>
            <line x1="0" y1="50" x2="800" y2="50" stroke="#e5e0d8" strokeDasharray="4" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="#e5e0d8" strokeDasharray="4" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="#e5e0d8" strokeDasharray="4" />
            
            <path d={createAreaPath(forecastData, maxForecast, 800, 160)} fill="url(#forecastGradient)" />
            <path d={createForecastPath(forecastData, maxForecast, 800, 160)} fill="none" stroke="var(--color-accent)" strokeWidth="4" strokeDasharray="8 6" strokeLinecap="round" strokeLinejoin="round" />
            
            {forecastData.map((d, i) => {
              const stepX = 800 / (forecastData.length - 1);
              const x = i * stepX;
              const y = 160 - ((d.val / maxForecast) * 160);
              const isRush = d.val >= 90;
              return (
                <g key={d.time} className="chart-group">
                  <circle cx={x} cy={y} r="6" fill={isRush ? "var(--color-danger)" : "var(--bg-surface)"} stroke={isRush ? "var(--color-danger)" : "var(--color-accent)"} strokeWidth="3" className="chart-point" />
                  <text x={x} y="190" fontSize="12" fill="var(--text-muted)" textAnchor="middle">{d.time}</text>
                  <text x={x} y={y - 15} fontSize="12" fill={isRush ? "var(--color-danger)" : "var(--text-main)"} fontWeight="bold" textAnchor="middle" className="chart-tooltip opacity-0 transition-opacity">
                    {isRush ? `RUSH: ${d.val} Expected` : `${d.val} Expected`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};


// --- 5. SETTINGS PAGE ---
const SettingsPage = ({ userRole, setUserRole, isSessionActive, setIsSessionActive }) => {
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleAdminSuccess = () => { setUserRole('admin'); setShowAdminModal(false); };

  return (
    <div className="page-content settings-page">
      {showAdminModal && <PinPad expectedPin="0000" onSuccess={handleAdminSuccess} onCancel={() => setShowAdminModal(false)} title="Enter Admin PIN" hint="0000" />}
      <div className="settings-grid">
        <div className="card">
          <h3 className="mb-4 border-b pb-2">Access Control</h3>
          <div className="role-status mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert size={20} className={userRole === 'admin' ? "text-primary" : "text-muted"} />
              <span className="font-semibold text-lg">Current Role: {userRole === 'admin' ? 'Administrator' : 'Staff'}</span>
            </div>
            <p className="text-muted text-sm mb-4">
              {userRole === 'admin' ? "You have full access to configuration and reporting." : "Your access is limited to POS operations."}
            </p>
            {userRole === 'staff' ? (
              <button className="btn btn-primary" onClick={() => setShowAdminModal(true)}>Switch to Admin</button>
            ) : (
              <button className="btn btn-secondary" onClick={() => setUserRole('staff')}>Switch to Staff</button>
            )}
          </div>
        </div>

        {userRole === 'admin' && (
          <div className="card admin-highlight">
            <h3 className="mb-4 border-b pb-2 text-primary">Session Management</h3>
            <div className="session-status">
              <div className="status-indicator flex items-center gap-2 mb-4">
                <div className={`status-dot ${isSessionActive ? 'active' : ''}`}></div>
                <span className="font-semibold">Status: {isSessionActive ? 'Session Running' : 'No Active Session'}</span>
              </div>
              <button className={`btn w-full ${isSessionActive ? 'btn-danger' : 'btn-success'}`} onClick={() => setIsSessionActive(!isSessionActive)}>
                {isSessionActive ? <><Square size={18} /> End Session</> : <><Play size={18} /> Start Session</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// --- MAIN APP SHELL ---
function App() {
  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [currentPage, setCurrentPage] = useState('pos');
  const [userRole, setUserRole] = useState('staff'); 
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (currentPage === 'reports' && userRole !== 'admin') {
      setCurrentPage('pos');
    }
  }, [userRole, currentPage]);

  const menuItems = [
    { id: 'pos', label: 'Point of Sale', icon: ShoppingCart, adminOnly: false },
    { id: 'inventory', label: 'Inventory', icon: Package, adminOnly: false },
    { id: 'orders', label: 'Orders', icon: ClipboardList, adminOnly: false },
    { id: 'reports', label: 'Reports', icon: BarChart3, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings, adminOnly: false },
  ];

  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || userRole === 'admin');

  if (!isAppUnlocked) {
    return <PinPad expectedPin="1234" onSuccess={() => setIsAppUnlocked(true)} onCancel={() => {}} title="Unlock Jowens Cafe POS" hint="1234" />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'pos': return <PosPage userRole={userRole} />;
      case 'inventory': return <InventoryPage userRole={userRole} />;
      case 'orders': return <OrdersPage />;
      case 'reports': return userRole === 'admin' ? <ReportsPage /> : <PosPage userRole={userRole} />;
      case 'settings': return <SettingsPage userRole={userRole} setUserRole={setUserRole} isSessionActive={isSessionActive} setIsSessionActive={setIsSessionActive} />;
      default: return <PosPage userRole={userRole}/>;
    }
  };

  const handleNavClick = (id) => {
    setCurrentPage(id);
    setIsMobileOpen(false); 
  };

  const handleMenuToggle = () => {
    if (window.innerWidth <= 768) {
      setIsMobileOpen(true);
    } else {
      setIsDesktopCollapsed(!isDesktopCollapsed);
    }
  };

  return (
    <div className="app-container">
      
      <div 
        className={`sidebar-overlay ${isMobileOpen ? 'show' : ''}`} 
        onClick={() => setIsMobileOpen(false)}
      ></div>

      <aside className={`sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isDesktopCollapsed ? 'desktop-collapsed' : ''}`}>
        <div className="sidebar-header flex justify-between items-center">
          <h1><Coffee size={24} color="var(--color-accent)" /> <span className="logo-text">Jowens Cafe</span></h1>
          <button className="mobile-close-btn" onClick={() => setIsMobileOpen(false)}>
            <X size={20} className="text-light" />
          </button>
        </div>
        <nav className="sidebar-nav">
          {visibleMenuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`} onClick={() => handleNavClick(item.id)}>
                <IconComponent size={20} /><span>{item.label}</span>
              </div>
            );
          })}
        </nav>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="flex items-center gap-4">
            <button className="menu-toggle btn-icon-small" onClick={handleMenuToggle}>
              <Menu size={20} />
            </button>
            
            <h2>{visibleMenuItems.find(i => i.id === currentPage)?.label || 'Jowens Cafe'}</h2>
            {isSessionActive && <span className="badge badge-success pulse-animation session-badge">● Session Active</span>}
          </div>
          
          <div className="header-actions">
            <div className="user-profile">
              <div className="avatar">{userRole === 'admin' ? 'A' : 'S'}</div>
              <span className="user-role-text" style={{textTransform: 'capitalize'}}>{userRole}</span>
            </div>
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