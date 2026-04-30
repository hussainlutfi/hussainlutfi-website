"use client";

import { useState, useCallback, useEffect } from "react";
import { driveData } from "./data";

interface TreeNode {
  name: string;
  size: number;
  sizeStr: string;
  date: string;
  isDir: boolean;
  children: TreeNode[];
}

const FILE_ICONS: Record<string, string> = {
  mp4: "🎬", mov: "🎬", mp3: "🎵", wav: "🎵",
  jpg: "🖼️", jpeg: "🖼️", png: "🖼️", heic: "🖼️",
  prproj: "🎞️", prin: "🎞️", pdf: "📄", pptx: "📊",
  zip: "📦", ttf: "🔤", otf: "🔤", ttc: "🔤",
  xml: "📋", pkf: "📊", dmg: "💿", exe: "⚙️",
};

const EXT_COLORS: Record<string, string> = {
  mp4: "#ef5350", mov: "#ef5350",
  wav: "#ab47bc", mp3: "#ab47bc",
  jpg: "#66bb6a", png: "#66bb6a", heic: "#66bb6a",
  prproj: "#7c4dff", prin: "#7c4dff",
  ttf: "#26c6da", otf: "#26c6da",
  zip: "#ffa726", pdf: "#ef5350",
};

function getFileIcon(name: string, isDir: boolean): string {
  if (isDir) {
    if (name.includes("هـ")) return "📅";
    if (name.includes("موارد")) return "📦";
    if (name.includes("غير مصنف")) return "📂";
    if (/٠[١-٩]|١[٠-٢]/.test(name)) return "🗓️";
    return "📁";
  }
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return FILE_ICONS[ext] || "📄";
}

function getExtColor(name: string): string | undefined {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return EXT_COLORS[ext];
}

function TreeItem({ item, depth, globalKey }: { item: TreeNode; depth: number; globalKey: number }) {
  const [localOpen, setLocalOpen] = useState(false);

  useEffect(() => {
    if (globalKey === 999) setLocalOpen(true);
    else if (globalKey === 0) setLocalOpen(false);
    else setLocalOpen(depth < globalKey);
  }, [globalKey, depth]);

  const isOpen = localOpen;

  const rowBg = depth === 0
    ? "rgba(59,130,246,0.07)"
    : depth === 1
    ? "rgba(255,255,255,0.015)"
    : "transparent";

  const rowBorder = depth === 0 ? "1px solid rgba(59,130,246,0.12)" : "none";
  const rowRadius = depth <= 1 ? "12px" : "8px";
  const rowPadding = depth === 0 ? "10px 14px" : depth === 1 ? "7px 12px" : "5px 10px";
  const rowMargin = depth === 0 ? "0 0 4px" : depth === 1 ? "0 0 2px" : "0";

  const nameColor = depth === 0
    ? "#60a5fa"
    : depth === 1
    ? "#93c5fd"
    : item.isDir
    ? "#7cb3d4"
    : "#b0c4d4";

  const nameWeight = depth <= 1 ? 600 : item.isDir ? 500 : 400;
  const nameFontSize = depth === 0 ? "15px" : "13px";

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: rowBg,
          border: rowBorder,
          borderRadius: rowRadius,
          padding: rowPadding,
          margin: rowMargin,
          cursor: item.isDir ? "pointer" : "default",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = item.isDir ? "rgba(59,130,246,0.1)" : "rgba(255,255,255,0.03)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = rowBg;
        }}
        onClick={() => item.isDir && setLocalOpen(!isOpen)}
      >
        {item.isDir ? (
          <span style={{
            fontSize: "10px",
            color: "#5a7a9a",
            width: "16px",
            textAlign: "center",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
            display: "inline-block",
          }}>
            ▶
          </span>
        ) : (
          <span style={{ width: "16px" }} />
        )}

        <span style={{ fontSize: "15px", color: getExtColor(item.name), flexShrink: 0 }}>
          {getFileIcon(item.name, item.isDir)}
        </span>

        <span style={{
          flex: 1,
          color: nameColor,
          fontWeight: nameWeight,
          fontSize: nameFontSize,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {item.name}{item.isDir ? "/" : ""}
        </span>

        {item.sizeStr && (
          <span style={{
            fontSize: "11px",
            color: "#5a7a9a",
            fontFamily: "monospace",
            minWidth: "60px",
            textAlign: "left",
            direction: "ltr",
            flexShrink: 0,
          }}>
            {item.sizeStr}
          </span>
        )}

        {item.date && (
          <span className="hidden md:inline" style={{
            fontSize: "11px",
            color: "#3d5a70",
            minWidth: "105px",
            textAlign: "left",
            direction: "ltr",
            flexShrink: 0,
          }}>
            {item.date}
          </span>
        )}
      </div>

      {item.isDir && item.children.length > 0 && isOpen && (
        <div style={{
          paddingRight: "22px",
          marginRight: "10px",
          borderRight: "1px solid rgba(59,130,246,0.06)",
        }}>
          {item.children.map((child, i) => (
            <TreeItem key={`${child.name}-${i}`} item={child} depth={depth + 1} globalKey={globalKey} />
          ))}
        </div>
      )}
    </div>
  );
}

