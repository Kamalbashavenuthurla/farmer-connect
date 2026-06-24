import { useState, useEffect, useRef } from 'react'
import api, { API_URL } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Send, MessageCircle } from 'lucide-react'

export default function MessagesPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [activeUser, setActiveUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef()

  useEffect(() => { api.get('/messages/conversations').then(r => setConversations(r.data.conversations)) }, [])
  useEffect(() => {
    if (activeUser) api.get(`/messages/${activeUser.id}`).then(r => setMessages(r.data.messages))
  }, [activeUser])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await api.post('/messages/', { receiver_id: activeUser.id, content: text })
    setText('')
    const r = await api.get(`/messages/${activeUser.id}`)
    setMessages(r.data.messages)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><MessageCircle size={24} />Messages</h1>
      <div className="flex gap-0 border border-gray-200 rounded-xl overflow-hidden h-[600px]">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-gray-200 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-sm">No conversations yet</div>
          ) : conversations.map(c => (
            <button key={c.user.id} onClick={() => setActiveUser(c.user)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${activeUser?.id === c.user.id ? 'bg-green-50' : ''}`}>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {c.user.profile_photo ? <img src={`${API_URL}${c.user.profile_photo}`} alt="" className="w-full h-full object-cover" /> : <span className="text-green-600 font-bold text-sm">{c.user.name[0]}</span>}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{c.user.name}</div>
                <div className="text-xs text-gray-400 truncate">{c.last_message}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat */}
        {activeUser ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">{activeUser.name[0]}</span>
              </div>
              <span className="font-semibold">{activeUser.name}</span>
              <span className="text-xs text-gray-400 capitalize">({activeUser.role})</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${m.sender_id === user.id ? 'bg-green-600 text-white rounded-br-sm' : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="p-4 border-t border-gray-100 flex gap-3 bg-white">
              <input className="input-field flex-1" placeholder="Type a message..." value={text} onChange={e => setText(e.target.value)} />
              <button type="submit" className="btn-primary px-4"><Send size={18} /></button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center"><MessageCircle size={48} className="mx-auto mb-3 text-gray-200" /><p>Select a conversation</p></div>
          </div>
        )}
      </div>
    </div>
  )
}
