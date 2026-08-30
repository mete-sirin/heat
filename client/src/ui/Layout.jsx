import { Outlet } from "react-router";

function Layout() {
  return (
    <div>
      <p>testing Layout</p>
      <section>
        <Outlet />
      </section>
    </div>
  );
}

export default Layout;
