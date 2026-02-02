"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "./supabase";
import { Activity, CheckCircle, Clock, Plus, Trash2, Edit2, User, Bot, RefreshCw, Cpu, Shield, Zap, Save, X, Globe, Terminal, Wifi, Battery, Server, Eye, EyeOff } from "lucide-react";
import JarvisCore from "./JarvisCore";

type Task = {
  id: number;
  title: string;
  assignee: "Z" | "JARVIS";
  status: "pending" | "in_progress" | "done";
  created_at: string;
};

type Status = {
  id: number;
  user_id: "Z" | "JARVIS";
  status_text: string;
  is_online: boolean;
  updated_at: string;
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [newTask, setNewTask] = useState("");
  const [assignee, setAssignee] = useState<"Z" | "JARVIS">("Z");
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const [time, setTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Data Sync
  useEffect(() => {
    fetchData();

    const taskChannel = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .subscribe();

    const statusChannel = supabase
      .channel('public:statuses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'statuses' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(taskChannel);
      supabase.removeChannel(statusChannel);
    };
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: tasksData } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    const { data: statusData } = await supabase.from("statuses").select("*");
    
    if (tasksData) setTasks(tasksData);
    if (statusData) setStatuses(statusData);
    setLoading(false);
  }

  async function addTask() {
    if (!newTask.trim()) return;
    await supabase.from("tasks").insert([{ title: newTask, assignee, status: "pending" }]);
    setNewTask("");
    fetchData(); 
  }

  async function startEditing(task: Task) {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  }

  async function saveTask(id: number) {
    if (!editingTitle.trim()) return;
    await supabase.from("tasks").update({ title: editingTitle }).eq("id", id);
    setEditingTaskId(null);
    setEditingTitle("");
    fetchData();
  }

  async function cancelEditing() {
    setEditingTaskId(null);
    setEditingTitle("");
  }

  async function toggleTask(id: number, currentStatus: string) {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", id);
    fetchData();
  }

  async function deleteTask(id: number) {
    await supabase.from("tasks").delete().eq("id", id);
    fetchData();
  }

  const zStatus = statuses.find(s => s.user_id === "Z") || { status_text: "OFFLINE", is_online: false };
  const jarvisStatus = statuses.find(s => s.user_id === "JARVIS") || { status_text: "STANDBY", is_online: true };

  return (
    <div className="min-h-screen bg-black text-cyan-500 font-mono p-4 md:p-8 pb-32 overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-100">
      
      {/* --- HUD ELEMENTS --- */}
      <div className="scanline"></div>
      
      {/* Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)', 
             backgroundSize: '50px 50px',
             maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
           }}>
      </div>

      {/* Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none"></div>


      {/* --- HEADER --- */}
      <header className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between mb-10 border-b border-cyan-900/50 pb-4 backdrop-blur-sm">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-cyan-400 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative border border-cyan-500/50 bg-black/50 p-3 rotate-45 group-hover:rotate-90 transition-transform duration-700">
              <div className="-rotate-45 group-hover:-rotate-90 transition-transform duration-700">
                <Bot size={28} className="text-cyan-400" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 to-cyan-600 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              JARVIS
            </h1>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-cyan-600 uppercase">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              Neural Interface V2.4
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-0 flex gap-8 text-xs font-bold tracking-widest text-cyan-700">
          <div className="flex flex-col items-end">
             <span className="text-[10px] text-cyan-900 mb-1">SYSTEM TIME</span>
             <span className="text-cyan-400 text-lg tabular-nums">{time.toLocaleTimeString()}</span>
          </div>
          <div className="flex flex-col items-end hidden md:flex">
             <span className="text-[10px] text-cyan-900 mb-1">NETWORK</span>
             <span className="flex items-center gap-2 text-emerald-500"><Wifi size={14}/> SECURE</span>
          </div>
        </div>
      </header>


      {/* --- MAIN DASHBOARD GRID --- */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: STATUS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* JARVIS CORE CARD */}
          <div className="relative overflow-hidden border border-cyan-500/30 bg-black/60 backdrop-blur-md p-6 group transition-all hover:border-cyan-400/60">
            <div className="absolute top-0 right-0 p-2 opacity-50"><Cpu size={16}/></div>
            
            <div className="flex flex-col items-center justify-center py-8">
               <JarvisCore /> 
               <div className="mt-6 text-center">
                 <div className="text-xs tracking-[0.2em] text-cyan-600 mb-2">CURRENT STATUS</div>
                 <div className="text-xl md:text-2xl font-bold text-cyan-100 glow-text uppercase px-4 py-2 border-x border-cyan-500/30 bg-cyan-950/20">
                    {jarvisStatus.status_text}
                 </div>
               </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-cyan-900/30 text-[10px] text-center text-cyan-700 tracking-wider">
               <div className="flex flex-col items-center gap-1">
                 <Activity size={14} className="text-cyan-500"/> CPU: 4%
               </div>
               <div className="flex flex-col items-center gap-1">
                 <Server size={14} className="text-cyan-500"/> MEM: 12%
               </div>
               <div className="flex flex-col items-center gap-1">
                 <Battery size={14} className="text-cyan-500"/> PWR: 98%
               </div>
            </div>
          </div>

          {/* USER CARD (Z) */}
          <div className="relative border border-neutral-800 bg-neutral-900/40 p-5 backdrop-blur-md transition-all hover:border-cyan-900/50">
             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                   <div className={`p-2 border ${zStatus.is_online ? 'border-emerald-500/50 bg-emerald-900/20' : 'border-neutral-700 bg-neutral-800'}`}>
                      <User size={20} className={zStatus.is_online ? "text-emerald-400" : "text-neutral-500"}/>
                   </div>
                   <div>
                      <div className="text-xs tracking-widest text-neutral-500">OPERATOR</div>
                      <div className="text-lg font-bold text-cyan-100">Z</div>
                   </div>
                </div>
                <div className={`px-2 py-1 text-[10px] font-bold tracking-wider border ${zStatus.is_online ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' : 'border-neutral-700 text-neutral-500'}`}>
                   {zStatus.is_online ? 'ONLINE' : 'OFFLINE'}
                </div>
             </div>
             <div className="text-sm text-cyan-600/80 font-mono border-l-2 border-cyan-900/50 pl-3">
                "{zStatus.status_text}"
             </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PROTOCOLS (TASKS) */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
            
            {/* TABS / HEADERS */}
            <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2">
                <div className="flex items-end gap-6">
                    <div className="text-sm font-bold tracking-[0.2em] text-cyan-400 flex items-center gap-2">
                        <Terminal size={16}/> PROTOCOLS
                    </div>
                    <div className="text-xs font-mono text-cyan-700 hidden sm:block">
                        PENDING: {tasks.filter(t => t.status !== 'done').length}
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowCompleted(!showCompleted)}
                    className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-cyan-700 hover:text-cyan-400 transition-colors uppercase"
                >
                    {showCompleted ? <EyeOff size={14}/> : <Eye size={14}/>}
                    {showCompleted ? 'HIDE ARCHIVED' : 'SHOW ARCHIVED'}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[60vh] lg:max-h-none scrollbar-thin">
                {/* JARVIS TASKS */}
                {tasks.filter(t => t.assignee === "JARVIS" && (showCompleted || t.status !== 'done')).length > 0 && (
                    <div className="space-y-2">
                        <div className="text-[10px] uppercase tracking-widest text-cyan-800 mb-2 pl-2 border-l-2 border-cyan-600">JARVIS Processing Queue</div>
                        {tasks.filter(t => t.assignee === "JARVIS" && (showCompleted || t.status !== 'done')).map(task => (
                            <TaskItem 
                                key={task.id} 
                                task={task} 
                                onToggle={toggleTask} 
                                onDelete={deleteTask}
                                onEdit={startEditing}
                                isEditing={editingTaskId === task.id}
                                editValue={editingTitle}
                                setEditValue={setEditingTitle}
                                onSave={saveTask}
                                onCancel={cancelEditing}
                            />
                        ))}
                    </div>
                )}

                {/* Z TASKS */}
                 <div className="space-y-2 mt-4">
                    <div className="text-[10px] uppercase tracking-widest text-neutral-600 mb-2 pl-2 border-l-2 border-neutral-600">Operator Objectives</div>
                    {tasks.filter(t => t.assignee === "Z" && (showCompleted || t.status !== 'done')).map(task => (
                        <TaskItem 
                            key={task.id} 
                            task={task} 
                            onToggle={toggleTask} 
                            onDelete={deleteTask}
                            onEdit={startEditing}
                            isEditing={editingTaskId === task.id}
                            editValue={editingTitle}
                            setEditValue={setEditingTitle}
                            onSave={saveTask}
                            onCancel={cancelEditing}
                        />
                    ))}
                    {tasks.filter(t => t.assignee === "Z" && (showCompleted || t.status !== 'done')).length === 0 && (
                        <div className="text-center py-8 border border-dashed border-neutral-800 text-neutral-700 text-xs tracking-widest">
                            NO OBJECTIVES ASSIGNED
                        </div>
                    )}
                 </div>
            </div>
        </div>
      </main>


      {/* --- FOOTER: COMMAND CONSOLE --- */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-cyan-900/50 p-4 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-stretch">
            
            {/* Target Select */}
            <div className="relative shrink-0">
                <select 
                    value={assignee} 
                    onChange={(e) => setAssignee(e.target.value as "Z" | "JARVIS")}
                    className="w-full h-full appearance-none bg-cyan-950/20 border border-cyan-700 text-cyan-400 pl-4 pr-10 py-3 text-xs font-bold tracking-widest focus:outline-none focus:border-cyan-400 transition-colors uppercase"
                >
                    <option value="Z">TARGET: Z</option>
                    <option value="JARVIS">TARGET: JARVIS</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-600 text-[10px]">▼</div>
            </div>

            {/* Input Field */}
            <div className="flex-1 relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-700 animate-pulse">{'>'}</div>
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTask()}
                    placeholder="ENTER COMMAND OR PROTOCOL..."
                    className="w-full bg-black/50 border border-cyan-900 text-cyan-100 pl-8 pr-4 py-3 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:bg-cyan-950/10 focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all placeholder-cyan-900/50"
                />
            </div>

            {/* Execute Button */}
            <button 
                onClick={addTask}
                className="shrink-0 bg-cyan-600 text-black font-bold text-xs tracking-[0.2em] px-8 py-3 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] active:scale-95 transition-all uppercase flex items-center justify-center gap-2"
            >
                <Plus size={14} className="stroke-[3]"/> Execute
            </button>
        </div>
      </footer>

    </div>
  );
}

