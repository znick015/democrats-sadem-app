import React, { useState, useEffect } from 'react';
import { bridgeApi, PhoneLocalesEvent } from './lib/bridge';
import ptBR from './locales/pt-BR.json';
import en from './locales/en.json';

const translations: Record<string, typeof ptBR> = {
  'pt-BR': ptBR,
  'en': en
};

export default function App() {
  const [locale, setLocale] = useState<'pt-BR' | 'en'>('pt-BR');
  const [currentTab, setCurrentTab] = useState<'news' | 'events' | 'donate' | 'join'>('news');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(250);

  const t = translations[locale] || translations['en'];

  useEffect(() => {
    function handlePushedMessages(event: MessageEvent) {
      const data = event.data;
      if (!data) return;

      if (data.type === 'united:phone:locales') {
        const lang = data.languageUi === 'pt-BR' ? 'pt-BR' : 'en';
        setLocale(lang);
      }
    }

    window.addEventListener('message', handlePushedMessages);

    bridgeApi.getLocales().then((res: PhoneLocalesEvent) => {
      if (res && res.languageUi) {
        setLocale(res.languageUi === 'pt-BR' ? 'pt-BR' : 'en');
      }
    }).catch(() => {});

    return () => window.removeEventListener('message', handlePushedMessages);
  }, []);

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSetWaypoint = async (x: number, y: number) => {
    const res = await bridgeApi.setWaypoint(x, y);
    if (res.ok) {
      triggerFeedback(t.events.waypointSet);
    } else {
      triggerFeedback(t.events.failedWaypoint);
    }
  };

  const handleDonate = async () => {
    const mockTransactionId = `01J${crypto.randomUUID().replace(/-/g, '').slice(0, 20).toUpperCase()}`;
    const res = await bridgeApi.openPay(mockTransactionId);
    
    if (res.ok) {
      triggerFeedback(t.donations.payInitiated);
    } else {
      triggerFeedback(t.donations.payFailed);
    }
  };

  const handleCopyInvite = async () => {
    const inviteLink = "https://discord.gg/SADEM-LOS-SANTOS";
    const res = await bridgeApi.copyText(inviteLink);
    if (res.ok) {
      triggerFeedback(t.join.copied);
    }
  };

  return (
    <main className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans select-none overflow-x-hidden pb-20">
      <header className="p-4 bg-slate-900 border-b border-blue-900/40 flex items-center gap-3 sticky top-0 z-20 shadow-md">
        <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center font-black text-xl text-white shadow-md">
          D
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white leading-tight">{t.appName}</h1>
          <p className="text-xs text-blue-400 font-medium">{t.partyName}</p>
        </div>
      </header>

      {feedbackMsg && (
        <aside aria-live="polite" className="mx-4 mt-3 p-3 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-lg text-center transition-all">
          {feedbackMsg}
        </aside>
      )}

      <section className="p-4 flex-1">
        {currentTab === 'news' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">{t.news.title}</h2>
            
            <article className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-medium text-blue-400">{t.news.article1_tag}</span>
              <h3 className="text-base font-bold text-white">{t.news.article1_title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{t.news.article1_desc}</p>
            </article>

            <article className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <span className="text-xs font-medium text-blue-400">{t.news.article2_tag}</span>
              <h3 className="text-base font-bold text-white">{t.news.article2_title}</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{t.news.article2_desc}</p>
            </article>
          </div>
        )}

        {currentTab === 'events' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">{t.events.title}</h2>
            
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <div>
                <h3 className="text-base font-bold text-white">{t.events.event1_title}</h3>
                <p className="text-xs text-slate-400">{t.events.event1_place}</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.events.event1_desc}
              </p>
              <button 
                onClick={() => handleSetWaypoint(-280.4, -720.1)}
                className="w-full py-3 bg-blue-700 hover:bg-blue-600 active:scale-95 text-white font-semibold text-sm rounded-lg transition-all"
              >
                {t.events.setWaypoint}
              </button>
            </div>
          </div>
        )}

        {currentTab === 'donate' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">{t.donations.title}</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.donations.desc}</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">{t.donations.selectAmount}</label>
              <div className="grid grid-cols-3 gap-2">
                {[100, 250, 500].map((val) => (
                  <button
                    key={val}
                    onClick={() => setSelectedAmount(val)}
                    className={`py-3 text-sm font-bold rounded-lg border transition-all ${
                      selectedAmount === val 
                        ? 'bg-blue-600 border-blue-400 text-white' 
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDonate}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm rounded-xl shadow-lg transition-all"
            >
              {t.donations.btnPay} (${selectedAmount})
            </button>
          </div>
        )}

        {currentTab === 'join' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
              <h2 className="text-base font-bold text-white">{t.join.title}</h2>
              <div className="text-xs text-slate-400 border-b border-slate-800 pb-3">
                <span className="text-slate-500">{t.join.chair}</span>{' '}
                <strong className="text-slate-200">{t.join.chairName}</strong>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t.join.desc}
              </p>
              <button
                onClick={handleCopyInvite}
                className="w-full py-3 bg-blue-700 hover:bg-blue-600 active:scale-95 text-white font-semibold text-sm rounded-lg transition-all"
              >
                {t.join.copyDiscord}
              </button>
            </div>
          </div>
        )}
      </section>

      <nav aria-label="Navegação inferior" className="fixed bottom-0 left-0 right-0 h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 z-20">
        {[
          { id: 'news', label: t.tabs.news },
          { id: 'events', label: t.tabs.events },
          { id: 'donate', label: t.tabs.donate },
          { id: 'join', label: t.tabs.join }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as typeof currentTab)}
            className={`flex flex-col items-center justify-center w-full h-full text-xs font-semibold transition-colors ${
              currentTab === tab.id ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-sm uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}