import React, { useState } from 'react';
import { 
  ShoppingCart, Package, ClipboardList, 
  BarChart3, Settings, Coffee, Plus, 
  Minus, Search, Trash2, Save, X 
} from 'lucide-react';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('pos');
  const [customerCount, setCustomerCount] = useState(0);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [note, setNote] = useState('');

  // Data Models
  const products = [
    { id: 1, name: 'Espresso', price: 100, cat: 'coffee' },
    { id: 2, name: 'Americano', price: 120, cat: 'coffee' },
    { id: 3, name: 'Latte', price: 145, cat: 'coffee' },
  ];

  const inventory = [
    { id: 1, name: 'Espresso Beans', cat: 'Coffee', stock: '12.0 kg', status: 'Optimal' },
    { id: 2, name: 'Whole Milk', cat: 'Dairy', stock: '3 Units', status: 'Low Stock' },
  ];

  // Logic Functions
  const openCustomizer = (product) => {
    setSelectedProduct(product);
    setNote('');
  };

  const addToOrder = () => {
    setCart([...cart, { ...selectedProduct, note, instanceId: Date.now() }]);
    setSelectedProduct(null);
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.instanceId !== id));
  const subtotal = cart.reduce((sum, i) => sum + i.price, 0);

  // --- PAGE RENDERERS ---

  const renderPOS = () => (
    <div className="main-layout">
      {/* Menu Section (70% Width) */}
      <section className="menu-section">
        <header className="page-header">
          <div className="header-text">
            <h1 className="readable-title">Menu Selection</h1>
            <p className="readable-subtitle">Welcome back, Jowen</p>
          </div>
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search menu..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <div className="product-grid">
          {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
            <div key={p.id} className="product-card" onClick={() => openCustomizer(p)}>
              <h3 className="card-title">{p.name}</h3>
              <p className="card-price">₱{p.price.toFixed(2)}</p>
              <Plus className="add-btn-icon" size={16} />
            </div>
          ))}
        </div>
      </section>

      {/* Order Panel (30% Width) */}
      <aside className="order-panel">
        <div className="occupancy-section">
          <h4 className="panel-label">Live Occupancy</h4>
          <div className="occupancy-controls">
            <button onClick={() => setCustomerCount(Math.max(0, customerCount - 1))}><Minus size={16} /></button>
            <span className="count-display">{customerCount}</span>
            <button onClick={() => setCustomerCount(customerCount + 1)}><Plus size={16} /></button>
          </div>
        </div>

        <div className="cart-content">
          <h3 className="panel-title"><Coffee size={18} /> Current Order ({cart.length})</h3>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Select an item to start</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.instanceId} className="cart-item">
                <div className="item-info">
                  <span className="item-name">{item.name}</span>
                  {item.note && <span className="item-note">{item.note}</span>}
                </div>
                <div className="item-actions">
                  <span className="item-price">₱{item.price}</span>
                  <Trash2 size={14} className="remove-icon" onClick={() => removeFromCart(item.instanceId)} />
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="cart-summary">
          <div className="summary-row"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>₱{subtotal.toFixed(2)}</span></div>
          <button className="complete-btn">COMPLETE PAYMENT</button>
        </footer>
      </aside>

      {/* Customization Modal */}
      {selectedProduct && (
        <div className="modal-overlay">
          <div className="customizer-modal">
            <h2 className="readable-title">{selectedProduct.name}</h2>
            <div className="modal-body">
              <label className="readable-subtitle">Special Instructions (e.g. Less Sugar, No Ice)</label>
              <textarea 
                placeholder="Add notes here..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setSelectedProduct(null)}>Cancel</button>
              <button className="add-order-btn" onClick={addToOrder}>Add to Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInventory = () => (
    <div className="full-page">
      <header className="centered-header">
        <h1 className="readable-title">Inventory Management</h1>
        <p className="readable-subtitle">Monitor and update cafe supplies</p>
      </header>
      <div className="table-wrapper">
        <table className="pos-table">
          <thead>
            <tr><th>Item Name</th><th>Category</th><th>Current Stock</th><th>Status</th></tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td><td>{item.cat}</td><td>{item.stock}</td>
                <td><span className={`status-pill ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="full-page">
      <header className="centered-header">
        <h1 className="readable-title">Transaction History</h1>
        <p className="readable-subtitle">View and audit past cafe orders</p>
      </header>
      <div className="table-wrapper">
        <table className="pos-table">
          <thead>
            <tr><th>Order ID</th><th>Customer Notes</th><th>Total Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr><td>#JC-9921</td><td>Less Sugar</td><td>₱ 145.00</td><td><span className="status-pill optimal">Paid</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="full-page">
      <header className="centered-header">
        <h1 className="readable-title">Performance Analytics</h1>
        <p className="readable-subtitle">Visualizing sales data and peak hours</p>
      </header>
      <div className="stats-container">
        <div className="report-card"><h3>₱ 12,450.00</h3><p>Daily Revenue</p></div>
        <div className="report-card"><h3>48</h3><p>Total Orders</p></div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="full-page">
      <header className="centered-header">
        <h1 className="readable-title">System Settings</h1>
        <p className="readable-subtitle">Manage cafe profile and preferences</p>
      </header>
      <div className="settings-form">
        <div className="field-group"><label>Cafe Name</label><input type="text" defaultValue="Jowen's Cafe" /></div>
        <div className="field-group"><label>Currency Symbol</label><input type="text" defaultValue="₱" /></div>
        <button className="save-btn"><Save size={18} /> SAVE CONFIGURATION</button>
      </div>
    </div>
  );

  return (
    <div className="pos-container">
      <nav className="sidebar">
        <div className="logo-box">JC</div>
        <div className="nav-group">
          <div className={`nav-icon ${currentPage === 'pos' ? 'active' : ''}`} onClick={() => setCurrentPage('pos')}><ShoppingCart /></div>
          <div className={`nav-icon ${currentPage === 'inventory' ? 'active' : ''}`} onClick={() => setCurrentPage('inventory')}><Package /></div>
          <div className={`nav-icon ${currentPage === 'history' ? 'active' : ''}`} onClick={() => setCurrentPage('history')}><ClipboardList /></div>
          <div className={`nav-icon ${currentPage === 'reports' ? 'active' : ''}`} onClick={() => setCurrentPage('reports')}><BarChart3 /></div>
        </div>
        <div className={`nav-icon settings-bottom ${currentPage === 'settings' ? 'active' : ''}`} onClick={() => setCurrentPage('settings')}><Settings /></div>
      </nav>
      
      <div className="content-wrapper">
        {currentPage === 'pos' ? renderPOS() : 
         currentPage === 'inventory' ? renderInventory() :
         currentPage === 'history' ? renderHistory() :
         currentPage === 'reports' ? renderReports() : renderSettings()}
      </div>
    </div>
  );
};

export default App;