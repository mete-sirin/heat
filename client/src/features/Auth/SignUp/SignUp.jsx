import { useNavigate } from "react-router";
import { useState } from "react";
import Footer from "../../../ui/Footer";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("tr");
  const navigate = useNavigate();

  function handleSignup(e) {
    e.preventDefault();
    if (password.length < 5) return;
    navigate("./success");
  }
  return (
    //// TODO: mask the bg image into the text (background-clip: text + transparent fill)
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
              onSubmit={handleSignup}
              className="flex flex-col gap-4 h-max w-2/3 border rounded-sm p-4 bg-amber-50"
            >
              <input
                type="text"
                placeholder="Name"
                value={name}
                className="p-2 border border-border"
                required
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="ardaguler@gmail.com"
                required={true}
                className="p-2 border border-border"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="new-email"
              />
              <input
                type="password"
                placeholder="password"
                required={true}
                className="p-2 border border-border"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <select
                name="currency"
                value={currency}
                className="p-2 border border-border"
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="tr">Lira</option>
                <option value="dol">Dollar</option>
                <option value="eu">Euro</option>
              </select>
              <button
                className="cursor-pointer  text-white bg-black
              hover:bg-black/80 p-2 rounded-sm"
              >
                Sign Up
              </button>
            </form>
          </section>
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
}

export default SignUp;
