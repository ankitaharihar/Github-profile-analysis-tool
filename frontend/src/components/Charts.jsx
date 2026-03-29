import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  AreaChart,
  Area,
  XAxis,
  Tooltip
} from "recharts";

// 🎯 COLORS (Figma style)
const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#22c55e", "#f59e0b"];

// 🔥 LANGUAGE CHART (Donut)
export function LanguageChart({ repos }) {
  const langMap = {};

  repos.forEach((repo) => {
    if (repo.language) {
      langMap[repo.language] = (langMap[repo.language] || 0) + 1;
    }
  });

  const data = Object.keys(langMap).map((key) => ({
    name: key,
    value: langMap[key]
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={70}
          outerRadius={100}
          dataKey="value"
          paddingAngle={5}
           style={{ filter: "drop-shadow(0 0 15px #6366f1)" }}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

// 🔥 RADAR CHART (Skills)
export function RadarChartBox({ repos }) {
  const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);

  const data = [
    { subject: "Code", A: Math.min(100, repos.length * 5) },
    { subject: "Collab", A: Math.min(100, totalStars * 2) },
    { subject: "Activity", A: 80 },
    { subject: "Stars", A: Math.min(100, totalStars * 2) },
    { subject: "Consistency", A: 60 }
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data}>
        <PolarGrid stroke="#334155" />
        <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
        <Radar
          dataKey="A"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.5}
           style={{ filter: "drop-shadow(0 0 15px #6366f1)" }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// 🔥 ACTIVITY CHART (Glow)
export function ActivityChart() {
  const data = [
    { name: "Apr", value: 40 },
    { name: "May", value: 70 },
    { name: "Jun", value: 20 },
    { name: "Jul", value: 60 },
    { name: "Aug", value: 50 },
    { name: "Sep", value: 55 },
    { name: "Oct", value: 52 },
    { name: "Nov", value: 25 },
    { name: "Dec", value: 40 },
    { name: "Jan", value: 35 },
    { name: "Feb", value: 30 },
    { name: "Mar", value: 75 }
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis dataKey="name" stroke="#64748b" />
        <Tooltip />

        <Area
          type="monotone"
          dataKey="value"
          stroke="#6366f1"
          strokeWidth={4}
          fill="url(#colorGradient)"
          style={{ filter: "drop-shadow(0 0 4px #6366f1)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}