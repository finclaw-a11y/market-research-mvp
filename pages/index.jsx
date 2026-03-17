import Head from 'next/head';

export default function Home() {
  const handleCheckout = async (planId) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: planId }),
      });

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else if (session.error) {
        alert('Error: ' + session.error);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error starting checkout. Please try again.');
    }
  };

  return (
    <>
      <Head>
        <title>vervix — Automated Market Research</title>
        <meta name="description" content="Automate your market research and get AI-powered competitive insights in minutes." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Navigation */}
        <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold">
              <span className="text-blue-400">ver</span><span className="text-purple-500">vix</span>
            </div>
            <div className="flex gap-8">
              <a href="#features" className="text-slate-300 hover:text-white">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white">Pricing</a>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Automate Your Market Research
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Get AI-powered competitive insights, market analysis, and strategic intelligence in minutes—not months. No surveys. No manual work.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <button
                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold"
              >
                Start Now
              </button>
              <button className="border border-slate-400 hover:bg-slate-800 px-8 py-3 rounded-lg font-semibold">
                Book Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-700">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose vervix</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Instant Insights',
                desc: 'Get market analysis in minutes, not weeks. Powered by AI.',
              },
              {
                icon: '🎯',
                title: 'Competitive Intelligence',
                desc: 'Monitor competitors, track pricing, identify market gaps.',
              },
              {
                icon: '📊',
                title: 'AI-Powered Analytics',
                desc: 'Custom prompts, automated reporting, actionable summaries.',
              },
              {
                icon: '🔗',
                title: 'Full API Access',
                desc: 'Integrate with your tools. Build custom workflows.',
              },
              {
                icon: '👥',
                title: 'Team Collaboration',
                desc: 'Share insights, annotate findings, track decisions.',
              },
              {
                icon: '📈',
                title: 'Real-Time Alerts',
                desc: 'Never miss market shifts. Get notified instantly.',
              },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg hover:border-blue-500/50 transition">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-700">
          <h2 className="text-3xl font-bold mb-12 text-center">Simple, Transparent Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-slate-800/30 border border-slate-700 p-8 rounded-lg hover:border-blue-500/50 transition">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <p className="text-slate-400 mb-6">For solo entrepreneurs</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$39</span>
                <span className="text-slate-400">/month</span>
              </div>
              <button
                onClick={() => handleCheckout('price_1TAzJCCuno6snH5sqOAwrdSQ')}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold mb-6"
              >
                Get Started
              </button>
              <div className="space-y-3 text-sm">
                {[
                  '1-2 markets tracked',
                  'Basic AI insights',
                  '1 user account',
                  'CSV exports',
                  'Email support',
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro */}
            <div className="bg-gradient-to-b from-blue-900/50 to-slate-800/50 border-2 border-blue-500 p-8 rounded-lg relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <p className="text-slate-400 mb-6">For growing SMBs</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-slate-400">/month</span>
              </div>
              <button
                onClick={() => handleCheckout('price_1TAzZRCuno6snH5sgeOvnYSG')}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold mb-6"
              >
                Start Free Trial
              </button>
              <div className="space-y-3 text-sm">
                {[
                  '5-10 markets tracked',
                  'Advanced AI prompts',
                  '3 user accounts',
                  'CSV + API access',
                  'Auto-generated reports',
                  'Priority support',
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-800/30 border border-slate-700 p-8 rounded-lg hover:border-blue-500/50 transition">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-slate-400 mb-6">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <button className="w-full border border-blue-600 hover:bg-blue-600/20 py-2 rounded font-semibold mb-6">
                Contact Sales
              </button>
              <div className="space-y-3 text-sm">
                {[
                  'Unlimited markets',
                  'White-label option',
                  'Full API + webhooks',
                  'Unlimited users',
                  'Custom integrations',
                  'Dedicated support',
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-700 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to automate your research?</h2>
          <p className="text-slate-300 mb-8">Start free. No credit card required.</p>
          <button
            onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
            className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold"
          >
            Choose Your Plan
          </button>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-700 bg-slate-900/50 py-8 px-6">
          <div className="max-w-6xl mx-auto text-center text-slate-400 text-sm">
            <p>&copy; 2026 vervix. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
