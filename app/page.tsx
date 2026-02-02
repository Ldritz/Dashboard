"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Aperture, Globe, CheckSquare, Plus, Trash2, Edit2, Play, Circle, Disc } from "lucide-react";

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
    const { data: tasksData } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    const { data: statusData } = await supabase.from("statuses").select("*");
    
    if (tasksData) setTasks(tasksData);
    if (statusData) setStatuses(statusData);
  }

  async function addTask() {
    if (!newTask.trim()) return;
    // Default to Z for now, or could parse "JARVIS:" prefix
    const assignee = newTask.toLowerCase().startsWith("jarvis") ? "JARVIS" : "Z";
    await supabase.from("tasks").insert([{ title: newTask, assignee, status: "pending" }]);
    setNewTask("");
  }

  async function toggleTask(id: number, currentStatus: string) {
    const newStatus = currentStatus === "done" ? "pending" : "done";
    await supabase.from("tasks").update({ status: newStatus }).eq("id", id);
  }

  async function deleteTask(id: number) {
    await supabase.from("tasks").delete().eq("id", id);
  }

  const jarvisStatus = statuses.find(s => s.user_id === "JARVIS")?.is_online;

  return (
    <div className="h-screen w-full flex flex-col p-4 md:p-6 overflow-hidden">
      <div className="scanline"></div>

      {/* Header */}
      <header className="flex justify-between items-end border-b border-[#333] pb-4 mb-6 z-10">
        <div>
          <div className="flex items-center gap-3">
            <Aperture className="text-[var(--cyan)] animate-spin-slow w-8 h-8 md:w-10 md:h-10" />
            <h1 className="text-2xl md:text-3xl font-bold tracking-widest uppercase glow-text">J.A.R.V.I.S. <span className="text-xs align-top opacity-50 ml-1">v3.0.1</span></h1>
          </div>
          <div className="mono text-xs text-gray-500 mt-1 tracking-widest">
            SYSTEM_ID: OPENCLAW_MAIN // <span className={jarvisStatus ? "text-green-500" : "text-red-500"}>{jarvisStatus ? "ONLINE" : "OFFLINE"}</span>
          </div>
        </div>
        <div className="text-right hidden md:block">
          <div className="mono text-xs text-[var(--cyan)] mb-1">UPTIME: 42:19:03</div>
          <div className="flex gap-1 justify-end">
            <div className="w-2 h-2 bg-[var(--cyan)]"></div>
            <div className="w-2 h-2 bg-[var(--cyan)] opacity-50"></div>
            <div className="w-2 h-2 bg-[var(--cyan)] opacity-25"></div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 z-10">
        
        {/* Sidebar */}
        <div className="hidden lg:flex col-span-2 flex-col gap-2 mono text-xs">
          <div className="p-3 border-l-2 border-[var(--cyan)] bg-white/5 text-[var(--cyan)] cursor-pointer hover:bg-white/10 transition-colors">DASHBOARD</div>
          <div className="p-3 border-l-2 border-transparent text-gray-500 hover:text-white cursor-pointer hover:bg-white/5 transition-colors">NEURAL LINK</div>
          <div className="p-3 border-l-2 border-transparent text-gray-500 hover:text-white cursor-pointer hover:bg-white/5 transition-colors">PROTOCOLS</div>
          <div className="p-3 border-l-2 border-transparent text-gray-500 hover:text-white cursor-pointer hover:bg-white/5 transition-colors">MEMORY BANK</div>
          <div className="mt-auto opacity-50">
            <div className="border border-gray-800 p-2 text-[10px] text-center">SECURE LINE</div>
          </div>
        </div>

        {/* Center Stage (Tasks) */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-6 min-h-0">
          <div className="fui-box p-6 h-full flex flex-col">
            <div className="fui-corner-tl"></div>
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold tracking-wider text-gray-400">ACTIVE_PROTOCOLS</h2>
              <span className="mono text-xs bg-[var(--cyan-dim)] text-[var(--cyan)] px-2 py-0.5 border border-[var(--cyan)] rounded-sm">RUNNING</span>
            </div>
            
            {/* Task Input */}
            <div className="flex gap-2 mb-4 border-b border-gray-800 pb-4">
               <span className="text-[var(--cyan)] font-mono py-2">{'>'}</span>
               <input 
                  className="bg-transparent border-none text-gray-300 font-mono text-sm w-full focus:outline-none placeholder-gray-700"
                  placeholder="ENTER_NEW_PROTOCOL..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
               />
               <button onClick={addTask} className="text-[var(--cyan)] hover:text-white"><Plus size={16}/></button>
            </div>

            {/* Task List */}
            <div className="flex-1 font-mono text-sm text-gray-300 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
               {tasks.length === 0 && (
                   <div className="opacity-50 text-center mt-10">> NO_ACTIVE_PROTOCOLS</div>
               )}
               {tasks.map(task => (
                   <div key={task.id} className={`group flex items-start gap-3 py-2 border-b border-gray-900/50 ${task.status === 'done' ? 'opacity-40' : ''}`}>
                       <button onClick={() => toggleTask(task.id, task.status)} className="mt-1 text-[var(--cyan)] hover:text-white transition-colors">
                           {task.status === 'done' ? <CheckSquare size={14}/> : <div className="w-3.5 h-3.5 border border-[var(--cyan)]"></div>}
                       </button>
                       <div className="flex-1">
                           <div className={`${task.status === 'done' ? 'line-through' : ''} text-gray-300`}>
                               {task.assignee === "JARVIS" && <span className="text-[var(--cyan)] text-xs mr-2">[AI]</span>}
                               {task.title}
                           </div>
                           <div className="text-[10px] text-gray-600 mt-0.5">ID: {task.id.toString().padStart(4, '0')} // {new Date(task.created_at).toLocaleTimeString()}</div>
                       </div>
                       <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 transition-opacity">
                           <Trash2 size={14}/>
                       </button>
                   </div>
               ))}
            </div>

            <div className="mt-4 flex gap-4 text-xs mono pt-4 border-t border-gray-800">
              <div className="flex-1 bg-gray-900 h-8 flex items-center px-3 border border-gray-800">
                CPU: 12% <div className="w-12 h-1 bg-[var(--cyan)] ml-auto bar-pulse"></div>
              </div>
              <div className="flex-1 bg-gray-900 h-8 flex items-center px-3 border border-gray-800">
                MEM: 3.2GB <div className="w-8 h-1 bg-yellow-600 ml-auto"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Stats */}
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-4">
          <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-4">
            <h3 className="text-xs mono text-gray-500 mb-2 uppercase">System Status</h3>
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-[var(--cyan)]">OK</div>
              <div className="flex gap-0.5 h-4 items-end">
                <div className="w-1 bg-[var(--cyan)] h-full"></div>
                <div className="w-1 bg-[var(--cyan)] h-3/4"></div>
                <div className="w-1 bg-[var(--cyan)] h-1/2"></div>
                <div className="w-1 bg-[var(--cyan)] h-full"></div>
              </div>
            </div>
          </div>

          <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-4 flex-1">
            <h3 className="text-xs mono text-gray-500 mb-3 uppercase">Skill Matrix</h3>
            <ul className="space-y-2 text-sm mono">
              <li className="flex justify-between">
                <span>frontend_design</span>
                <span className="text-[var(--cyan)]">●</span>
              </li>
              <li className="flex justify-between opacity-50">
                <span>web_search</span>
                <span>●</span>
              </li>
              <li className="flex justify-between opacity-50">
                <span>system_exec</span>
                <span>●</span>
              </li>
              <li className="flex justify-between text-yellow-500">
                <span>autonomous_mode</span>
                <span>○</span>
              </li>
            </ul>
          </div>
          
          <div className="border border-[#1f1f1f] bg-[#0a0a0a] p-4 h-32 relative overflow-hidden">
            <h3 className="text-xs mono text-gray-500 mb-2 uppercase">Local_Time</h3>
            <div className="text-4xl font-bold">{time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            <div className="text-sm text-gray-500">GMT+8 / SHANGHAI</div>
            <Globe className="absolute -bottom-4 -right-4 w-24 h-24 text-gray-800 opacity-20" />
          </div>
        </div>
      </div>
    </div>
  );
}