// --- SUB-COMPONENTS ---

function TaskItem({ task, onToggle, onDelete, onEdit, isEditing, editValue, setEditValue, onSave, onCancel }: any) {
    const isJarvis = task.assignee === "JARVIS";
    const isDone = task.status === "done";
    
    return (
        <div className={`
            relative group flex items-center gap-4 p-4 border-l-2 transition-all duration-300
            ${isDone ? 'opacity-50 grayscale' : 'opacity-100'}
            ${isJarvis 
                ? 'bg-cyan-950/10 border-cyan-600 hover:bg-cyan-900/20' 
                : 'bg-neutral-900/30 border-neutral-600 hover:bg-neutral-800/50'}
        `}>
            {/* Status Toggle */}
            <button onClick={() => onToggle(task.id, task.status)} className={`shrink-0 transition-all ${isDone ? 'text-cyan-600' : 'text-cyan-800 hover:text-cyan-400'}`}>
                {isDone ? <CheckCircle size={20} /> : <div className="w-5 h-5 border-2 border-current rounded-sm flex items-center justify-center text-[8px]">{isJarvis ? 'AI' : ''}</div>}
            </button>

            {/* Content */}
            <div className="flex-1 font-mono text-sm relative">
                {isEditing ? (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <input 
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full bg-black border-b border-cyan-500 text-cyan-100 focus:outline-none py-1"
                            autoFocus
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') onSave(task.id);
                                if(e.key === 'Escape') onCancel();
                            }}
                        />
                         <div className="flex gap-1">
                            <button onClick={() => onSave(task.id)} className="p-1 text-emerald-500 hover:bg-emerald-950/30 rounded"><Save size={14}/></button>
                            <button onClick={onCancel} className="p-1 text-red-500 hover:bg-red-950/30 rounded"><X size={14}/></button>
                        </div>
                    </div>
                ) : (
                    <span className={`block truncate ${isDone ? 'line-through text-cyan-900' : 'text-cyan-100'}`}>
                        {task.title}
                    </span>
                )}
            </div>

            {/* Actions (Hover) */}
            {!isEditing && (
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                     <button onClick={() => onEdit(task)} className="text-cyan-700 hover:text-cyan-400 transition-colors">
                        <Edit2 size={14}/>
                    </button>
                    <button onClick={() => onDelete(task.id)} className="text-cyan-900 hover:text-red-500 transition-colors">
                        <Trash2 size={14}/>
                    </button>
                </div>
            )}

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/20"></div>
        </div>
    )
}
