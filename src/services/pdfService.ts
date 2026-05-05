import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StructuredClinicalSummary } from './geminiService';

export const exportToPDF = (summary: StructuredClinicalSummary) => {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text('Clinical Documentation Summary', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Generated on: ${timestamp}`, 14, 30);
  doc.text('This is a preparation tool, not medical advice or a diagnosis.', 14, 35);

  // Patient Narrative
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('Patient Narrative', 14, 50);
  
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85); // Slate-700
  const narrativeLines = doc.splitTextToSize(summary.patientNarrative, 180);
  doc.text(narrativeLines, 14, 58);

  // Symptom Profile Table
  const tableData = [
    ['Subjective Report', summary.symptomProfile.subjective],
    ['Observation/Duration', summary.symptomProfile.observed],
    ['Associated Factors', summary.symptomProfile.associated],
    ['Progression', summary.symptomProfile.progression],
  ];

  autoTable(doc, {
    startY: 85,
    head: [['Category', 'Details']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 130 },
    },
  });

  // Clinical Focus
  const currentY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Recommended Clinical Focus Area', 14, currentY);
  
  const terms = summary.clinicalTerminology.map(t => `${t.term}: ${t.definition}`).join('\n\n');
  doc.setFontSize(10);
  const termLines = doc.splitTextToSize(terms, 180);
  doc.text(termLines, 14, currentY + 8);

  // Doctor Questions
  const questionsY = currentY + (termLines.length * 5) + 15;
  doc.setFontSize(14);
  doc.text('Questions for your Physician', 14, questionsY);
  
  doc.setFontSize(10);
  summary.doctorsQuestions.forEach((q, i) => {
    doc.text(`${i + 1}. ${q}`, 14, questionsY + 8 + (i * 10), { maxWidth: 180 });
  });

  // Footer Disclaimer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'Disclaimer: This report was prepared by ClinicalDoc Assistant AI and is intended for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.',
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`Clinical_Summary_${timestamp.replace(/\//g, '-')}.pdf`);
};
