import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { handlePayments } from "../payments";

function Home() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#pricing") {
      const el = document.getElementById("pricing");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <div className="min-h-screen pt-96 pb-20 flex items-center justify-center relative overflow-hidden bg-black">
      {/* Decorative Blurs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-purple-700 rounded-full opacity-30 blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-400 rounded-full opacity-20 blur-2xl"></div>
      <div className="relative z-10 text-center -mt-56">
        {/* Hero Section */}
        <h1 className="text-5xl font-extrabold tracking-widest uppercase bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800 bg-clip-text text-transparent drop-shadow-lg select-none mb-6">
          Welcome to <span className="text-white bg-none">Chat.<span className="text-purple-400">AI</span></span>
        </h1>
        <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
          Your intelligent chatbot companion. Start a new chat or login to continue your conversation!
        </p>

        {/* Animated Mascot */}
        <div className="flex justify-center mb-8">
          <img
            src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f916.png"
            alt="AI Bot"
            className="w-24 h-24 animate-bounce drop-shadow-xl"
            style={{ filter: "drop-shadow(0 0 16px #a78bfa)" }}
          />
        </div>

        {/* Example Use Cases */}
        <div className="bg-zinc-900 bg-opacity-70 rounded-xl p-6 mb-8 max-w-lg mx-auto shadow-lg">
          <h2 className="text-xl font-bold text-purple-400 mb-3">What can I ask?</h2>
          <ul className="text-gray-200 space-y-2 text-left list-disc list-inside">
            <li>“Summarize this PDF for me.”</li>
            <li>“What is discussed in this audio file?”</li>
            <li>“Find all dates mentioned in my document.”</li>
            <li>“Explain the main idea in simple terms.”</li>
          </ul>
        </div>

        {/* Testimonials */}
        <section className="w-full px-6 py-24">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-700 drop-shadow mb-4">
              What Users Are Saying
            </h2>
            <p className="text-center text-gray-400 max-w-3xl mx-auto text-base md:text-lg mb-16">
              Real experiences from real users — here's how Chat.AI is helping people study smarter, learn faster, and work more efficiently.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Testimonial 1 */}
              <div className="bg-zinc-900/60 backdrop-blur-md border border-violet-600/30 rounded-2xl p-8 shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] transition duration-300 flex flex-col h-full">
                <p className="text-gray-200 italic text-[17px] leading-8 relative pl-6 flex-1">
                  <span className="absolute left-0 top-1 text-purple-400 text-2xl font-bold">“</span>
                  I used Chat.AI to help me go through hundreds of pages of research documents. Within minutes, I was able to get summaries, extract key points, and ask questions about specific sections. This tool has literally saved me days of work!
                </p>
                <div className="text-purple-300 mt-6 font-semibold text-right">— Priya S.</div>
              </div>
              {/* Testimonial 2 */}
              <div className="bg-zinc-900/60 backdrop-blur-md border border-violet-600/30 rounded-2xl p-8 shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] transition duration-300 flex flex-col h-full">
                <p className="text-gray-200 italic text-[17px] leading-8 relative pl-6 flex-1">
                  <span className="absolute left-0 top-1 text-purple-400 text-2xl font-bold">“</span>
                  I uploaded a 90-minute recorded lecture and was amazed to receive clear, concise answers to my questions. The AI understood the context really well and helped me review for my exams in less than half the time.
                </p>
                <div className="text-purple-300 mt-6 font-semibold text-right">— Alex R.</div>
              </div>
              {/* Testimonial 3 */}
              <div className="bg-zinc-900/60 backdrop-blur-md border border-violet-600/30 rounded-2xl p-8 shadow-xl hover:shadow-purple-500/20 hover:scale-[1.02] transition duration-300 flex flex-col h-full">
                <p className="text-gray-200 italic text-[17px] leading-8 relative pl-6 flex-1">
                  <span className="absolute left-0 top-1 text-purple-400 text-2xl font-bold">“</span>
                  The design is elegant and distraction-free. Uploading documents or audio is seamless, and I love how Chat.AI responds like a real assistant. I use it daily to prep for classes, write reports, and brainstorm ideas.
                </p>
                <div className="text-purple-300 mt-6 font-semibold text-right">— Fatima K.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full px-6 py-24">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-700 drop-shadow mb-4">
              Pricing
            </h2>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto mb-16">
              Simple, transparent pricing. No hidden fees. Choose the plan that fits your needs.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Free Plan */}
              <div className="bg-zinc-900/70 backdrop-blur border border-violet-600/20 rounded-2xl p-8 shadow-lg hover:shadow-purple-400/20 transition-transform hover:scale-[1.03]">
                <h3 className="text-2xl font-bold text-purple-400 mb-2">Free</h3>
                <div className="text-4xl font-extrabold text-white mb-4">
                  ₹0<span className="text-lg font-medium text-gray-400">/mo</span>
                </div>
                <ul className="text-gray-300 space-y-3 mb-8 text-base leading-relaxed flex flex-col items-center text-center">
                  <li>✅ Up to 5 chat sessions</li>
                  <li>✅ Single PDF generation</li>
                  <li>✅ Audio file support</li>
                  <li>✅ Basic AI responses</li>
                </ul>
                <button className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:shadow-purple-500/30 hover:scale-105 transition">
                  Get Started
                </button>
              </div>
              {/* Pro Plan */}
              <div className="bg-zinc-900/80 backdrop-blur border-2 border-violet-500 rounded-2xl p-10 shadow-2xl scale-105 hover:scale-[1.07] transition-transform duration-300 relative">
                <span className="absolute top-4 right-4 bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-semibold tracking-wide">
                  Limited Offer
                </span>
                <h3 className="text-2xl font-bold text-purple-400 mb-2">Pro</h3>
                <div className="text-4xl font-extrabold text-white mb-4 flex flex-col items-center">
                  <span className="text-2xl text-gray-400 line-through">₹299</span>
                  ₹199<span className="text-lg font-medium text-gray-400">/mo</span>
                </div>
                <ul className="text-gray-300 space-y-3 mb-8 text-base leading-relaxed flex flex-col items-center text-center">
                  <li>✅ Unlimited chats</li>
                  <li>✅ Unlimited PDF & Audio uploads</li>
                  <li>✅ Advanced AI responses</li>
                  <li>✅ Priority support</li>
                </ul>
                <button onClick={() => handlePayments("pro")} className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:shadow-purple-500/30 hover:scale-105 transition">
                  Upgrade
                </button>
              </div>
              {/* Enterprise Plan */}
              <div className="bg-zinc-900/70 backdrop-blur border border-violet-600/20 rounded-2xl p-8 shadow-lg hover:shadow-purple-400/20 transition-transform hover:scale-[1.03]">
                <h3 className="text-2xl font-bold text-purple-400 mb-2">Enterprise</h3>
                <div className="text-4xl font-extrabold text-white mb-4">
                  ₹999<span className="text-lg font-medium text-gray-400">/mo</span>
                </div>
                <ul className="text-gray-300 space-y-3 mb-8 text-base leading-relaxed flex flex-col items-center text-center">
                  <li>✅ Custom integrations</li>
                  <li>✅ Dedicated support</li>
                  <li>✅ SLA & onboarding</li>
                </ul>
                <button onClick={() => handlePayments("enterprise")} className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:shadow-purple-500/30 hover:scale-105 transition">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 text-gray-500 text-sm">
          © {new Date().getFullYear()} Chat.AI &middot; Built with ❤️ by Keshav Goyal
        </footer>
      </div>
    </div>
  );
}

export default Home;