import { NavLink } from "react-router-dom";
import { Users, Timer, PenLine, CheckCircle2, BarChart3, LogOut, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { Avatar } from "@/components/Avatar";

const navItems = [
  { to: "/class-list", label: "班级名单", icon: Users },
  { to: "/project-test", label: "项目测试", icon: Timer },
  { to: "/data-entry", label: "现场录入", icon: PenLine },
  { to: "/review", label: "成绩复核", icon: CheckCircle2 },
  { to: "/statistics", label: "统计分析", icon: BarChart3 },
];

export function Sidebar() {
  const { currentTeacher } = useAppStore();

  return (
    <aside className="w-[240px] bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
          <Dumbbell size={20} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="leading-tight">
          <div className="font-bold text-[15px]">智慧体育</div>
          <div className="text-[11px] text-white/50">体测采集系统</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )
            }
          >
            <Icon size={20} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={currentTeacher.name} color="#1E6FFF" size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{currentTeacher.name}</div>
            <div className="text-[11px] text-white/50">{currentTeacher.employeeNo}</div>
          </div>
          <button className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
