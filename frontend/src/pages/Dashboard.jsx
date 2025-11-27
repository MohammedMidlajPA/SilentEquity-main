import React, { useState } from 'react';

import { LayoutDashboard, Users, Bell, Settings, LogOut, CreditCard, FileText, BarChart3, DollarSign, TrendingUp, Search, Filter, Download, Edit, Trash2, Eye, Plus, X, Calendar, Clock, Send } from 'lucide-react';

import '../components/dashboard/styles.css';

// Mock Data

const mockUserData = {

  name: 'Margaret Norton',

  email: 'margaret@example.com',

  phone: '+1 234-567-8900',

  subscription: {

    status: 'active',

    plan: 'Premium',

    expiresDate: '2025-11-16',

    daysRemaining: 31

  },

  notifications: [

    { id: 1, message: 'Your subscription will expire in 31 days', date: '2025-10-16', read: false },

    { id: 2, message: 'New features available in the platform', date: '2025-10-15', read: true },

    { id: 3, message: 'System maintenance scheduled for tonight', date: '2025-10-14', read: true }

  ],

  paymentHistory: [

    { id: 1, date: 'Oct 15, 2025', amount: 999, status: 'Success' },

    { id: 2, date: 'Sep 15, 2025', amount: 999, status: 'Success' },

    { id: 3, date: 'Aug 15, 2025', amount: 999, status: 'Success' }

  ]

};

const mockAdminData = {

  users: [

    { id: 1001, name: 'John Doe', email: 'john@email.com', status: 'Active', subscription: 'Oct 15, 2025', phone: '+1 234-567-8901' },

    { id: 1002, name: 'Jane Smith', email: 'jane@email.com', status: 'Pending', subscription: 'Oct 14, 2025', phone: '+1 234-567-8902' },

    { id: 1003, name: 'Mike Johnson', email: 'mike@email.com', status: 'Active', subscription: 'Nov 20, 2025', phone: '+1 234-567-8903' },

    { id: 1004, name: 'Sarah Williams', email: 'sarah@email.com', status: 'Expired', subscription: 'Sep 30, 2025', phone: '+1 234-567-8904' },

    { id: 1005, name: 'Tom Brown', email: 'tom@email.com', status: 'Active', subscription: 'Dec 05, 2025', phone: '+1 234-567-8905' }

  ],

  analytics: {

    totalUsers: 125,

    activeUsers: 98,

    pendingUsers: 15,

    revenue: 124875

  }

};

// Sidebar Component

const Sidebar = ({ userRole, activeMenu, setActiveMenu }) => {

  const userMenuItems = [

    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },

    { id: 'subscription', icon: CreditCard, label: 'Subscription' },

    { id: 'notifications', icon: Bell, label: 'Notifications' },

    { id: 'payment', icon: FileText, label: 'Payment History' },

    { id: 'settings', icon: Settings, label: 'Settings' }

  ];

  const adminMenuItems = [

    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },

    { id: 'users', icon: Users, label: 'User Management' },

    { id: 'notifications', icon: Bell, label: 'Send Notifications' },

    { id: 'analytics', icon: BarChart3, label: 'Analytics' },

    { id: 'settings', icon: Settings, label: 'Settings' }

  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : userMenuItems;

  return (

    <div className="sidebar">

      <div className="sidebar-header">

        <div className="logo-container">

          <div className="logo-icon">S</div>

          <span className="logo-text">StockPro</span>

        </div>

      </div>

      

      <nav className="sidebar-nav">

        {menuItems.map((item) => (

          <button

            key={item.id}

            onClick={() => setActiveMenu(item.id)}

            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}

          >

            <item.icon className="nav-icon" />

            <span>{item.label}</span>

          </button>

        ))}

      </nav>

      <div className="sidebar-footer">

        <button className="logout-btn">

          <LogOut className="nav-icon" />

          <span>Logout</span>

        </button>

      </div>

    </div>

  );

};

