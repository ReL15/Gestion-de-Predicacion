import jsPDF from 'jspdf';
import { WeeklyAssignment, PublicPreachingAssignment, Congregation } from '../types';

export class PdfGenerator {
  /**
   * Genera el PDF del Programa Semanal de Predicación en formato horizontal
   */
  static generateWeeklyProgramPdf(
    congregation: Congregation,
    assignments: WeeklyAssignment[],
    titleSuffix = 'PROGRAMA SEMANAL DE PREDICACIÓN'
  ): jsPDF {
    // Orientación horizontal 'l' (landscape), tamaño A4
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Encabezado
    doc.setFillColor(33, 53, 71); // Azul pizarra elegante y sobrio
    doc.rect(0, 0, pageWidth, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(titleSuffix, 14, 11);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${congregation.name} • Circuito: ${congregation.circuit || 'N/A'} • Zona: ${congregation.timezone}`, 14, 18);

    // Cabecera de la tabla
    let y = 32;
    doc.setFillColor(240, 243, 246);
    doc.rect(14, y - 5, pageWidth - 28, 9, 'F');

    doc.setTextColor(50, 60, 70);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    const colX = {
      fecha: 16,
      hora: 46,
      lugar: 72,
      encargado: 140,
      territorio: 200,
      notas: 236,
    };

    doc.text('FECHA', colX.fecha, y);
    doc.text('HORA', colX.hora, y);
    doc.text('LUGAR DE SALIDA', colX.lugar, y);
    doc.text('ENCARGADO', colX.encargado, y);
    doc.text('TERRITORIO', colX.territorio, y);
    doc.text('OBSERVACIONES', colX.notas, y);

    doc.setDrawColor(210, 215, 220);
    doc.line(14, y + 3, pageWidth - 14, y + 3);

    // Filas
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);

    assignments.forEach((item, index) => {
      if (y > 185) {
        doc.addPage();
        y = 25;
      }

      // Alternar fondo tenue
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
      }

      doc.text(item.date || '-', colX.fecha, y);
      doc.text(item.time || '-', colX.hora, y);
      doc.text(doc.splitTextToSize(item.placeName || '-', 64), colX.lugar, y);
      doc.text(doc.splitTextToSize(item.leaderName || '-', 56), colX.encargado, y);
      doc.text(`Terr. ${item.territoryNumber || '-'}`, colX.territorio, y);
      doc.text(doc.splitTextToSize(item.notes || '', 48), colX.notas, y);

      y += 8;
    });

    // Pie de página
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(130, 140, 150);
      doc.text(
        `Generado el ${new Date().toLocaleDateString('es-ES')} - Congregación ${congregation.name} - Página ${i} de ${totalPages}`,
        14,
        200
      );
    }

    return doc;
  }

  /**
   * Genera el PDF de Predicación Pública con exhibidores
   */
  static generatePublicPreachingPdf(
    congregation: Congregation,
    assignments: PublicPreachingAssignment[]
  ): jsPDF {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Encabezado
    doc.setFillColor(37, 99, 102); // Tono azul verdoso sobrio
    doc.rect(0, 0, pageWidth, 22, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROGRAMA DE PREDICACIÓN PÚBLICA (EXHIBIDORES)', 14, 11);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${congregation.name} • Turnos asignados de 2 a 3 participantes`, 14, 18);

    // Cabecera
    let y = 32;
    doc.setFillColor(240, 245, 245);
    doc.rect(14, y - 5, pageWidth - 28, 9, 'F');

    doc.setTextColor(40, 60, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    const colX = {
      fecha: 16,
      hora: 48,
      lugar: 78,
      participantes: 160,
      notas: 236,
    };

    doc.text('FECHA', colX.fecha, y);
    doc.text('HORA', colX.hora, y);
    doc.text('PUNTO DE EXHIBIDOR', colX.lugar, y);
    doc.text('PARTICIPANTES (2-3 HERMANOS)', colX.participantes, y);
    doc.text('NOTAS', colX.notas, y);

    doc.setDrawColor(200, 215, 215);
    doc.line(14, y + 3, pageWidth - 14, y + 3);

    // Filas
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);

    assignments.forEach((item, index) => {
      if (y > 185) {
        doc.addPage();
        y = 25;
      }

      if (index % 2 === 1) {
        doc.setFillColor(248, 252, 252);
        doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
      }

      doc.text(item.date || '-', colX.fecha, y);
      doc.text(item.time || '-', colX.hora, y);
      doc.text(doc.splitTextToSize(item.placeName || '-', 78), colX.lugar, y);

      const partText = item.participants.map(p => `${p.userName}${p.isFixed ? ' (Fijo)' : ''}`).join(' • ');
      doc.text(doc.splitTextToSize(partText, 72), colX.participantes, y);
      doc.text(doc.splitTextToSize(item.notes || '', 48), colX.notas, y);

      y += 8;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(130, 140, 150);
      doc.text(
        `Predicación Pública • ${congregation.name} • Generado el ${new Date().toLocaleDateString('es-ES')} - Página ${i} de ${totalPages}`,
        14,
        200
      );
    }

    return doc;
  }
}
