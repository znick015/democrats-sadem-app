import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

// Interfaces para o TypeScript
interface News {
  id: string;
  tag: string;
  title: string;
  content: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  place: string;
  description: string;
  waypoint_x: number;
  waypoint_y: number;
  event_date: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'news' | 'events' | 'admin'>('news');
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para os formulários do Admin
  const [newPost, setNewPost] = useState({ tag: '', title: '', content: '' });
  const [newEvent, setNewEvent] = useState({ title: '', place: '', description: '', waypoint_x: '', waypoint_y: '' });

  useEffect(() => {
    async function initApp() {
      // 1. Simular ou buscar o usuário do iFruit
      // No jogo real, você usaria o bridge para pegar o account name.
      // Aqui, vamos simular a Aitana para você conseguir testar o painel.
      const currentUser = 'Aitana_Soler';

      // 2. Verificar se o usuário é administrador no Supabase
      const { data: adminData } = await supabase
        .from('admins')
        .select('ifruit_username')
        .eq('ifruit_username', currentUser)
        .single();

      if (adminData) {
        setIsAdmin(true);
      }

      // 3. Buscar Notícias e Eventos
      await fetchNews();
      await fetchEvents();
      
      setLoading(false);
    }

    initApp();
  }, []);

  const fetchNews = async () => {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (data) setNews(data);
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('created_at', { ascending: false });
    if (data) setEvents(data);
  };

  const handlePostNews = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('news').insert([newPost]);
    setNewPost({ tag: '', title: '', content: '' });
    fetchNews();
    alert('Notícia publicada com sucesso!');
  };

  const handlePostEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('events').insert([{
      ...newEvent,
      waypoint_x: parseFloat(newEvent.waypoint_x) || 0,
      waypoint_y: parseFloat(newEvent.waypoint_y) || 0,
    }]);
    setNewEvent({ title: '', place: '', description: '', waypoint_x: '', waypoint_y: '' });
    fetchEvents();
    alert('Evento publicado com sucesso!');
  };

  const setWaypoint = (x: number, y: number) => {
    // Comunicação com o Bridge do GTA United
    window.parent.postMessage({ type: 'setWaypoint', x, y }, '*');
    alert(`GPS marcado para: X: ${x}, Y: ${y}`);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-blue-900">Carregando SADEM...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans select-none overflow-hidden text-gray-800">
      {/* Header Institucional */}
      <header className="bg-blue-900 text-white p-4 shadow-md flex items-center gap-3 shrink-0">
        <img src="/icon.png" alt="SADEM Logo" className="w-10 h-10 rounded-full bg-white object-cover border-2 border-blue-400" />
        <div>
          <h1 className="text-lg font-bold leading-tight">Partido Democrata</h1>
          <p className="text-xs text-blue-200 uppercase tracking-wide">SADEM - San Andreas</p>
        </div>
      </header>

      {/* Navegação */}
      <nav className="flex bg-white shadow-sm shrink-0 border-b border-gray-200">
        <button onClick={() => setActiveTab('news')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'news' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>Notícias</button>
        <button onClick={() => setActiveTab('events')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'events' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>Eventos</button>
        {isAdmin && (
          <button onClick={() => setActiveTab('admin')} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'admin' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:bg-gray-50'}`}>Painel Admin</button>
        )}
      </nav>

      {/* Área de Conteúdo (Rolagem) */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* ABA: NOTÍCIAS */}
        {activeTab === 'news' && (
          <div className="space-y-4 pb-6">
            {news.length === 0 ? <p className="text-center text-gray-500 mt-10">Nenhuma publicação recente.</p> : null}
            {news.map((item) => (
              <article key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded mb-2 uppercase">{item.tag}</span>
                <h2 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.content}</p>
                <p className="text-xs text-gray-400 mt-3">{new Date(item.created_at).toLocaleDateString('pt-BR')} - Assessoria SADEM</p>
              </article>
            ))}
          </div>
        )}

        {/* ABA: EVENTOS */}
        {activeTab === 'events' && (
          <div className="space-y-4 pb-6">
            {events.length === 0 ? <p className="text-center text-gray-500 mt-10">Nenhum evento agendado.</p> : null}
            {events.map((event) => (
              <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-600">
                <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>
                <p className="text-sm font-semibold text-blue-700 mt-1">📍 {event.place}</p>
                <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                
                {(event.waypoint_x !== 0 && event.waypoint_y !== 0) && (
                  <button 
                    onClick={() => setWaypoint(event.waypoint_x, event.waypoint_y)}
                    className="mt-4 w-full bg-blue-50 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                  >
                    Marcar no GPS
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ABA: ADMINISTRAÇÃO (Oculta) */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6 pb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-4 border-b pb-2">Nova Notícia</h2>
              <form onSubmit={handlePostNews} className="space-y-3">
                <input required type="text" placeholder="Tag (ex: URGENTE, CAMPANHA)" className="w-full border p-2 rounded text-sm" value={newPost.tag} onChange={e => setNewPost({...newPost, tag: e.target.value})} />
                <input required type="text" placeholder="Título da Notícia" className="w-full border p-2 rounded text-sm" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
                <textarea required placeholder="Conteúdo..." className="w-full border p-2 rounded text-sm h-24" value={newPost.content} onChange={e => setNewPost({...newPost, content: e.target.value})}></textarea>
                <button type="submit" className="w-full bg-blue-700 text-white font-bold py-2 rounded-lg">Publicar Notícia</button>
              </form>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h2 className="font-bold text-gray-900 mb-4 border-b pb-2">Novo Evento</h2>
              <form onSubmit={handlePostEvent} className="space-y-3">
                <input required type="text" placeholder="Nome do Evento" className="w-full border p-2 rounded text-sm" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                <input required type="text" placeholder="Local (ex: Prefeitura de LS)" className="w-full border p-2 rounded text-sm" value={newEvent.place} onChange={e => setNewEvent({...newEvent, place: e.target.value})} />
                <textarea required placeholder="Descrição do evento..." className="w-full border p-2 rounded text-sm h-20" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                <div className="flex gap-2">
                  <input type="number" placeholder="Waypoint X" className="w-1/2 border p-2 rounded text-sm" value={newEvent.waypoint_x} onChange={e => setNewEvent({...newEvent, waypoint_x: e.target.value})} />
                  <input type="number" placeholder="Waypoint Y" className="w-1/2 border p-2 rounded text-sm" value={newEvent.waypoint_y} onChange={e => setNewEvent({...newEvent, waypoint_y: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded-lg">Agendar Evento</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}