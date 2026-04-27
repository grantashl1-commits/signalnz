// Generates a printable A4 weekly chore chart (Mon–Sun) with chore names,
// optional illustrations, and tick boxes for the child to colour in.
// Opens a new window with print-ready HTML.

type PrintChore = { name: string; points: number; image_url?: string | null; category: "must" | "bonus" };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function printWeeklyChart(opts: {
  childName: string;
  characterImage: string;
  accent: string;
  must: PrintChore[];
  bonus: PrintChore[];
}) {
  const { childName, characterImage, accent, must, bonus } = opts;

  const renderRow = (c: PrintChore) => `
    <tr>
      <td class="chore-cell">
        <div class="chore-row">
          ${c.image_url ? `<img src="${c.image_url}" alt="" class="chore-img" />` : `<div class="chore-img placeholder">★</div>`}
          <div class="chore-text">
            <div class="chore-name">${escapeHtml(c.name)}</div>
            <div class="chore-pts">+${c.points} pt${c.points === 1 ? "" : "s"}</div>
          </div>
        </div>
      </td>
      ${DAYS.map(() => `<td class="tick"><div class="box"></div></td>`).join("")}
    </tr>
  `;

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${escapeHtml(childName)}'s Chore Chart</title>
<style>
  @page { size: A4 portrait; margin: 14mm; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #2a2420;
    margin: 0;
    background: #fff;
  }
  header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 18px;
    padding-bottom: 12px;
    border-bottom: 3px solid ${accent};
  }
  header img { width: 70px; height: 70px; object-fit: contain; }
  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  header p {
    margin: 2px 0 0;
    font-size: 12px;
    color: #6b6660;
    letter-spacing: 0.05em;
  }
  h2 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #6b6660;
    margin: 18px 0 6px;
    border-left: 4px solid ${accent};
    padding-left: 8px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 6px 4px;
    border-bottom: 2px solid #2a2420;
    color: #2a2420;
  }
  th.day { width: 8%; }
  th.chore { text-align: left; padding-left: 8px; }
  td {
    border-bottom: 1px solid #e6e0da;
    padding: 6px 4px;
    vertical-align: middle;
    height: 56px;
  }
  td.tick { text-align: center; }
  td.tick .box {
    width: 26px;
    height: 26px;
    border: 2px solid #2a2420;
    border-radius: 6px;
    margin: 0 auto;
  }
  .chore-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-left: 4px;
  }
  .chore-img {
    width: 44px;
    height: 44px;
    object-fit: contain;
    border-radius: 8px;
    background: ${accent}22;
    flex-shrink: 0;
  }
  .chore-img.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    color: ${accent};
  }
  .chore-name { font-weight: 600; font-size: 13px; line-height: 1.2; }
  .chore-pts { font-size: 10px; color: ${accent}; font-weight: 700; margin-top: 2px; }
  footer {
    margin-top: 24px;
    text-align: center;
    font-size: 10px;
    color: #8a857f;
    font-style: italic;
  }
  @media print {
    .no-print { display: none; }
  }
  .no-print {
    text-align: center;
    margin: 12px 0 24px;
  }
  .no-print button {
    background: #2a2420;
    color: #fff;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 600;
  }
</style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">Print this chart</button>
  </div>

  <header>
    <img src="${characterImage}" alt="" />
    <div>
      <h1>${escapeHtml(childName)}'s Week</h1>
      <p>Colour the box in when you do it. Mum or Dad will tap it on the app.</p>
    </div>
  </header>

  ${must.length ? `
    <h2>Must-do chores</h2>
    <table>
      <thead>
        <tr>
          <th class="chore">Chore</th>
          ${DAYS.map(d => `<th class="day">${d}</th>`).join("")}
        </tr>
      </thead>
      <tbody>${must.map(renderRow).join("")}</tbody>
    </table>
  ` : ""}

  ${bonus.length ? `
    <h2>Bonus chores</h2>
    <table>
      <thead>
        <tr>
          <th class="chore">Chore</th>
          ${DAYS.map(d => `<th class="day">${d}</th>`).join("")}
        </tr>
      </thead>
      <tbody>${bonus.map(renderRow).join("")}</tbody>
    </table>
  ` : ""}

  <footer>Calm. Neutral. Brief. — ${childName}'s Behaviour Chart</footer>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) {
    alert("Please allow pop-ups to print the chart.");
    return;
  }
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]!));
}
