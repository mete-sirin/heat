import { useNavigate } from "react-router";
import Footer from "../../../ui/Footer";

function Login() {
  const navigate = useNavigate();
  function handleLogin(e) {
    e.preventDefault();
    navigate("/home");
  }
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 scale-110 bg-[url('/loginBg.jpg')] bg-cover bg-center blur-sm"
      />
      <div className="relative min-h-screen flex flex-col bg-[url('/loginBg.jpg')] bg-contain bg-no-repeat bg-center">
        <div className="flex-1 flex justify-center">
          <section className="w-lg flex flex-col items-center gap-12 justify-center backdrop-blur-md bg-primary/35 rounded-md shadow-2xl border-border border m-20">
            <h3 className="text-4xl uppercase font-bold font-display">HEAT</h3>
            {/* //todo create a logo svg and handle the text */}
            <p className="text-pretty text-center">
              Handle your cash and never forget about subscriptions
            </p>
            <form
              action="submit"
              className="flex flex-col gap-4 h-max w-2/3 border rounded-sm p-4 bg-primary-hover"
            >
              <input
                type="email"
                placeholder="ardaguler@gmail.com"
                required={true}
                className="p-2 border border-border"
              />
              <input
                type="password"
                placeholder="password"
                required={true}
                className="p-2 border border-border"
              />
              <button
                onClick={handleLogin}
                className="cursor-pointer  text-white bg-black
              hover:bg-black/80 p-2 rounded-sm"
              >
                Login
              </button>
            </form>
          </section>
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
}

export default Login;
