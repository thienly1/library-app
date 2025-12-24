import { Outlet, Link, NavLink } from 'react-router-dom';

function Layout() {
  return (
    <div className="app-layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="header-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <h1>Library</h1>
          </Link>
          <nav className="nav-links">
            <NavLink 
              to="/" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              Home
            </NavLink>
            <NavLink 
              to="/books" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Books
            </NavLink>
            <NavLink 
              to="/books/add" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Add Book
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
