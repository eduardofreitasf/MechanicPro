import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Showcase } from "./components/Showcase";
import { Footer } from "./components/Footer";

function App() {
  return (
    <>
      <div className="bg-gradient-mesh"></div>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Showcase />
      </main>
      <Footer />
    </>
  );
}

export default App;
