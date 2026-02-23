# Unified Header Implementation Guide

## Overview
This unified header component replaces all existing headers (admin-header, can-header, emp-header, and placement header) with one consistent component.

## Features
- ✅ Consistent design across all user roles
- ✅ Mobile responsive (breakpoints: 991px, 768px, 480px)
- ✅ Hamburger menu toggle
- ✅ Notification bell integration
- ✅ User profile with avatar
- ✅ Smooth transitions
- ✅ Touch-friendly on mobile

---

## Implementation Examples

### 1. Admin Layout (admin-layout.jsx)

```jsx
import UnifiedHeader from '../components/UnifiedHeader';
import AdminSidebarSection from '../app/pannels/admin/common/admin-sidebar';
import AdminRoutes from '../routing/admin-routes';
import { useState, useEffect } from 'react';

function AdminLayout() {
    const [sidebarActive, setSidebarActive] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 991);
            setSidebarActive(window.innerWidth > 991);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleMenuToggle = () => {
        setSidebarActive(!sidebarActive);
    };

    return (
        <div className="page-wraper">
            {/* Sidebar Overlay for Mobile */}
            {isMobile && sidebarActive && (
                <div 
                    className="sidebar-overlay active"
                    onClick={() => setSidebarActive(false)}
                />
            )}

            {/* Unified Header */}
            <UnifiedHeader 
                userRole="admin"
                onMenuToggle={handleMenuToggle}
                isSidebarOpen={sidebarActive}
            />

            {/* Sidebar */}
            <AdminSidebarSection 
                sidebarActive={sidebarActive} 
                isMobile={isMobile} 
            />

            {/* Main Content */}
            <div className={`content ${!sidebarActive ? 'sidebar-hidden' : ''}`}>
                <div className="content-main" style={{ marginTop: '70px' }}>
                    <AdminRoutes />
                </div>
            </div>
        </div>
    );
}

export default AdminLayout;
```

---

### 2. Candidate Layout (candidate-layout.jsx)

```jsx
import UnifiedHeader from '../components/UnifiedHeader';
import CandidateSidebar from '../app/pannels/candidate/common/can-sidebar';
import CandidateRoutes from '../routing/candidate-routes';
import { useState, useEffect } from 'react';

function CandidateLayout() {
    const [sidebarActive, setSidebarActive] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 991);
            setSidebarActive(window.innerWidth > 991);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="page-wraper">
            {isMobile && sidebarActive && (
                <div 
                    className="sidebar-overlay active"
                    onClick={() => setSidebarActive(false)}
                />
            )}

            <UnifiedHeader 
                userRole="candidate"
                onMenuToggle={() => setSidebarActive(!sidebarActive)}
                isSidebarOpen={sidebarActive}
            />

            <CandidateSidebar 
                sidebarActive={sidebarActive} 
                isMobile={isMobile} 
            />

            <div className={`content ${!sidebarActive ? 'sidebar-hidden' : ''}`}>
                <div className="content-main" style={{ marginTop: '70px' }}>
                    <CandidateRoutes />
                </div>
            </div>
        </div>
    );
}

export default CandidateLayout;
```

---

### 3. Employer Layout (employer-layout.jsx)

```jsx
import UnifiedHeader from '../components/UnifiedHeader';
import EmployerSidebar from '../app/pannels/employer/common/emp-sidebar';
import EmployerRoutes from '../routing/employer-routes';
import { useState, useEffect } from 'react';

function EmployerLayout() {
    const [sidebarActive, setSidebarActive] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 991);
            setSidebarActive(window.innerWidth > 991);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="page-wraper">
            {isMobile && sidebarActive && (
                <div 
                    className="sidebar-overlay active"
                    onClick={() => setSidebarActive(false)}
                />
            )}

            <UnifiedHeader 
                userRole="employer"
                onMenuToggle={() => setSidebarActive(!sidebarActive)}
                isSidebarOpen={sidebarActive}
            />

            <EmployerSidebar 
                sidebarActive={sidebarActive} 
                isMobile={isMobile} 
            />

            <div className={`content ${!sidebarActive ? 'sidebar-hidden' : ''}`}>
                <div className="content-main" style={{ marginTop: '70px' }}>
                    <EmployerRoutes />
                </div>
            </div>
        </div>
    );
}

export default EmployerLayout;
```

---

### 4. Placement Dashboard (placement-dashboard-redesigned.jsx)

Replace the existing top-header section with:

```jsx
import UnifiedHeader from '../../../components/UnifiedHeader';

function PlacementDashboardRedesigned() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [placementData, setPlacementData] = useState(null);
    
    // ... existing code ...

    return (
        <div className={`dashboard-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
                {/* ... existing sidebar code ... */}
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Replace existing top-header with UnifiedHeader */}
                <UnifiedHeader 
                    userRole="placement"
                    userData={placementData}
                    onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                    isSidebarOpen={isSidebarOpen}
                />

                {/* Content Area */}
                <div className="content-area" style={{ marginTop: '70px' }}>
                    {/* ... existing content ... */}
                </div>
            </div>
        </div>
    );
}
```

---

## Required CSS Updates

Add to your global CSS or layout CSS:

```css
/* Sidebar Overlay */
.sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
    transition: opacity 0.3s ease;
}

/* Content adjustment when sidebar is hidden */
.content.sidebar-hidden {
    margin-left: 0 !important;
}

/* Mobile content adjustment */
@media (max-width: 991px) {
    .content {
        margin-left: 0 !important;
    }
}
```

---

## Migration Steps

1. ✅ **Created**: `UnifiedHeader.jsx` and `UnifiedHeader.css`
2. **Replace** old headers in each layout file
3. **Remove** old header files:
   - `admin-header.jsx`
   - `can-header.jsx`
   - `emp-header.jsx`
   - Remove placement's inline header
4. **Update** imports in layout files
5. **Test** each user role on desktop and mobile
6. **Delete** old header CSS files

---

## Props Reference

### UnifiedHeader Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `userRole` | string | Yes | User type: 'admin', 'candidate', 'employer', 'placement' |
| `userData` | object | No | User profile data (name, image, etc.) |
| `onMenuToggle` | function | Yes | Callback when menu button is clicked |
| `isSidebarOpen` | boolean | Yes | Current sidebar state |

---

## Benefits

✅ **Consistency**: Same look and feel across all dashboards
✅ **Maintainability**: Update once, applies everywhere
✅ **Mobile-First**: Optimized for all screen sizes
✅ **Performance**: Single component, less code duplication
✅ **Accessibility**: Proper ARIA labels and keyboard support
