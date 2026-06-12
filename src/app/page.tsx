"use client";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

const members = [
  { id:"A", name:"山田", color:"#c8f135", tc:"#000" },
  { id:"B", name:"田中", color:"#5b8af5", tc:"#fff" },
  { id:"C", name:"鈴木", color:"#f5a623", tc:"#000" },
  { id:"D", name:"佐藤", color:"#f56565", tc:"#fff" },
];

const projects = [
  { id:0, name:"採用管理システム刷新", color:"#5b8af5" },
  { id:1, name:"社内ポータルUI改善",   color:"#c8f135" },
  { id:2, name:"データ基盤移行",       color:"#f5a623" },
  { id:3, name:"Q3レポート自動化",     color:"#555870" },
  { id:4, name:"新人育成",             color:"#10b981" },
];

type Status = "todo"|"doing"|"review"|"done";
type Task = { id:number; pid:number; name:string; status:Status; due:string; mid:string; };

const statusLabel: Record<Status,string> = { todo:"未着手", doing:"進行中", review:"レビュー中", done:"完了" };
const statusColor: Record<Status,string> = {
  todo:"bg-slate-700 text-slate-300",
  doing:"bg-blue-900 text-blue-300",
  review:"bg-amber-900 text-amber-300",
  done:"bg-green-900 text-green-300",
};

