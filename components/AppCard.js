import Link from "next/link";

export default function AppCard({ app }) {
  return (
    <Link href={`/apps/${app.slug}`} className="group block">
      <div className="ac-card ac-card-hover p-5 flex flex-col justify-between h-full">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-extrabold text-base flex items-center justify-center shadow-md">
              {app.icon || app.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
              {app.category}
            </span>
          </div>

          <h3 className="font-bold text-base text-[#0f172a] group-hover:text-blue-600 transition-colors">
            {app.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {app.tagline || app.description}
          </p>
        </div>

        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{app.releaseTag || "v1.2.1"}</span>
          <span className="text-blue-600 font-semibold group-hover:underline">
            View App →
          </span>
        </div>
      </div>
    </Link>
  );
}
