import React, { memo, useState } from 'react';

/**
 * UserDetailsForm Component - Enhanced UI (Optimized Height)
 * Matches app.jsx design language
 */
const UserDetailsForm = memo(({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <div style={{
        background: 'rgba(6,20,22,0.92)',
        border: '1px solid rgba(0,255,222,0.18)',
        borderRadius: '16px',
        padding: '10px 28px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,255,222,0.05) inset',
        backdropFilter: 'blur(12px)'
      }}>
        {/* Header - Reduced spacing */}
        <div style={{ marginBottom: '10px', textAlign: 'center' }}>
          <h3 style={{
            color: '#ccfff7',
            fontSize: '20px',
            fontWeight: '700',
            margin: '0 0 6px',
            letterSpacing: '0.02em'
          }}>
            Your Information
          </h3>
          <p style={{
            color: 'rgba(159,236,226,0.6)',
            fontSize: '13px',
            margin: 0
          }}>
            Please provide your details to continue
          </p>
        </div>

        {/* Name Field - Reduced spacing */}
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="name" style={{
            display: 'block',
            color: '#9fece2',
            fontSize: '13px',
            marginBottom: '8px',
            fontWeight: '500',
            letterSpacing: '0.02em'
          }}>
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => handleBlur('name')}
            placeholder="Enter your full name"
            disabled={isLoading}
            autoComplete="name"
            maxLength={100}
            style={{
              width: '100%',
              padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px)',
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${errors.name && touched.name ? 'rgba(255,100,100,0.4)' : 'rgba(0,255,222,0.15)'}`,
              borderRadius: '10px',
              color: '#fff',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              outline: 'none',
              transition: 'all 0.25s ease',
              fontFamily: 'inherit',
              minHeight: '44px',
              boxSizing: 'border-box',
              touchAction: 'manipulation'
            }}
            onFocus={(e) => {
              if (!errors.name) e.target.style.borderColor = 'rgba(0,255,222,0.4)';
              e.target.style.background = 'rgba(0,0,0,0.35)';
            }}
            onBlurCapture={(e) => {
              if (!errors.name) e.target.style.borderColor = 'rgba(0,255,222,0.15)';
              e.target.style.background = 'rgba(0,0,0,0.25)';
            }}
          />
          {errors.name && touched.name && (
            <div style={{
              color: '#ff6b6b',
              fontSize: '11px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {errors.name}
            </div>
          )}
        </div>

        {/* Email Field - Reduced spacing */}
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="email" style={{
            display: 'block',
            color: '#9fece2',
            fontSize: '13px',
            marginBottom: '8px',
            fontWeight: '500',
            letterSpacing: '0.02em'
          }}>
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => handleBlur('email')}
            placeholder="your.email@example.com"
            disabled={isLoading}
            autoComplete="email"
            inputMode="email"
            maxLength={255}
            style={{
              width: '100%',
              padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px)',
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${errors.email && touched.email ? 'rgba(255,100,100,0.4)' : 'rgba(0,255,222,0.15)'}`,
              borderRadius: '10px',
              color: '#fff',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              outline: 'none',
              transition: 'all 0.25s ease',
              fontFamily: 'inherit',
              minHeight: '44px',
              boxSizing: 'border-box',
              touchAction: 'manipulation'
            }}
            onFocus={(e) => {
              if (!errors.email) e.target.style.borderColor = 'rgba(0,255,222,0.4)';
              e.target.style.background = 'rgba(0,0,0,0.35)';
            }}
            onBlurCapture={(e) => {
              if (!errors.email) e.target.style.borderColor = 'rgba(0,255,222,0.15)';
              e.target.style.background = 'rgba(0,0,0,0.25)';
            }}
          />
          {errors.email && touched.email && (
            <div style={{
              color: '#ff6b6b',
              fontSize: '11px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {errors.email}
            </div>
          )}
        </div>

        {/* Phone Field - Reduced spacing */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="phone" style={{
            display: 'block',
            color: '#9fece2',
            fontSize: '13px',
            marginBottom: '8px',
            fontWeight: '500',
            letterSpacing: '0.02em'
          }}>
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            onBlur={() => handleBlur('phone')}
            placeholder="+1 (234) 567-8900"
            disabled={isLoading}
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            style={{
              width: '100%',
              padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3.5vw, 16px)',
              background: 'rgba(0,0,0,0.25)',
              border: `1px solid ${errors.phone && touched.phone ? 'rgba(255,100,100,0.4)' : 'rgba(0,255,222,0.15)'}`,
              borderRadius: '10px',
              color: '#fff',
              fontSize: 'clamp(14px, 3.5vw, 16px)',
              outline: 'none',
              transition: 'all 0.25s ease',
              fontFamily: 'inherit',
              minHeight: '44px',
              boxSizing: 'border-box',
              touchAction: 'manipulation'
            }}
            onFocus={(e) => {
              if (!errors.phone) e.target.style.borderColor = 'rgba(0,255,222,0.4)';
              e.target.style.background = 'rgba(0,0,0,0.35)';
            }}
            onBlurCapture={(e) => {
              if (!errors.phone) e.target.style.borderColor = 'rgba(0,255,222,0.15)';
              e.target.style.background = 'rgba(0,0,0,0.25)';
            }}
          />
          {errors.phone && touched.phone && (
            <div style={{
              color: '#ff6b6b',
              fontSize: '11px',
              marginTop: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {errors.phone}
            </div>
          )}
        </div>

        {/* Submit Button - Slightly reduced padding */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            background: isLoading ? 'rgba(0,255,222,0.3)' : 'linear-gradient(135deg, #00ffde 0%, #00d4b8 100%)',
            color: '#000',
            border: 'none',
            padding: 'clamp(14px, 3.5vw, 16px) clamp(20px, 5vw, 28px)',
            fontSize: 'clamp(13px, 3.2vw, 14px)',
            fontWeight: '700',
            borderRadius: '10px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isLoading ? 'none' : '0 8px 24px rgba(0,255,222,0.25)',
            transform: 'translateZ(0)',
            willChange: 'transform',
            minHeight: '48px',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,255,222,0.35)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,255,222,0.25)';
            }
          }}
        >
          {isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(0,0,0,0.2)',
                borderTopColor: '#000',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite'
              }} />
              PROCESSING...
            </span>
          ) : (
            'CONTINUE TO PAYMENT'
          )}
        </button>

        {/* Privacy Notice - Reduced spacing */}
        <p style={{
          color: 'rgba(159,236,226,0.45)',
          fontSize: '11px',
          margin: '12px 0 0',
          textAlign: 'center',
          lineHeight: '1.4'
        }}>
          🔒 Your information is secure and encrypted. We never share your data.
        </p>
      </div>
    </form>
  );
});

UserDetailsForm.displayName = 'UserDetailsForm';

export default UserDetailsForm;