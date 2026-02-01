"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Activity, CheckCircle, Clock, Plus, Trash2, User, Bot, RefreshCw, Cpu, Shield, Zap } from "lucide-react";

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

  // Initial fetch
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
    <div className="min-h-screen bg-black text-cyan-500 font-mono p-6 md:p-12 selection:bg-cyan-500/30 selection:text-cyan-100 overflow-hidden relative">
      {/* BACKGROUND GRID */}
      <div className="fixed inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>
      
      {/* RADIAL GLOW */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <header className="relative mb-12 flex items-center justify-between border-b border-cyan-900/50 pb-6 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse"></div>
            <div className="absolute inset-0 h-4 w-4 rounded-full border border-cyan-200 opacity-50 animate-ping"></div>
          </div>
          <h1 className="text-3xl font-bold tracking-[0.2em] text-cyan-100 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            JARVIS <span className="text-cyan-600 text-lg align-top opacity-80">MK.II</span>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-cyan-600 font-bold tracking-widest">
          <span className="flex items-center gap-2">
            <Clock size={12} /> {new Date().toLocaleTimeString().toUpperCase()}
          </span>
          <span className="flex items-center gap-2 text-emerald-400">
            <Activity size={12} /> SYSTEMS NOMINAL
          </span>
          <span className="flex items-center gap-2">
             SECURE CONNECTION ESTABLISHED
          </span>
        </div>
      </header>

      <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-2 z-10">
        {/* STATUS MODULES */}
        <section className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Z Status */}
           <div className="relative group overflow-hidden rounded-sm border border-cyan-900/50 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-cyan-500/50">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-none border ${zStatus.is_online ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-neutral-800 bg-neutral-900/50 text-neutral-600'}`}>
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-cyan-700">OPERATOR // Z</h3>
                    <p className="text-xs text-neutral-500 mt-1">ID: 5354-8469-28</p>
                  </div>
                </div>
                <div className={`h-2 w-2 rounded-full ${zStatus.is_online ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-neutral-800'}`}></div>
              </div>
              <div className="border-t border-cyan-900/30 pt-4">
                <p className="text-xl font-light text-cyan-100 tracking-wide uppercase">"{zStatus.status_text}"</p>
              </div>
           </div>

           {/* JARVIS Status */}
           <div className="relative group overflow-hidden rounded-sm border border-cyan-900/50 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-cyan-500/50">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-none border border-cyan-500 bg-cyan-500/10 text-cyan-400">
                    <Bot size={24} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold tracking-widest text-cyan-700">SYSTEM // JARVIS</h3>
                    <p className="text-xs text-neutral-500 mt-1">V 2.4.0 // ACTIVE</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
              </div>
              <div className="border-t border-cyan-900/30 pt-4">
                <p className="text-xl font-light text-cyan-100 tracking-wide uppercase">"{jarvisStatus.status_text}"</p>
              </div>
           </div>
        </section>

        {/* TASKS: Z */}
        <section className="relative rounded-sm border border-cyan-900/30 bg-black/60 p-6 backdrop-blur-sm">
          <div className="absolute -top-3 left-4 bg-black px-2 text-xs font-bold tracking-widest text-cyan-600 border border-cyan-900/50">
            TASK_LIST // Z
          </div>
          <div className="mb-6 flex items-center justify-between">
            <span className="text-[10px] text-cyan-800 uppercase tracking-widest">Pending Protocols: {tasks.filter(t => t.assignee === "Z" && t.status !== "done").length}</span>
          </div>
          
          <div className="space-y-2">
            {tasks.filter(t => t.assignee === "Z").map(task => (
              <div key={task.id} className="group relative flex items-center justify-between border-l-2 border-l-neutral-800 bg-neutral-900/20 p-3 hover:bg-cyan-900/10 hover:border-l-cyan-500 transition-all">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(task.id, task.status)} className={`transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-neutral-600 hover:text-cyan-400'}`}>
                    {task.status === 'done' ? <CheckCircle size={18} /> : <div className="h-4 w-4 border border-current rounded-sm"></div>}
                  </button>
                  <span className={`text-sm tracking-wide ${task.status === 'done' ? 'text-neutral-600 line-through' : 'text-cyan-100'}`}>
                    {task.title}
                  </span>
                </div>
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500 transition-opacity">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {tasks.filter(t => t.assignee === "Z").length === 0 && (
                <div className="text-center py-4 text-xs text-cyan-900 italic">NO ACTIVE PROTOCOLS ASSIGNED</div>
            )}
          </div>
        </section>

        {/* TASKS: JARVIS */}
        <section className="relative rounded-sm border border-cyan-900/30 bg-black/60 p-6 backdrop-blur-sm">
          <div className="absolute -top-3 left-4 bg-black px-2 text-xs font-bold tracking-widest text-cyan-600 border border-cyan-900/50">
            PROTOCOL_QUEUE // JARVIS
          </div>
          <div className="mb-6 flex items-center justify-between">
             <span className="text-[10px] text-cyan-800 uppercase tracking-widest">Processing: {tasks.filter(t => t.assignee === "JARVIS" && t.status !== "done").length}</span>
          </div>
          
          <div className="space-y-2">
            {tasks.filter(t => t.assignee === "JARVIS").map(task => (
              <div key={task.id} className="group relative flex items-center justify-between border-l-2 border-l-cyan-900/50 bg-cyan-950/10 p-3 hover:bg-cyan-900/20 hover:border-l-cyan-400 transition-all">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(task.id, task.status)} className={`transition-colors ${task.status === 'done' ? 'text-cyan-500' : 'text-cyan-700 hover:text-cyan-400'}`}>
                     {task.status === 'done' ? <CheckCircle size={18} /> : <Cpu size={18} />}
                  </button>
                  <span className={`text-sm tracking-wide ${task.status === 'done' ? 'text-cyan-800 line-through' : 'text-cyan-200'}`}>
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                    {task.status === 'in_progress' && <span className="text-[10px] text-amber-500 animate-pulse">PROCESSING</span>}
                    <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-cyan-800 hover:text-red-500 transition-opacity">
                    <Trash2 size={14} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-0 left-0 w-full border-t border-cyan-900/50 bg-black/90 p-4 md:p-6 backdrop-blur-md z-20">
        <div className="mx-auto flex max-w-4xl gap-4">
          <div className="relative">
             <select 
                value={assignee} 
                onChange={(e) => setAssignee(e.target.value as "Z" | "JARVIS")}
                className="appearance-none rounded-none bg-black border border-cyan-800 px-6 py-3 text-sm text-cyan-400 focus:outline-none focus:border-cyan-400 uppercase tracking-widest"
             >
                <option value="Z">TARGET: Z</option>
                <option value="JARVIS">TARGET: JARVIS</option>
             </select>
             <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-800">▼</div>
          </div>
          
          <div className="flex-1 relative group">
            <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
                placeholder="ENTER COMMAND OR PROTOCOL..."
                className="w-full rounded-none bg-black border border-cyan-900/50 px-4 py-3 text-sm text-cyan-100 placeholder-cyan-900 focus:outline-none focus:border-cyan-500 focus:bg-cyan-950/10 transition-all uppercase tracking-wider"
            />
            <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-cyan-400 transition-all group-focus-within:w-full"></div>
          </div>

          <button 
            onClick={addTask}
            className="flex items-center gap-2 rounded-none bg-cyan-900/20 border border-cyan-500/50 px-6 py-3 text-sm font-bold text-cyan-400 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_15px_#22d3ee] transition-all tracking-widest"
          >
            <Plus size={16} /> EXECUTE
          </button>
        </div>
      </div>
    </div>
  );
}
