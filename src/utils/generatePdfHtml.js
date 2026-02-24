export function generatePdfHtml({
  type,
  summary,
  visualExplanation,
  realWorldExamples,
  keyWords,
  solutionSteps,
  finalAnswer,
}) {
  const isSolvable = type === 'math' || type === 'aptitude';
  const typeLabel = type === 'math' ? 'Math Problem' : type === 'aptitude' ? 'Aptitude Problem' : 'Text Content';
  const accent = type === 'math' ? '#3B82F6' : type === 'aptitude' ? '#F59E0B' : '#A855F7';
  const accentLight = type === 'math' ? '#EFF6FF' : type === 'aptitude' ? '#FFFBEB' : '#FAF5FF';
  const accentBorder = type === 'math' ? '#BFDBFE' : type === 'aptitude' ? '#FDE68A' : '#E9D5FF';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const esc = (text) => {
    if (!text) return '';
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  const formatText = (text) => {
    if (!text) return '';
    return text.split('\n').map((line) => {
      const t = line.trim();
      if (!t) return '<br/>';
      if (t.startsWith('•') || t.startsWith('-')) {
        return '<p style="margin:2px 0 2px 12px;font-size:13px;color:#475569;line-height:1.7;">&bull; ' + esc(t.replace(/^[•\-]\s*/, '')) + '</p>';
      }
      if (/^\d+[\.\)]/.test(t)) {
        return '<p style="margin:2px 0 2px 12px;font-size:13px;color:#475569;line-height:1.7;">' + esc(t) + '</p>';
      }
      if (t.endsWith(':') && t.length < 60) {
        return '<p style="margin:8px 0 3px 0;font-size:14px;font-weight:bold;color:#1E293B;">' + esc(t) + '</p>';
      }
      return '<p style="margin:2px 0;font-size:13px;color:#475569;line-height:1.7;">' + esc(t) + '</p>';
    }).join('\n');
  };

  const sectionTitle = (color, title) =>
    `<tr><td colspan="2" style="padding:12px 0 6px 0;border-bottom:2px solid #E2E8F0;">
      <span style="color:${color};font-size:16px;font-weight:bold;">&bull;</span>
      <span style="font-size:16px;font-weight:bold;color:#1E293B;margin-left:4px;">${title}</span>
    </td></tr>
    <tr><td colspan="2" style="height:8px;"></td></tr>`;

  /* ── Build all sections ── */
  let sections = '';

  // 1. Summary
  if (summary) {
    sections += sectionTitle(accent, 'Summary');
    sections += `<tr><td colspan="2" style="background-color:${accentLight};border:1px solid ${accentBorder};padding:12px;">${formatText(summary)}</td></tr>
    <tr><td colspan="2" style="height:16px;"></td></tr>`;
  }

  // 2. Visual Explanation
  if (visualExplanation) {
    sections += sectionTitle('#FB7185', 'Visual Explanation');
    sections += `<tr><td colspan="2" style="background-color:#FFF5F7;border:1px solid #FECDD3;border-left:4px solid #FB7185;padding:12px;">${formatText(visualExplanation)}</td></tr>
    <tr><td colspan="2" style="height:16px;"></td></tr>`;
  }

  // 3. Solution Steps (math/aptitude)
  if (isSolvable && solutionSteps?.length) {
    sections += sectionTitle(accent, 'Step-by-Step Solution');
    solutionSteps.forEach((s) => {
      sections += `<tr>
        <td style="width:36px;vertical-align:top;padding:8px 4px 8px 0;">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="width:28px;height:28px;background-color:${accent};color:#ffffff;font-weight:bold;font-size:13px;text-align:center;border-radius:50%;">${esc(String(s.step))}</td>
          </tr></table>
        </td>
        <td style="vertical-align:top;padding:6px 0 10px 4px;border-bottom:1px solid #F1F5F9;">
          <p style="margin:0 0 3px 0;font-size:14px;font-weight:bold;color:#1E293B;">${esc(s.title)}</p>
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.7;">${esc(s.explanation)}</p>
          ${s.expression ? `<p style="margin:6px 0 0 0;padding:6px 10px;background-color:${accentLight};border-left:3px solid ${accent};font-family:monospace;font-size:13px;font-weight:bold;color:#1E293B;">${esc(s.expression)}</p>` : ''}
        </td>
      </tr>`;
    });
    sections += '<tr><td colspan="2" style="height:16px;"></td></tr>';
  }

  // 4. Final Answer (math/aptitude)
  if (isSolvable && finalAnswer) {
    sections += sectionTitle('#059669', 'Final Answer');
    sections += `<tr><td colspan="2" style="background-color:#F0FDF4;border:2px solid #86EFAC;padding:14px;text-align:center;">
      <p style="margin:0;font-size:18px;font-weight:bold;color:#059669;">${esc(finalAnswer)}</p>
    </td></tr>
    <tr><td colspan="2" style="height:16px;"></td></tr>`;
  }

  // 5. Real-World Examples
  if (realWorldExamples?.length) {
    sections += sectionTitle('#10B981', 'Real-World Examples');
    realWorldExamples.forEach((ex, i) => {
      sections += `<tr>
        <td style="width:36px;vertical-align:top;padding:6px 4px 6px 0;">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="width:24px;height:24px;background-color:${accent};color:#ffffff;font-weight:bold;font-size:12px;text-align:center;border-radius:50%;">${i + 1}</td>
          </tr></table>
        </td>
        <td style="vertical-align:top;padding:6px 0;border-bottom:1px solid #F1F5F9;">
          <p style="margin:0;font-size:13px;color:#475569;line-height:1.7;">${esc(ex)}</p>
        </td>
      </tr>`;
    });
    sections += '<tr><td colspan="2" style="height:16px;"></td></tr>';
  }

  // 6. Key Words
  if (keyWords?.length) {
    sections += sectionTitle(accent, 'Key Words to Remember');
    sections += `<tr><td colspan="2" style="padding:4px 0;">
      ${keyWords.map((w) =>
        `<span style="display:inline-block;background-color:${accentLight};color:${accent};border:1px solid ${accentBorder};padding:3px 10px;margin:2px 3px;font-size:12px;font-weight:bold;">${esc(w)}</span>`
      ).join(' ')}
    </td></tr>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>EasyTutor - ${typeLabel}</title>
<style>
  @page { margin: 12mm; }
  body {
    font-family: Helvetica, Arial, sans-serif;
    margin: 0;
    padding: 12px;
    color: #334155;
    background: #fff;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  p { margin: 0; }
  table { border-collapse: collapse; }
</style>
</head>
<body>

<!-- HEADER -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
<tr><td style="background-color:#1A1145;padding:20px;text-align:center;-webkit-print-color-adjust:exact;print-color-adjust:exact;">
  <p style="margin:0;font-size:28px;font-weight:bold;color:#FFFFFF;">Easy<span style="color:${accent};">Tutor</span></p>
  <p style="margin:4px 0 0 0;font-size:10px;color:#9CA3C0;letter-spacing:2px;text-transform:uppercase;">AI-Powered Learning Made Easy</p>
  <p style="margin:10px 0 0 0;">
    <span style="display:inline-block;background-color:${accent};color:#FFFFFF;padding:3px 14px;font-size:11px;font-weight:bold;-webkit-print-color-adjust:exact;print-color-adjust:exact;">${typeLabel}</span>
  </p>
  <p style="margin:6px 0 0 0;font-size:10px;color:#8B92B0;">${today}</p>
</td></tr>
</table>

<!-- CONTENT -->
<table width="100%" cellpadding="0" cellspacing="0" border="0">
${sections}
</table>

<!-- FOOTER -->
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;border-top:2px solid #F1F5F9;">
<tr><td style="padding:12px 0;text-align:center;">
  <p style="margin:0;font-size:14px;font-weight:bold;color:#1E293B;">Easy<span style="color:${accent};">Tutor</span></p>
  <p style="margin:2px 0 0 0;font-size:10px;color:#94A3B8;">Generated by EasyTutor &mdash; AI-Powered Learning Made Easy</p>
</td></tr>
</table>

</body>
</html>`;
}
