"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { Activity, CheckCircle, Clock, Plus, Trash2, User, Bot, RefreshCw } from "lucide-react";

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

    // Real-time subscription
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
    fetchData(); // Optimistic update fallback
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

  const zStatus = statuses.find(s => s.user_id === "Z") || { status_text: "Offline", is_online: false };
  const jarvisStatus = statuses.find(s => s.user_id === "JARVIS") || { status_text: "Standby", is_online: true };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-mono p-6 md:p-12">
      <header className="mb-12 flex items-center justify-between border-b border-neutral-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-3 w-3 rounded-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"></div>
          <h1 className="text-2xl font-bold tracking-wider text-white">JARVIS / DASHBOARD</h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {new Date().toLocaleTimeString()}
          </span>
          <span className="flex items-center gap-1">
            <Activity size={14} /> SYS_NOMINAL
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* STATUS MODULES */}
        <section className="col-span-1 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Z Status */}
           <div className="relative overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${zStatus.is_online ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-800 text-neutral-500'}`}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">OPERATOR (Z)</h3>
                    <p className="text-xs text-neutral-500">ID: 5354846928</p>
                  </div>
                </div>
                <div className={`h-2 w-2 rounded-full ${zStatus.is_online ? 'bg-emerald-500' : 'bg-neutral-600'}`}></div>
              </div>
              <div className="mt-4">
                <p className="text-lg text-neutral-300">"{zStatus.status_text}"</p>
              </div>
           </div>

           {/* JARVIS Status */}
           <div className="relative overflow-hidden rounded-lg border border-cyan-900/30 bg-neutral-900/50 p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-cyan-500/10 text-cyan-500">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">SYSTEM (JARVIS)</h3>
                    <p className="text-xs text-neutral-500">v1.0.0 / ONLINE</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]"></div>
              </div>
              <div className="mt-4">
                <p className="text-lg text-neutral-300">"{jarvisStatus.status_text}"</p>
              </div>
           </div>
        </section>

        {/* TASKS: Z */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-400">PENDING TASKS // Z</h2>
            <span className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-400">
              {tasks.filter(t => t.assignee === "Z" && t.status !== "done").length} ACTIVE
            </span>
          </div>
          
          <div className="space-y-3">
            {tasks.filter(t => t.assignee === "Z").map(task => (
              <div key={task.id} className="group flex items-center justify-between rounded border border-neutral-800 bg-neutral-900 p-3 hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(task.id, task.status)} className={`rounded-full p-1 transition-colors ${task.status === 'done' ? 'text-emerald-500' : 'text-neutral-600 hover:text-neutral-400'}`}>
                    <CheckCircle size={18} className={task.status === 'done' ? 'fill-emerald-500/20' : ''} />
                  </button>
                  <span className={`${task.status === 'done' ? 'text-neutral-600 line-through' : 'text-neutral-200'}`}>
                    {task.title}
                  </span>
                </div>
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {loading && <div className="text-center text-xs text-neutral-600 animate-pulse">SYNCING...</div>}
          </div>
        </section>

        {/* TASKS: JARVIS */}
        <section className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-bold text-cyan-500/80">PROTOCOL QUEUE // JARVIS</h2>
            <span className="rounded bg-cyan-900/20 px-2 py-0.5 text-xs text-cyan-500">
              {tasks.filter(t => t.assignee === "JARVIS" && t.status !== "done").length} ACTIVE
            </span>
          </div>
          
          <div className="space-y-3">
            {tasks.filter(t => t.assignee === "JARVIS").map(task => (
              <div key={task.id} className="group flex items-center justify-between rounded border border-neutral-800 bg-neutral-900 p-3 hover:border-cyan-900/50 transition-colors">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleTask(task.id, task.status)} className={`rounded-full p-1 transition-colors ${task.status === 'done' ? 'text-cyan-500' : 'text-neutral-600 hover:text-cyan-500'}`}>
                    <CheckCircle size={18} className={task.status === 'done' ? 'fill-cyan-500/20' : ''} />
                  </button>
                  <span className={`${task.status === 'done' ? 'text-neutral-600 line-through' : 'text-cyan-100'}`}>
                    {task.title}
                  </span>
                </div>
                <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-neutral-600 hover:text-red-500 transition-opacity">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-0 left-0 w-full border-t border-neutral-800 bg-neutral-950 p-4 md:p-6">
        <div className="mx-auto flex max-w-4xl gap-4">
          <select 
            value={assignee} 
            onChange={(e) => setAssignee(e.target.value as "Z" | "JARVIS")}
            className="rounded bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-neutral-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="Z">Assign to Z</option>
            <option value="JARVIS">Assign to JARVIS</option>
          </select>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Initialize new protocol or task..."
            className="flex-1 rounded bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500"
          />
          <button 
            onClick={addTask}
            className="flex items-center gap-2 rounded bg-white px-6 py-3 text-sm font-bold text-black hover:bg-neutral-200 transition-colors"
          >
            <Plus size={16} /> ADD
          </button>
        </div>
      </div>
    </div>
  );
}