// User Profile Component

const UserProfile = () => {

  const [isEditing, setIsEditing] = useState(false);

  return (

    <div className="card">

      <div className="card-header">

        <h2>Profile Information</h2>

        <button onClick={() => setIsEditing(!isEditing)} className="icon-btn">

          <Edit size={18} />

        </button>

      </div>

      <div className="profile-info">

        <div className="info-group">

          <label>Full Name</label>

          <p>{mockUserData.name}</p>

        </div>

        <div className="info-group">

          <label>Email</label>

          <p>{mockUserData.email}</p>

        </div>

        <div className="info-group">

          <label>Phone Number</label>

          <p>{mockUserData.phone}</p>

        </div>

        <div className="button-group">

          <button className="btn btn-primary">Edit Profile</button>

          <button className="btn btn-secondary">Change Password</button>

        </div>

      </div>

    </div>

  );

};

// Subscription Card Component

const SubscriptionCard = () => {

  const { status, plan, expiresDate, daysRemaining } = mockUserData.subscription;

  

  return (

    <div className="subscription-card">

      <div className="subscription-header">

        <h2>Subscription Status</h2>

        <span className={`status-badge ${status}`}>

          {status === 'active' ? '✓ Active' : '✗ Inactive'}

        </span>

      </div>

      <div className="subscription-body">

        <div className="plan-info">

          <div className="icon-wrapper">

            <CreditCard size={24} />

          </div>

          <div>

            <p className="label">Current Plan</p>

            <p className="plan-name">{plan}</p>

          </div>

        </div>

        <div className="subscription-details">

          <div className="detail-card">

            <div className="detail-header">

              <Calendar size={16} />

              <span>Expires On</span>

            </div>

            <p className="detail-value">{expiresDate}</p>

          </div>

          <div className="detail-card">

            <div className="detail-header">

              <Clock size={16} />

              <span>Days Left</span>

            </div>

            <p className="detail-value">{daysRemaining} days</p>

          </div>

        </div>

        <button className="btn btn-renew">Renew Now</button>

      </div>

    </div>

  );

};

// Notifications List Component

const NotificationsList = () => (

  <div className="card">

    <div className="card-header">

      <h2>Notifications</h2>

      <button className="text-link">Mark all as read</button>

    </div>

    <div className="notifications-list">

      {mockUserData.notifications.map(notif => (

        <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>

          <div className="notification-content">

            <div className={`notification-dot ${!notif.read ? 'active' : ''}`}></div>

            <div>

              <p className="notification-text">{notif.message}</p>

              <p className="notification-date">{notif.date}</p>

            </div>

          </div>

          <button className="icon-btn-small">

            <X size={16} />

          </button>

        </div>

      ))}

    </div>

  </div>

);

// Payment History Component

