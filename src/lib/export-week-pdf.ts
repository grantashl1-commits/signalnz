/**
 * Export the current weekly meal plan as a branded A4 PDF:
 *   Page 1   – Weekly grid (days as columns, meal slots as rows)
 *   Pages 2+ – Expanded recipes, ~3 days per page, with ingredients + method
 *   Last page – Shopping list, categorised by supermarket section
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AIMeal } from "./weekly-planner";
import { findRecipeByName } from "./recipe-index";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  aggregateShoppingItems,
  formatSmartQty,
} from "./smart-shopping-core";
import { parseIngredient } from "./ingredient-parser";

// Warm Stone palette
const COLORS = {
  bg: [245, 240, 236] as [number, number, number],
  ink: [40, 30, 55] as [number, number, number],
  muted: [120, 110, 130] as [number, number, number],
  rule: [210, 200, 210] as [number, number, number],
  primary: [92, 74, 158] as [number, number, number], // #5C4A9E
};

export interface ExportDay {
  dayName: string;       // "Monday"
  dateLabel: string;     // "5 June"
  cycleDay: number;
  phaseLabel: string;    // "luteal"
  breakfast: string | AIMeal | null | undefined;
  morningSnack: string | AIMeal | null | undefined;
  lunch: string | AIMeal | null | undefined;
  afternoonSnack: string | AIMeal | null | undefined;
  dinner: string | AIMeal | null | undefined;
}

interface ResolvedMeal {
  name: string;
  ingredients: string[];
  method: string[];
  serves?: number;
  prepTime?: string;
}

function resolveMeal(meal: string | AIMeal | null | undefined): ResolvedMeal | null {
  if (!meal) return null;
  if (typeof meal === "string") {
    const cleanName = meal.split(" — ")[0];
    const r = findRecipeByName(cleanName);
    if (r) return { name: r.name, ingredients: r.ingredients, method: r.method, serves: r.serves, prepTime: r.prepTime };
    return { name: cleanName, ingredients: [], method: [] };
  }
  const r = findRecipeByName(meal.name);
  const ingredients = meal.ingredients?.length ? meal.ingredients : r?.ingredients || [];
  const method = meal.method?.length ? meal.method : r?.method || [];
  return { name: meal.name, ingredients, method, serves: meal.serves || r?.serves, prepTime: meal.prepTime || r?.prepTime };
}


function drawHeader(doc: jsPDF, title: string, subtitle?: string) {
  const pw = doc.internal.pageSize.getWidth();
  // background band
  doc.setFillColor(...COLORS.bg);
  doc.rect(0, 0, pw, 26, "F");
  // Brand mark
  doc.setTextColor(...COLORS.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SIGNAL", 14, 13);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text("tune into your inner self", 14, 18);
  // Title right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.ink);
  doc.text(title, pw - 14, 13, { align: "right" });
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text(subtitle, pw - 14, 18, { align: "right" });
  }
  // hairline
  doc.setDrawColor(...COLORS.rule);
  doc.setLineWidth(0.2);
  doc.line(14, 24, pw - 14, 24);
}

function drawFooter(doc: jsPDF) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.setFont("helvetica", "italic");
  doc.text("signal · nourish with the rhythm of your cycle", 14, ph - 8);
  const page = doc.getCurrentPageInfo().pageNumber;
  doc.text(`${page}`, pw - 14, ph - 8, { align: "right" });
}

export interface WeekPdfMeta {
  weekLabel: string; // e.g. "5 – 11 June"
  phaseLabel: string;
}

export function exportWeekPdf(days: ExportDay[], meta: WeekPdfMeta): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // ─── PAGE 1: Weekly grid ───
  drawHeader(doc, "Your Week", `${meta.phaseLabel} · ${meta.weekLabel}`);

  const slots: Array<{ label: string; key: keyof ExportDay }> = [
    { label: "Breakfast", key: "breakfast" },
    { label: "Morning Snack", key: "morningSnack" },
    { label: "Lunch", key: "lunch" },
    { label: "Afternoon Snack", key: "afternoonSnack" },
    { label: "Dinner", key: "dinner" },
  ];

  const head = [[
    "",
    ...days.map(d => `${d.dayName.slice(0, 3)}\n${d.dateLabel}`),
  ]];
  const body = slots.map(s => [
    s.label,
    ...days.map(d => {
      const m = d[s.key] as string | AIMeal | null | undefined;
      const r = resolveMeal(m);
      return r?.name || "—";
    }),
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 32,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 3,
      textColor: COLORS.ink,
      lineColor: COLORS.rule,
      lineWidth: 0.15,
      valign: "middle",
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [248, 244, 240], cellWidth: 26, textColor: COLORS.primary },
    },
    alternateRowStyles: { fillColor: [252, 250, 247] },
    margin: { left: 10, right: 10 },
  });

  // Phase strip below table
  const afterY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...COLORS.muted);
  doc.text(
    "Snacks rotate with your phase. Tap any meal in the app to swap, lock, or get the recipe.",
    pw / 2, afterY, { align: "center", maxWidth: pw - 28 }
  );

  drawFooter(doc);

  // ─── PAGES 2+: Recipes, ~3 days per page ───
  const recipesPerPage = 3;
  for (let i = 0; i < days.length; i += recipesPerPage) {
    doc.addPage();
    drawHeader(doc, "Recipes", `Days ${i + 1}–${Math.min(i + recipesPerPage, days.length)} of ${days.length}`);
    let y = 32;
    for (const day of days.slice(i, i + recipesPerPage)) {
      // Day banner
      doc.setFillColor(...COLORS.primary);
      doc.rect(10, y, pw - 20, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${day.dayName} · ${day.dateLabel}`, 13, y + 5);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.text(`${day.phaseLabel} · day ${day.cycleDay}`, pw - 13, y + 5, { align: "right" });
      y += 10;

      const mealsToRender: Array<{ label: string; meal: ResolvedMeal | null }> = [
        { label: "Breakfast", meal: resolveMeal(day.breakfast) },
        { label: "Lunch", meal: resolveMeal(day.lunch) },
        { label: "Dinner", meal: resolveMeal(day.dinner) },
      ];

      // Two-column layout: ingredients left, method right
      const colW = (pw - 30) / 2;
      for (const { label, meal } of mealsToRender) {
        if (!meal) continue;
        // page break safety
        if (y > ph - 50) {
          drawFooter(doc);
          doc.addPage();
          drawHeader(doc, "Recipes", "continued");
          y = 32;
        }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(...COLORS.primary);
        doc.text(label.toUpperCase(), 13, y);
        doc.setTextColor(...COLORS.ink);
        doc.setFontSize(10);
        doc.text(meal.name, 30, y);
        if (meal.serves || meal.prepTime) {
          doc.setFont("helvetica", "italic");
          doc.setFontSize(7.5);
          doc.setTextColor(...COLORS.muted);
          const meta = [meal.prepTime, meal.serves ? `serves ${meal.serves}` : null].filter(Boolean).join(" · ");
          doc.text(meta, pw - 13, y, { align: "right" });
        }
        y += 4;

        // Ingredients column
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(...COLORS.muted);
        doc.text("INGREDIENTS", 13, y);
        // Method column
        doc.text("METHOD", 13 + colW + 5, y);
        y += 3.5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.ink);

        const ingLines = meal.ingredients.length
          ? meal.ingredients.map(s => `• ${s}`)
          : ["• (no ingredients listed)"];
        const methLines = meal.method.length
          ? meal.method.map((s, idx) => `${idx + 1}. ${s}`)
          : ["(method coming soon)"];

        const ingWrapped = ingLines.flatMap(l => doc.splitTextToSize(l, colW - 4));
        const methWrapped = methLines.flatMap(l => doc.splitTextToSize(l, colW - 4));

        const startY = y;
        doc.text(ingWrapped, 13, startY, { lineHeightFactor: 1.3 });
        doc.text(methWrapped, 13 + colW + 5, startY, { lineHeightFactor: 1.3 });

        const ingH = ingWrapped.length * 3.4;
        const methH = methWrapped.length * 3.4;
        y = startY + Math.max(ingH, methH) + 5;
      }
      // section divider
      doc.setDrawColor(...COLORS.rule);
      doc.setLineWidth(0.15);
      doc.line(10, y, pw - 10, y);
      y += 4;
    }
    drawFooter(doc);
  }

  // ─── LAST PAGE: Shopping list ───
  // Aggregate all ingredients across all meals (Breakfast/Lunch/Dinner; snacks skipped)
  const itemMap = new Map<string, { display: string; count: number; category: string }>();
  for (const day of days) {
    for (const m of [day.breakfast, day.lunch, day.dinner]) {
      const r = resolveMeal(m);
      if (!r) continue;
      for (const ing of r.ingredients) {
        const base = ingredientBase(ing);
        if (!base) continue;
        const key = base;
        const existing = itemMap.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          itemMap.set(key, { display: ing, count: 1, category: categorise(base) });
        }
      }
    }
  }

  // Group by category
  const groups: Record<string, Array<{ display: string; count: number }>> = {};
  for (const item of itemMap.values()) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push({ display: item.display, count: item.count });
  }
  const orderedCats = ["Produce", "Meat & Seafood", "Plant Protein", "Dairy & Eggs", "Pantry", "Frozen", "Other"]
    .filter(c => groups[c]?.length);

  doc.addPage();
  drawHeader(doc, "Shopping List", `${meta.weekLabel} · ${itemMap.size} items`);

  let sy = 32;
  const colCount = 2;
  const colWidth = (pw - 30) / colCount;
  let col = 0;
  let colStartY = sy;
  const colYs = [sy, sy];

  for (const cat of orderedCats) {
    const items = groups[cat].sort((a, b) => a.display.localeCompare(b.display));
    // Estimate height: header + items
    const blockH = 8 + items.length * 4.2 + 4;
    if (colYs[col] + blockH > ph - 18 && col === 0) {
      col = 1;
    }
    const x = 14 + col * (colWidth + 4);
    let yy = colYs[col];

    // Category header
    doc.setFillColor(...COLORS.primary);
    doc.rect(x, yy, colWidth - 4, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(cat.toUpperCase(), x + 2, yy + 4.2);
    doc.setFontSize(8);
    doc.text(`${items.length}`, x + colWidth - 6, yy + 4.2, { align: "right" });
    yy += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...COLORS.ink);
    for (const item of items) {
      if (yy > ph - 14) {
        if (col === 0) {
          col = 1;
          yy = sy;
        } else {
          drawFooter(doc);
          doc.addPage();
          drawHeader(doc, "Shopping List", "continued");
          col = 0;
          yy = 32;
          colYs[0] = 32;
          colYs[1] = 32;
        }
      }
      const xx = 14 + col * (colWidth + 4);
      // checkbox
      doc.setDrawColor(...COLORS.muted);
      doc.setLineWidth(0.2);
      doc.rect(xx + 1, yy - 3, 2.5, 2.5);
      // text
      const label = item.count > 1 ? `${item.display}  ×${item.count}` : item.display;
      const wrapped = doc.splitTextToSize(label, colWidth - 10);
      doc.text(wrapped, xx + 5.5, yy);
      yy += wrapped.length * 4;
    }
    yy += 3;
    colYs[col] = yy;
  }

  drawFooter(doc);

  doc.save(`signal-week-${meta.weekLabel.replace(/[^\w]+/g, "-").toLowerCase()}.pdf`);
}