function DriveCard({
  title, subtitle, icon, free, freePercent, totalSize, data, accentColor, globalKey,
}: {
  title: string;
  subtitle: string;
  icon: string;
  free: string;
  freePercent: number;
  totalSize: string;
  data: TreeNode[];
  accentColor: string;
  globalKey: number;
}) {
  return (
    <div style={{
      flex: 1,
      minWidth: "340px",
      maxWidth: "720px",
      borderRadius: "20px",
      border: "1px solid rgba(100,150,255,0.1)",
      overflow: "hidden",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      background: "linear-gradient(180deg, rgba(12,18,30,0.98), rgba(8,12,22,0.99))",
    }}>
      {/* Drive header */}
      <div style={{
        padding: "24px 28px",
        borderBottom: "1px solid rgba(100,150,255,0.08)",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}>
        <div style={{
          width: "52px",
          height: "52px",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
          border: `1px solid ${accentColor}30`,
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#e8f0f8", margin: 0 }}>{title}</h2>
          <p style={{ fontSize: "13px", color: "#6a8caa", margin: "4px 0 0" }}>{subtitle}</p>
        </div>
        <div style={{ textAlign: "left", direction: "ltr" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#66bb6a" }}>{free}</div>
          <div style={{ fontSize: "11px", color: "#5a7a9a" }}>مساحة فارغة</div>
        </div>
      </div>

      {/* Storage bar */}
      <div style={{ padding: "0 28px", marginTop: "12px" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          color: "#5a7a9a",
          marginBottom: "6px",
        }}>
          <span>المستخدم: {totalSize}</span>
          <span>الفارغ: {free}</span>
        </div>
        <div style={{
          height: "6px",
          borderRadius: "3px",
          background: "rgba(255,255,255,0.05)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${100 - freePercent}%`,
            borderRadius: "3px",
            background: `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`,
            transition: "width 0.5s",
          }} />
        </div>
      </div>

      {/* Tree */}
      <div style={{ padding: "16px 20px 28px" }}>
        {data.map((item, i) => (
          <TreeItem key={`${item.name}-${i}`} item={item} depth={0} globalKey={globalKey} />
        ))}
      </div>
    </div>
  );
}

export default function NodbaHardesksPage() {
  const [globalKey] = useState(0);

  const countItems = useCallback((items: TreeNode[]): number => {
    let count = 0;
    for (const item of items) {
      count++;
      if (item.children) count += countItems(item.children);
    }
    return count;
  }, []);

  const totalItems = countItems(driveData.drive1tb as TreeNode[]) + countItems(driveData.drive2tb as TreeNode[]);


  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060a12 0%, #0a1020 50%, #081018 100%)",
      fontFamily: "Tajawal, sans-serif",
      direction: "rtl",
    }}>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "60px 20px 40px" }}>
        <div style={{
          maxWidth: "720px",
          margin: "0 auto",
          padding: "44px 36px",
          borderRadius: "28px",
          border: "1px solid rgba(59,130,246,0.1)",
          background: "linear-gradient(135deg, rgba(15,30,65,0.5), rgba(20,40,80,0.2))",
          backdropFilter: "blur(10px)",
        }}>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 44px)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #60a5fa, #3b82f6, #93c5fd)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 10px",
            lineHeight: 1.2,
          }}>
            أرشيف الأقراص الصلبة
          </h1>
          <p style={{ color: "#7a9ab8", fontSize: "17px", fontWeight: 300, margin: 0 }}>
            ندبة — أرشيف الإنتاج المرئي والصوتي
          </p>
          <p style={{ color: "#3d5a70", fontSize: "13px", marginTop: "8px" }}>
            ٣٠ أبريل ٢٠٢٦ م — ٣ ذو القعدة ١٤٤٧ هـ
          </p>

          {/* Stats */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            marginTop: "32px",
            flexWrap: "wrap",
          }}>
            {[
              { value: totalItems.toLocaleString("ar-SA"), label: "إجمالي الملفات" },
              { value: "٣", label: "سنوات هجرية" },
              { value: "٢", label: "أقراص صلبة" },
            ].map((stat) => (
              <div key={stat.label} style={{
                textAlign: "center",
                padding: "14px 28px",
                background: "rgba(255,255,255,0.025)",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.04)",
                minWidth: "100px",
              }}>
                <div style={{ fontSize: "28px", fontWeight: 700, color: "#60a5fa" }}>{stat.value}</div>
                <div style={{ fontSize: "12px", color: "#5a7a9a", marginTop: "4px" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Drive Cards */}
      <div style={{
        maxWidth: "1500px",
        margin: "0 auto",
        padding: "0 20px 80px",
        display: "flex",
        gap: "28px",
        flexWrap: "wrap",
        justifyContent: "center",
      }}>
        <DriveCard
          title="القرص ١ تيرابايت"
          subtitle="أرشيف — ١٤٤٥ هـ + ١٤٤٦ هـ"
          icon="💾"
          free="536 GB"
          freePercent={57}
          totalSize="395 GB"
          data={driveData.drive1tb as TreeNode[]}
          accentColor="#3b82f6"
          globalKey={globalKey}
        />
        <DriveCard
          title="القرص ٢ تيرابايت"
          subtitle="نشط — ١٤٤٧ هـ"
          icon="💽"
          free="299 GB"
          freePercent={16}
          totalSize="1.5 TB"
          data={driveData.drive2tb as TreeNode[]}
          accentColor="#0d9488"
          globalKey={globalKey}
        />
      </div>

      {/* Watermark */}
      <div style={{
        textAlign: "center",
        paddingBottom: "40px",
        color: "#2a3a4a",
        fontSize: "13px",
      }}>
        تم التنظيم بواسطة Claude Code — أبريل ٢٠٢٦
      </div>
    </div>
  );
}