const PaymentHistory = () => (

  <div className="card">

    <div className="card-header">

      <h2>Payment History</h2>

    </div>

    <div className="table-container">

      <table className="table">

        <thead>

          <tr>

            <th>Date</th>

            <th>Amount</th>

            <th>Status</th>

            <th>Invoice</th>

          </tr>

        </thead>

        <tbody>

          {mockUserData.paymentHistory.map(payment => (

            <tr key={payment.id}>

              <td>{payment.date}</td>

              <td className="font-medium">₹{payment.amount}</td>

              <td>

                <span className="badge badge-success">{payment.status}</span>

              </td>

              <td>

                <button className="text-link">

                  <Download size={16} />

                  <span>Download</span>

                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  </div>

);

// Admin Stats Component

const AdminStats = () => {

  const stats = [

    { label: 'Total Users', value: mockAdminData.analytics.totalUsers, icon: Users, color: 'blue' },

    { label: 'Active Users', value: mockAdminData.analytics.activeUsers, icon: TrendingUp, color: 'green' },

    { label: 'Pending', value: mockAdminData.analytics.pendingUsers, icon: Bell, color: 'yellow' },

    { label: 'Total Revenue', value: `₹${mockAdminData.analytics.revenue.toLocaleString()}`, icon: DollarSign, color: 'purple' }

  ];

  return (

    <div className="stats-grid">

      {stats.map((stat, idx) => (

        <div key={idx} className="stat-card">

          <div className="stat-content">

            <div>

              <p className="stat-label">{stat.label}</p>

              <p className="stat-value">{stat.value}</p>

            </div>

            <div className={`stat-icon ${stat.color}`}>

              <stat.icon size={24} />

            </div>

          </div>

        </div>

      ))}

    </div>

  );

};

// User Management Component

const UserManagement = () => {

  const [filter, setFilter] = useState('All');

  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = mockAdminData.users.filter(user => {

    const matchesFilter = filter === 'All' || user.status === filter;

    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||

                         user.email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;

  });

  return (

    <div className="card">

      <div className="card-header">

        <div>

          <h2>User Management</h2>

          <p className="subtitle">Total {filteredUsers.length} users found</p>

        </div>

        <button className="btn btn-primary">

          <Plus size={16} />

          <span>Add User</span>

        </button>

      </div>

      <div className="filters-container">

        <div className="search-box">

          <Search className="search-icon" size={20} />

          <input

            type="text"

            placeholder="Search by name or email..."

            value={searchTerm}

            onChange={(e) => setSearchTerm(e.target.value)}

          />

        </div>

        <div className="filter-buttons">

          {['All', 'Active', 'Pending', 'Expired'].map(status => (

            <button

              key={status}

              onClick={() => setFilter(status)}

              className={`filter-btn ${filter === status ? 'active' : ''}`}

            >

              {status}

            </button>

          ))}

        </div>

      </div>

      <div className="table-container">

        <table className="table">

          <thead>

            <tr>

              <th>ID</th>

              <th>Name</th>

              <th>Email</th>

              <th>Status</th>

              <th>Subscription</th>

              <th>Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredUsers.map(user => (

              <tr key={user.id}>

                <td className="font-medium">#{user.id}</td>

                <td>{user.name}</td>

                <td className="text-gray">{user.email}</td>

                <td>

                  <span className={`badge badge-${user.status.toLowerCase()}`}>

                    {user.status}

                  </span>

                </td>

                <td>{user.subscription}</td>

                <td>

                  <div className="action-buttons">

                    <button className="icon-btn-small primary">

                      <Eye size={16} />

                    </button>

                    <button className="icon-btn-small">

                      <Edit size={16} />

                    </button>

                    <button className="icon-btn-small danger">

                      <Trash2 size={16} />

                    </button>

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

// Send Notifications Component

const SendNotifications = () => {

  const [message, setMessage] = useState('');

  const [targetUsers, setTargetUsers] = useState('all');

  const [title, setTitle] = useState('');

  return (

    <div className="card">

      <div className="card-header-icon">

        <div className="header-icon-wrapper">

          <Send size={20} />

        </div>

        <h2>Send Notifications</h2>

      </div>

      <form className="notification-form">

        <div className="form-group">

          <label>Target Users</label>

          <div className="select-wrapper">

            <Users className="select-icon" size={20} />

            <select value={targetUsers} onChange={(e) => setTargetUsers(e.target.value)}>

              <option value="all">All Users</option>

              <option value="active">Active Users Only</option>

              <option value="pending">Pending Users Only</option>

              <option value="expired">Expired Users Only</option>

            </select>

          </div>

        </div>

        <div className="form-group">

          <label>Notification Title</label>

          <input

            type="text"

            value={title}

            onChange={(e) => setTitle(e.target.value)}

            placeholder="Enter notification title..."

          />

        </div>

        <div className="form-group">

          <label>Message</label>

          <textarea

            value={message}

            onChange={(e) => setMessage(e.target.value)}

            rows={6}

            placeholder="Enter your notification message here..."

          />

        </div>

        <button type="submit" className="btn btn-primary btn-block">

          <Send size={18} />

          <span>Send Notification</span>

        </button>

      </form>

    </div>

  );

};

// Main Dashboard Component

const Dashboard = () => {

  const [userRole, setUserRole] = useState('user');

  const [activeMenu, setActiveMenu] = useState('dashboard');

  const renderUserContent = () => {

    switch (activeMenu) {

      case 'dashboard':

        return (

          <div className="content-grid">

            <div className="grid-two-col">

              <UserProfile />

              <SubscriptionCard />

            </div>

            <NotificationsList />

          </div>

        );

      case 'subscription':

        return <SubscriptionCard />;

      case 'notifications':

        return <NotificationsList />;

      case 'payment':

        return <PaymentHistory />;

      case 'settings':

        return (

          <div className="card">

            <h2>Settings</h2>

            <p>Settings content coming soon...</p>

          </div>

        );

      default:

        return null;

    }

  };

  const renderAdminContent = () => {

    switch (activeMenu) {

      case 'dashboard':

        return (

          <div className="content-grid">

            <AdminStats />

            <UserManagement />

          </div>

        );

      case 'users':

        return <UserManagement />;

      case 'notifications':

        return <SendNotifications />;

      case 'analytics':

        return (

          <div className="content-grid">

            <AdminStats />

            <div className="card">

              <h2>Revenue Analytics</h2>

              <div className="stats-grid">

                <div className="stat-card">

                  <div className="stat-content">

                    <div>

                      <p className="stat-label">Monthly Revenue</p>

                      <p className="stat-value">₹98,750</p>

                    </div>

                  </div>

                </div>

                <div className="stat-card">

                  <div className="stat-content">

                    <div>

                      <p className="stat-label">Yearly Revenue</p>

                      <p className="stat-value">₹1,24,875</p>

                    </div>

                  </div>

                </div>

              </div>

              <p style={{ marginTop: '1.5rem', color: 'var(--gray-600)' }}>

                Detailed analytics charts can be integrated using libraries like Chart.js or Recharts.

              </p>

            </div>

          </div>

        );

      case 'settings':

        return (

          <div className="card">

            <h2>Admin Settings</h2>

            <div className="settings-section">

              <div>

                <h3>Platform Information</h3>

                <div className="form-group">

                  <label>Site Name</label>

                  <input type="text" defaultValue="StockPro" />

                </div>

                <div className="form-group">

                  <label>Contact Email</label>

                  <input type="email" placeholder="admin@stockpro.com" />

                </div>

              </div>

              <div>

                <h3>Subscription Plans</h3>

                <div className="form-group">

                  <label>Plan Name</label>

                  <input type="text" defaultValue="Premium" />

                </div>

                <div className="form-group">

                  <label>Price (₹)</label>

                  <input type="number" defaultValue="999" />

                </div>

              </div>

              <button className="btn btn-primary">Save Changes</button>

            </div>

          </div>

        );

      default:

        return null;

    }

  };

  return (

    <div className="dashboard">

      <Sidebar userRole={userRole} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      

      <div className="main-content">

        <div className="header">

          <div>

            <h1>{userRole === 'admin' ? 'Admin Dashboard' : `Hello, ${mockUserData.name}`}</h1>

            <p className="date-text">

              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

            </p>

          </div>

          <button

            onClick={() => {

              setUserRole(userRole === 'user' ? 'admin' : 'user');

              setActiveMenu('dashboard');

            }}

            className="btn btn-primary"

          >

            Switch to {userRole === 'user' ? 'Admin' : 'User'} View

          </button>

        </div>

        <div className="content">

          {userRole === 'user' ? renderUserContent() : renderAdminContent()}

        </div>

      </div>

    </div>

  );

};

export default Dashboard;

