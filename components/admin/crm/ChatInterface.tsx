'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MoreVertical, Send, Paperclip, Phone, Video, Smile, Check, CheckCheck } from 'lucide-react'
import Image from 'next/image'

// Mock Data for "Free API" Simulation
const MOCK_CHATS = [
    { id: 1, name: 'João Silva', lastMessage: 'Tem horário para quinta?', time: '14:30', unread: 2, avatar: 'JS' },
    { id: 2, name: 'Maria Souza', lastMessage: 'Já fiz o pix do sinal!', time: '13:15', unread: 0, avatar: 'MS' },
    { id: 3, name: 'Carlos Tattoo', lastMessage: 'Vou precisar remarcar', time: 'Ontem', unread: 0, avatar: 'CT' },
]

const MOCK_MESSAGES = [
    { id: 1, text: 'Olá, gostaria de fazer um orçamento.', sender: 'client', time: '14:20' },
    { id: 2, text: 'Claro! Pode me mandar a referência?', sender: 'me', time: '14:22', status: 'read' },
    { id: 3, text: 'Segue a foto...', sender: 'client', time: '14:25' },
    { id: 4, text: 'Tem horário para quinta?', sender: 'client', time: '14:30' },
]

export default function ChatInterface() {
    const [selectedChat, setSelectedChat] = useState<number | null>(null)
    const [messages, setMessages] = useState(MOCK_MESSAGES)
    const [input, setInput] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, selectedChat])

    const handleSend = () => {
        if (!input.trim()) return

        const newMessage = {
            id: Date.now(),
            text: input,
            sender: 'me',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent'
        }

        setMessages([...messages, newMessage])
        setInput('')

        // Mock Auto-Reply
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: 'Isso é uma resposta automática do Z-API Mock! 🤖',
                sender: 'client',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
        }, 2000)
    }

    return (
        <div className="h-[calc(100vh-140px)] bg-[#111b21] rounded-2xl overflow-hidden flex shadow-2xl border border-white/5">
            {/* Sidebar (Chat List) */}
            <div className="w-[350px] bg-[#111b21] border-r border-white/10 flex flex-col">
                {/* Header */}
                <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <UserIcon name="Me" />
                    </div>
                    <div className="flex gap-4 text-[#aebac1]">
                        <button><MoreVertical size={20} /></button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-2 border-b border-white/5">
                    <div className="bg-[#202c33] rounded-lg flex items-center px-3 py-1.5">
                        <Search size={18} className="text-[#aebac1] mr-3" />
                        <input
                            placeholder="Pesquisar ou começar nova conversa"
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-[#aebac1]"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {MOCK_CHATS.map(chat => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat.id)}
                            className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-[#202c33] transition-colors group ${selectedChat === chat.id ? 'bg-[#2a3942]' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple font-bold text-lg flex-shrink-0">
                                {chat.avatar}
                            </div>
                            <div className="flex-1 min-w-0 border-b border-white/5 pb-3 group-hover:border-transparent">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-white font-normal truncate">{chat.name}</h3>
                                    <span className="text-xs text-[#8696a0]">{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-[#8696a0] text-sm truncate">{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <div className="w-5 h-5 rounded-full bg-neon-green text-[#111b21] flex items-center justify-center text-xs font-bold">
                                            {chat.unread}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            {selectedChat ? (
                <div className="flex-1 flex flex-col bg-[#0b141a] relative">
                    {/* Chat Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.06] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] pointer-events-none" />

                    {/* Header */}
                    <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 z-10 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center text-neon-purple font-bold">
                                {MOCK_CHATS.find(c => c.id === selectedChat)?.avatar}
                            </div>
                            <div>
                                <h3 className="text-white font-medium">{MOCK_CHATS.find(c => c.id === selectedChat)?.name}</h3>
                                <p className="text-xs text-[#8696a0]">online hoje às 14:30</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-[#aebac1]">
                            <Video size={20} />
                            <Phone size={20} />
                            <Search size={20} />
                            <MoreVertical size={20} />
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 z-10 space-y-2 custom-scrollbar">
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                                    max-w-[70%] rounded-lg p-2 px-3 text-sm relative shadow-sm
                                    ${msg.sender === 'me' ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-white rounded-tl-none'}
                                `}>
                                    <p>{msg.text}</p>
                                    <div className="flex justify-end items-center gap-1 mt-1">
                                        <span className="text-[10px] text-white/60">{msg.time}</span>
                                        {msg.sender === 'me' && (
                                            <CheckCheck size={14} className="text-[#53bdeb]" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className="h-16 bg-[#202c33] px-4 flex items-center gap-4 z-10">
                        <div className="flex gap-4 text-[#8696a0]">
                            <Smile size={24} />
                            <Paperclip size={24} />
                        </div>
                        <div className="flex-1">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Digite uma mensagem"
                                className="w-full bg-[#2a3942] rounded-lg py-2 px-4 text-white placeholder-[#8696a0] outline-none border-none focus:ring-0"
                            />
                        </div>
                        <button
                            onClick={handleSend}
                            className={`p-2 rounded-full transition-all ${input.trim() ? 'text-[#00a884]' : 'text-[#8696a0]'}`}
                        >
                            <Send size={24} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-[#222e35] flex flex-col items-center justify-center text-center border-b-[6px] border-[#00a884] z-10">
                    <h2 className="text-[#e9edef] text-3xl font-light mb-4">WhatsApp Web (Altus Ink)</h2>
                    <p className="text-[#8696a0] text-sm max-w-md">
                        Envie e receba mensagens sem precisar manter seu celular conectado. <br />
                        Use o WhatsApp em até 4 aparelhos e 1 telefone ao mesmo tempo.
                    </p>
                    <div className="mt-8 flex gap-2 text-[#8696a0] text-sm items-center">
                        <LockIcon /> Protegido com criptografia de ponta-a-ponta
                    </div>
                </div>
            )}
        </div>
    )
}

function UserIcon({ name }: { name: string }) {
    return <span className="font-bold text-white text-xs">{name}</span>
}

function LockIcon() {
    return <svg viewBox="0 0 10 12" height="10" width="10" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 10 12"><path fill="currentColor" d="M5.008,1.605c1.474,0,2.671,1.197,2.671,2.671v1.51H2.337v-1.51C2.337,2.802,3.534,1.605,5.008,1.605 M8.995,5.922h-0.373v-1.64c0-1.996-1.618-3.614-3.614-3.614S1.394,2.286,1.394,4.282v1.64H1.021 C0.457,5.923,0,6.38,0,6.944v4.035C0,11.543,0.457,12,1.021,12h7.974c0.564,0,1.021-0.457,1.021-1.021V6.944 C10.016,6.38,9.559,5.922,8.995,5.922z M5.008,10.021c-0.812,0-1.471-0.658-1.471-1.471c0-0.812,0.658-1.471,1.471-1.471 c0.813,0,1.471,0.658,1.471,1.471C6.479,9.363,5.821,10.021,5.008,10.021z"></path></svg>
}