const fmtShort = (d:string) => { const dt=new Date(d); return `${dt.getMonth()+1}/${dt.getDate()}`; };
const fmtFull  = (d:string) => { const dt=new Date(d); return `${dt.getFullYear()}年${dt.getMonth()+1}月${dt.getDate()}日`; };
const isOver   = (d:string, s:Status) => new Date(d) < new Date() && s !== "done";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [pid, setPid] = useState(0);
  const [tid, setTid] = useState<number|null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/tasks")
      .then(r => r.json())
      .then(data => { setTasks(data); setLoading(false); });
  }, []);

  const task = tid !== null ? tasks.find(t=>t.id===tid) : null;
  const proj = projects.find(p=>p.id===pid)!;

  const filtered = tasks.filter(t => {
    if (t.pid !== pid) return false;
    if (filter==="doing") return t.status==="doing";
    if (filter==="todo")  return t.status==="todo";
    if (filter==="over")  return isOver(t.due, t.status);
    return true;
  });

  const changeStatus = async (id:number, s:Status) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: s }),
    });
    setTasks(prev => prev.map(t => t.id===id ? {...t, status:s} : t));
  };

  const todo  = tasks.filter(t=>t.status==="todo").length;
  const doing = tasks.filter(t=>t.status==="doing").length;
  const done  = tasks.filter(t=>t.status==="done").length;
  const over  = tasks.filter(t=>isOver(t.due,t.status)).length;

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#0e0f11] text-[#c8f135] font-mono text-sm">
      Loading...
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#0e0f11] text-[#e8eaf0] overflow-hidden">
      <header className="h-12 flex items-center px-5 gap-3 bg-[#16181c] border-b border-[#2a2d35] flex-shrink-0">
        <span className="font-black text-[15px] text-[#c8f135] tracking-tight">Team<span className="text-[#555870] font-normal">Board</span></span>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1e2026] border border-[#2a2d35] text-[#555870]">プロジェクト管理</span>
        <div className="flex-1" />
        {members.map(m=>(
          <div key={m.id} className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-[#0e0f11]"
            style={{background:m.color,color:m.tc}}>{m.name[0]}</div>
        ))}
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[220px] min-w-[220px] flex flex-col border-r border-[#2a2d35]">
          <div className="px-4 pt-3 pb-2 border-b border-[#2a2d35]">
            <div className="font-mono text-[9px] tracking-widest text-[#555870] uppercase mb-1">PANE 01</div>
            <div className="font-bold text-[13px]">プロジェクト</div>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-2">
              {projects.map(p => {
                const cnt = tasks.filter(t=>t.pid===p.id && t.status!=="done").length;
                return (
                  <div key={p.id} onClick={()=>{setPid(p.id);setTid(null);}}
                    className={`px-4 py-2 cursor-pointer flex items-center gap-2.5 relative transition-colors ${pid===p.id?"bg-[#1e2026]":"hover:bg-[#1a1c20]"}`}>
                    {pid===p.id && <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{background:p.color}}/>}
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{background:cnt===0?"#555870":p.color}}/>
                    <div className="text-[12.5px] flex-1 truncate">{p.name}</div>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full border ${pid===p.id?"text-black border-transparent font-bold":"text-[#555870] bg-[#16181c] border-[#2a2d35]"}`}
                      style={pid===p.id?{background:p.color}:{}}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
        <div className="w-[250px] min-w-[250px] flex flex-col border-r border-[#2a2d35]">
          <div className="px-4 pt-3 pb-2 border-b border-[#2a2d35] flex items-end justify-between">
            <div>
              <div className="font-mono text-[9px] tracking-widest text-[#555870] uppercase mb-1">PANE 02</div>
              <div className="font-bold text-[13px] truncate max-w-[160px]">{proj.name}</div>
            </div>
            <span className="font-mono text-[11px] text-[#555870]">{filtered.length}件</span>
          </div>
          <div className="flex gap-1.5 px-2.5 py-2 border-b border-[#2a2d35] flex-wrap">
            {(["all","doing","todo","over"] as const).map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className={`font-mono text-[10px] px-2 py-0.5 rounded-full border transition-colors ${filter===f?"bg-[#c8f135] text-black border-[#c8f135] font-medium":"border-[#2a2d35] text-[#555870] hover:border-[#8b8fa8]"}`}>
                {{all:"全て",doing:"進行中",todo:"未着手",over:"期限切れ"}[f]}
              </button>
            ))}
          </div>
          <ScrollArea className="flex-1">
            {filtered.length===0
              ? <div className="flex items-center justify-center h-32 text-[#555870] text-sm">タスクなし</div>
              : filtered.map(t=>{
                  const m = members.find(m=>m.id===t.mid)!;
                  const over = isOver(t.due, t.status);
                  return (
                    <div key={t.id} onClick={()=>setTid(t.id)}
                      className={`px-3.5 py-2.5 cursor-pointer transition-colors border-l-2 ${tid===t.id?"bg-[#1e2026] border-[#5b8af5]":"hover:bg-[#1a1c20] border-transparent"}`}>
                      <div className="flex items-start gap-2 mb-1.5">
                        <div className={`w-3.5 h-3.5 rounded-sm border mt-0.5 flex-shrink-0 flex items-center justify-center ${t.status==="done"?"bg-green-500 border-green-500":"border-[#2a2d35]"}`}>
                          {t.status==="done" && <span className="text-white text-[8px] font-bold">✓</span>}
                        </div>
                        <span className={`text-[12.5px] leading-snug ${t.status==="done"?"line-through text-[#555870]":""}`}>{t.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 pl-5">
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${statusColor[t.status]}`}>{statusLabel[t.status]}</span>
                        <span className={`font-mono text-[10px] ml-auto ${over?"text-red-400":"text-[#555870]"}`}>{fmtShort(t.due)}</span>
                        <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold" style={{background:m.color,color:m.tc}}>{m.name[0]}</div>
                      </div>
                    </div>
                  );
                })
            }
          </ScrollArea>
        </div>
        <div className="flex-1 min-w-0 flex flex-col border-r border-[#2a2d35]">
          <div className="px-4 pt-3 pb-2 border-b border-[#2a2d35]">
            <div className="font-mono text-[9px] tracking-widest text-[#555870] uppercase mb-1">PANE 03</div>
            <div className="font-bold text-[13px]">タスク詳細</div>
          </div>
          <ScrollArea className="flex-1">
            {!task
              ? <div className="flex flex-col items-center justify-center h-full text-[#555870] gap-2 pt-20"><span className="text-3xl opacity-30">📋</span><span className="text-sm">タスクを選択すると詳細が表示されます</span></div>
              : (()=>{
                  const m = members.find(x=>x.id===task.mid)!;
                  const p = projects.find(x=>x.id===task.pid)!;
                  const over = isOver(task.due, task.status);
                  return (
                    <div>
                      <div className="px-6 py-5 border-b border-[#2a2d35]">
                        <div className="flex gap-2 mb-3">
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${statusColor[task.status]}`}>{statusLabel[task.status]}</span>
                        </div>
                        <div className="font-bold text-[19px] leading-snug mb-2">{task.name}</div>
                        <div className="flex items-center gap-1.5 text-[12px] text-[#555870]">
                          <div className="w-2 h-2 rounded-full" style={{background:p.color}}/>
                          {p.name}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-b border-[#2a2d35]" style={{gap:"1px",background:"#2a2d35"}}>
                        <div className="bg-[#16181c] px-5 py-3">
                          <div className="font-mono text-[9px] tracking-widest text-[#555870] uppercase mb-1.5">担当者</div>
                          <div className="flex items-center gap-2 text-[13px]">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{background:m.color,color:m.tc}}>{m.name[0]}</div>
                            {m.name}
                          </div>
                        </div>
                        <div className="bg-[#16181c] px-5 py-3">
                          <div className="font-mono text-[9px] tracking-widest text-[#555870] uppercase mb-1.5">期日</div>
                          <div className={`text-[13px] ${over?"text-red-400":""}`}>{over?"⚠ ":""}{fmtFull(task.due)}</div>
                        </div>
                      </div>
                      <div className="px-6 py-4">
                        <div className="font-mono text-[9px] tracking-widest text-[#555870] uppercase mb-3">ステータス変更</div>
                        <div className="flex gap-2 flex-wrap">
                          {(["todo","doing","review","done"] as const).map(s=>(
                            <button key={s} onClick={()=>changeStatus(task.id,s)}
                              className={`font-mono text-[10px] px-3 py-1.5 rounded-full border transition-colors ${task.status===s?statusColor[s]+" border-transparent":"border-[#2a2d35] text-[#555870] hover:border-[#8b8fa8]"}`}>
                              {statusLabel[s]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()
            }
          </ScrollArea>
        </div>
        <div className="w-[240px] min-w-[240px] flex flex-col">
          <div className="px-4 pt-3 pb-2 border-b border-[#2a2d35]">
            <div className="font-mono text-[9px] tracking-widest text-[#555870] uppercase mb-1">PANE 04</div>
            <div className="font-bold text-[13px]">メンバー別タスク</div>
          </div>
          <ScrollArea className="flex-1">
            {members.map(m=>{
              const myTasks = tasks.filter(t=>t.mid===m.id && t.status!=="done");
              return (
                <div key={m.id} className="border-b border-[#2a2d35]">
                  <div className="flex items-center gap-2.5 px-4 py-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{background:m.color,color:m.tc}}>{m.name[0]}</div>
                    <span className="text-[13px] font-medium flex-1">{m.name}</span>
                    <span className="font-mono text-[10px] text-[#555870] bg-[#1e2026] border border-[#2a2d35] px-1.5 py-0.5 rounded-full">{myTasks.length}</span>
                  </div>
                  {myTasks.length===0
                    ? <div className="px-5 pb-2 text-[11px] text-[#555870]">タスクなし ✓</div>
                    : myTasks.map(t=>{
                        const p = projects.find(x=>x.id===t.pid)!;
                        const over = isOver(t.due, t.status);
                        return (
                          <div key={t.id} onClick={()=>{setPid(t.pid);setTid(t.id);}}
                            className="flex items-center gap-2 px-5 py-1.5 cursor-pointer hover:bg-[#1e2026] transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:p.color}}/>
                            <span className="text-[11.5px] text-[#8b8fa8] flex-1 truncate">{t.name}</span>
                            <span className={`font-mono text-[9px] ${over?"text-red-400":"text-[#555870]"}`}>{fmtShort(t.due)}</span>
                          </div>
                        );
                      })
                  }
                </div>
              );
            })}
          </ScrollArea>
        </div>
      </div>
      <div className="flex border-t border-[#2a2d35] flex-shrink-0">
        {[
          {label:"未着手", val:todo,  cls:"text-[#8b8fa8]"},
          {label:"進行中", val:doing, cls:"text-[#5b8af5]"},
          {label:"完了",   val:done,  cls:"text-[#48bb78]"},
          {label:"期限切れ",val:over, cls:"text-[#f56565]"},
        ].map(({label,val,cls})=>(
          <div key={label} className="flex-1 py-2 text-center border-r border-[#2a2d35] last:border-r-0">
            <div className={`font-mono text-base font-medium ${cls}`}>{val}</div>
            <div className="font-mono text-[8px] tracking-widest uppercase text-[#555870] mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}