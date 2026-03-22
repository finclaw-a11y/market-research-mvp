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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes slideArrow {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .pulse-button {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .arrow-slide {
          display: inline-block;
          animation: slideArrow 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Navigation */}
        <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold">
              <span style={{ color: '#00D9FF' }}>ver</span><span style={{ color: '#9333EA' }}>vix</span>
            </div>
            <div className="flex gap-8">
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition">How It Works</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition">Pricing</a>
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
            
            {/* Trust Signals */}
            <div className="flex justify-center gap-6 pt-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: '#00D9FF' }}>✓</span>
                <span>Data Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: '#00D9FF' }}>✓</span>
                <span>HTTPS Secure</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span style={{ color: '#00D9FF' }}>✓</span>
                <span>AI-Powered by Claude</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-6">
              <button
                onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
                className="pulse-button px-8 py-4 rounded-lg font-semibold text-lg transition hover:shadow-lg"
                style={{ backgroundColor: '#00D9FF', color: '#0F1A1F' }}
              >
                Get Your First Insights Free <span className="arrow-slide">→</span>
              </button>
              <button className="border px-8 py-4 rounded-lg font-semibold transition hover:bg-slate-800"
                style={{ borderColor: '#00D9FF', color: '#00D9FF' }}>
                Book Demo
              </button>
            </div>
          </div>
        </section>

        {/* Product Journey - HOW IT WORKS */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-700">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Upload CSV',
                desc: 'Drop your market data, competitor intel, or customer feedback in seconds.',
                icon: '📤'
              },
              {
                step: '2',
                title: 'AI Analyzes',
                desc: 'Our Claude AI engine processes your data and identifies patterns instantly.',
                icon: '🤖'
              },
              {
                step: '3',
                title: 'Get Insights',
                desc: 'Receive actionable insights, recommendations, and strategic intelligence.',
                icon: '💡'
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-center">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="text-5xl font-bold mb-4" style={{ color: '#00D9FF' }}>
                    {item.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-300 text-sm">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/3 -right-4 text-3xl" style={{ color: '#9333EA' }}>→</div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-12 p-8 rounded-lg" style={{ backgroundColor: '#1A2A35', borderLeft: '4px solid #00D9FF' }}>
            <p className="text-slate-300">
              <strong style={{ color: '#00D9FF' }}>Real Example:</strong> Upload a CSV with competitor pricing data, and Vervix analyzes market gaps, pricing strategies, and opportunities—in 2 minutes instead of 2 weeks.
            </p>
          </div>
        </section>

        {/* Social Proof */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-700">
          <h2 className="text-3xl font-bold mb-12 text-center">Trusted by Market Leaders</h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-slate-800/50 p-8 rounded-lg text-center border border-slate-700">
              <div className="text-4xl font-bold mb-2" style={{ color: '#00D9FF' }}>2,400+</div>
              <p className="text-slate-300">Markets Analyzed</p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-lg text-center border border-slate-700">
              <div className="text-4xl font-bold mb-2" style={{ color: '#9333EA' }}>18,500+</div>
              <p className="text-slate-300">Insights Generated</p>
            </div>
            <div className="bg-slate-800/50 p-8 rounded-lg text-center border border-slate-700">
              <div className="text-4xl font-bold mb-2" style={{ color: '#00D9FF' }}>127K+</div>
              <p className="text-slate-300">Hours Saved</p>
            </div>
          </div>

          {/* Competitive Comparison */}
          <div className="bg-slate-800/30 p-8 rounded-lg border border-slate-700">
            <h3 className="text-xl font-bold mb-6 text-center">Why Vervix Wins</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Quantilope</th>
                    <th className="text-center py-3 px-4">Attest</th>
                    <th className="text-center py-3 px-4" style={{ color: '#00D9FF' }}>Vervix</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Price/Month', quantilope: '$2,500+', attest: '$999+', vervix: '$39' },
                    { feature: 'Setup Time', quantilope: '2 weeks', attest: '5 days', vervix: '2 min' },
                    { feature: 'CSV Upload', quantilope: '❌', attest: '⚠️', vervix: '✓' },
                    { feature: 'AI Insights', quantilope: '✓', attest: '✓', vervix: '✓' },
                    { feature: 'API Access', quantilope: '❌', attest: '❌', vervix: '✓' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-700">
                      <td className="py-3 px-4 font-semibold">{row.feature}</td>
                      <td className="text-center py-3 px-4 text-slate-400">{row.quantilope}</td>
                      <td className="text-center py-3 px-4 text-slate-400">{row.attest}</td>
                      <td className="text-center py-3 px-4" style={{ color: '#00D9FF', fontWeight: 'bold' }}>{row.vervix}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Why Choose Vervix */}
        <section className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-700">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose Vervix</h2>
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

        {/* Pricing - REDESIGNED */}
        <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 border-t border-slate-700">
          <h2 className="text-3xl font-bold mb-4 text-center">Simple, Transparent Pricing</h2>
          <p className="text-center text-slate-300 mb-12">In just 2 minutes, save 5+ hours of research</p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
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
                className="w-full py-2 rounded font-semibold mb-6 transition"
                style={{ backgroundColor: '#00D9FF', color: '#0F1A1F' }}
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
                    <span style={{ color: '#00D9FF' }}>✓</span>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro - HIGHLIGHTED */}
            <div className="relative md:scale-105 md:z-10">
              <div className="bg-gradient-to-b from-blue-900/50 to-slate-800/50 border-2 p-8 rounded-lg"
                style={{ borderColor: '#00D9FF' }}>
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: '#00D9FF', color: '#0F1A1F' }}>
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
                  className="w-full py-3 rounded font-semibold mb-6 transition shadow-lg pulse-button"
                  style={{ backgroundColor: '#00D9FF', color: '#0F1A1F' }}
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
                      <span style={{ color: '#00D9FF' }}>✓</span>
                      <span className="text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enterprise */}
            <div className="bg-slate-800/30 border border-slate-700 p-8 rounded-lg hover:border-blue-500/50 transition">
              <h3 className="text-xl font-bold mb-2">Enterprise</h3>
              <p className="text-slate-400 mb-6">For large organizations</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">Custom</span>
              </div>
              <button className="w-full border-2 py-2 rounded font-semibold mb-6 transition"
                style={{ borderColor: '#00D9FF', color: '#00D9FF' }}>
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
                    <span style={{ color: '#9333EA' }}>✓</span>
                    <span className="text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="bg-slate-800/30 p-8 rounded-lg border border-slate-700">
            <h3 className="text-lg font-bold mb-6 text-center">Feature Comparison</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4">Feature</th>
                    <th className="text-center py-3 px-4">Starter</th>
                    <th className="text-center py-3 px-4" style={{ color: '#00D9FF' }}>Pro</th>
                    <th className="text-center py-3 px-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: 'Markets Tracked', starter: '1-2', pro: '5-10', enterprise: 'Unlimited' },
                    { feature: 'Users', starter: '1', pro: '3', enterprise: 'Unlimited' },
                    { feature: 'API Access', starter: '❌', pro: '✓', enterprise: '✓' },
                    { feature: 'Auto Reports', starter: '❌', pro: '✓', enterprise: '✓' },
                    { feature: 'White Label', starter: '❌', pro: '❌', enterprise: '✓' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-700">
                      <td className="py-3 px-4 font-semibold">{row.feature}</td>
                      <td className="text-center py-3 px-4">{row.starter}</td>
                      <td className="text-center py-3 px-4" style={{ color: '#00D9FF', fontWeight: 'bold' }}>{row.pro}</td>
                      <td className="text-center py-3 px-4">{row.enterprise}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-4xl mx-auto px-6 py-20 border-t border-slate-700 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to automate your research?</h2>
          <p className="text-slate-300 mb-8">Start free. No credit card required.</p>
          <button
            onClick={() => document.getElementById('pricing').scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 rounded-lg font-semibold text-lg transition"
            style={{ backgroundColor: '#00D9FF', color: '#0F1A1F' }}
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
