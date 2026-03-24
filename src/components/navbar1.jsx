import React, { useState } from "react";
import ThemeToggleBtn from "./ThemeToggleBtn";

const Navbar = ({ theme, setTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true); // Desktop collapse
  // const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* 🔹 Mobile Top Bar */}
      <div className="flex items-center fixed w-full justify-start gap-3 p-4 bg-navbar  sm:ml-20 sm:fixed sm:w-full sm:bg-(--color-hero)">
        <button onClick={() => setMobileOpen(true)} className="sm:hidden">☰</button>
        {/* <button onClick={() => setSidebarOpen(true)}>☰</button> */}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-leaf-fill" viewBox="0 0 16 16">
          <path d="M1.4 1.7c.217.289.65.84 1.725 1.274 1.093.44 2.885.774 5.834.528 2.02-.168 3.431.51 4.326 1.556C14.161 6.082 14.5 7.41 14.5 8.5q0 .344-.027.734C13.387 8.252 11.877 7.76 10.39 7.5c-2.016-.288-4.188-.445-5.59-2.045-.142-.162-.402-.102-.379.112.108.985 1.104 1.82 1.844 2.308 2.37 1.566 5.772-.118 7.6 3.071.505.8 1.374 2.7 1.75 4.292.07.298-.066.611-.354.715a.7.7 0 0 1-.161.042 1 1 0 0 1-1.08-.794c-.13-.97-.396-1.913-.868-2.77C12.173 13.386 10.565 14 8 14c-1.854 0-3.32-.544-4.45-1.435-1.124-.887-1.889-2.095-2.39-3.383-1-2.562-1-5.536-.65-7.28L.73.806z"/>
        </svg>
        <h1 className="text-lg font-semibold">PlantDoc</h1>
        
      </div>

      {/* 🔹 Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}

      {/* 🔹 Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full bg-navbar z-50 transform
          transition-transform duration-300 ease-in-out 
          
          
          ${collapsed ? "w-20":"w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          
          sm:translate-0
        `}
      >
        {/* 🔹 Desktop Collapse Button */}
        <div className=" hidden sm:flex justify-between p-4">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-2 rounded hover:bg-surface-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-layout-sidebar-reverse" viewBox="0 0 16 16">
                    <path d="M16 3a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2zm-5-1v12H2a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 0h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-2z"/>
                  </svg>
            </button>
        </div>

        {/* 🔹 Mobile Close Button */}
        <div className="flex justify-end p-3 sm:hidden">
          <button onClick={() => setMobileOpen(false)}>✕</button>
        </div>

        {/* 🔹 Nav Items */}
        <nav className="flex flex-col gap-4 p-4">
          <NavItem label="Home" collapsed={collapsed}  />
          <NavItem1 label="About Us" collapsed={collapsed} />
          <NavItem2 label="Disease Recognizer" collapsed={collapsed} />
          <NavItem3 label="Contact Us" collapsed={collapsed} />

          <ThemeToggleBtn theme={theme} setTheme={setTheme} />
        </nav>
      </div>
    </>
  );
};

const NavItem = ({ label, collapsed }) => {
  return (
    <a href="#" className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition">
      <div className="rounded ">
        <svg  xmlns="http://www.w3.org/2000/svg" viewBox="-49 141 512 512" width="22" height="22" aria-hidden="true" className="fill-current" >
            <path d="M455.678 404.322 352 300.644V216c0-13.807-11.193-25-25-25s-25 11.193-25 25v34.645l-77.322-77.322c-9.764-9.763-25.592-9.763-35.355 0l-231 231A25 25 0 0 0-24 447H1v126c0 30.327 24.673 55 55 55h302c30.327 0 55-24.673 55-55V447h25a25 25 0 0 0 17.678-42.678M363 573c0 2.757-2.243 5-5 5h-96v-95c0-13.807-11.193-25-25-25h-60c-13.807 0-25 11.193-25 25v95H56c-2.757 0-5-2.243-5-5V382.355l156-156 156 156z"></path>
        </svg>
      </div>
      {!collapsed && <span>{label}</span>}
      {/* <span className={`transition-all duration-300 ${collapsed ? "opacity-0 " : "opacity-100 translate-x-0 visible"}`}>
        {label}
      </span> */}
    </a>
  );
};
const NavItem1= ({ label, collapsed }) => {
  return (
    <a href="#AboutUs" className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition">
      <div className="rounded">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-journal-bookmark" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M6 8V1h1v6.117L8.743 6.07a.5.5 0 0 1 .514 0L11 7.117V1h1v7a.5.5 0 0 1-.757.429L9 7.083 6.757 8.43A.5.5 0 0 1 6 8"/>
            <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"/>
            <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"/>
        </svg>
      </div>
      {!collapsed && <span>{label}</span>}
      {/* <span className={`transition-all duration-300 ${collapsed ? "opacity-0 translate-x-4 invisible" : "opacity-100 translate-x-0 visible"}`}>
        {label}
      </span> */}
    </a>
  );
};

const NavItem2= ({ label, collapsed }) => {
  return (
    <a href="#disease-recognizer" className="flex items-center gap-3 p-2 rounded hover:bg-surface-2 transition">
      <div className="rounded">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-image" viewBox="0 0 16 16">
          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
          <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z"/>
        </svg>
      </div>
      {!collapsed && <span>{label}</span>}
      {/* <span className={`transition-all duration-300 ${collapsed ? "opacity-0 translate-x-4 invisible" : "opacity-100 translate-x-0 visible"}`}>
        {label}
      </span> */}
    </a>
  );
};
const NavItem3= ({ label, collapsed }) => {
  return (
    <a href="#contact-us" className="flex items-center gap-3 p-1 rounded hover:bg-surface-2 transition">
      <div className="rounded">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-question-circle" viewBox="0 0 16 16">
          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
          <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286m1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94"/>
        </svg>
      </div>
      {!collapsed && <span>{label}</span>}
      {/* <span className={`transition-all duration-300 ${collapsed ? "opacity-0 translate-x-4 invisible" : "opacity-100 translate-x-0 visible"}`}>
        {label}
      </span> */}
    </a>
  );
};

export default Navbar;
