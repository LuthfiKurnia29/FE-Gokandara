import { NextRequest, NextResponse } from 'next/server';

import PDFDocument from 'pdfkit';

interface TransaksiData {
  id: number;
  no_transaksi: number;
  konsumen?: {
    name: string;
    nama?: string;
    email?: string;
    telepon?: string;
    phone?: string;
    alamat?: string;
    address?: string;
    nomor_ktp?: string;
    ktp_number?: string;
  };
  properti?: {
    name?: string;
    lokasi?: string;
    address?: string;
    harga?: number;
  };
  projek?: {
    name?: string;
    address?: string;
  };
  tipe?: {
    name?: string;
    nama?: string;
    luas_bangunan?: string;
    luas_tanah?: string;
  };
  blok?: {
    name?: string;
  };
  unit?: {
    name?: string;
  };
  skema_pembayaran?: {
    nama?: string;
    name?: string;
    details?: Array<{
      id: number;
      nama: string;
      persentase: number;
    }>;
  };
  skemaPembayaran?: {
    nama?: string;
    name?: string;
    details?: Array<{
      id: number;
      nama: string;
      persentase: number;
    }>;
  };
  detail_pembayaran?: Array<{
    detail_skema_pembayaran_id: number;
    tanggal: string;
  }>;
  harga?: number;
  harga_asli?: number;
  kelebihan_tanah?: number;
  harga_per_meter?: number;
  diskon?: number;
  tipe_diskon?: string;
  dp?: number;
  grand_total: number;
  status: string;
  created_by?: {
    name?: string;
    nama?: string;
    parent?: {
      name?: string;
      nama?: string;
    };
  };
  created_at?: string;
  kavling_dipesan?: string;
}

// Helper function to format currency
const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Generate document number
const generateDocNumber = (transaksi: TransaksiData): string => {
  const date = new Date(transaksi.created_at || new Date());
  const month = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][date.getMonth()];
  const year = date.getFullYear();
  return `SPR/KDR-RHUMA/${transaksi.no_transaksi || transaksi.id}/${month}/${year}`;
};

// Fetch transaksi data from backend API
async function fetchTransaksiData(id: string, token: string): Promise<TransaksiData> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-gokandara.crewcrew.net/api';

    const response = await fetch(
      `${apiUrl}/get-transaksi/${id}?include=konsumen,properti,blok,tipe,unit,projek,skema_pembayaran,created_by,detail_pembayaran`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch transaksi data: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
  } catch (error) {
    console.error('Error fetching transaksi:', error);
    throw error;
  }
}

// Create PDF header with RHUMA branding
function createHeader(doc: typeof PDFDocument.prototype, transaksi: TransaksiData) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 50;

  // Header - RHUMA branding
  doc.fontSize(24).font('Helvetica-Bold').text('RHUMA', margin, margin);
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('by Kardara', margin, margin + 25);

  // Contact info on the right
  doc.fontSize(9);
  const rightX = pageWidth - margin - 200;
  doc.text('0811 9000 8000', rightX, margin, { align: 'right', width: 200 });
  doc.text('rhuma.bykardara@gmail.com', rightX, margin + 12, { align: 'right', width: 200 });
  doc.text('@rhumabykardara', rightX, margin + 24, { align: 'right', width: 200 });
  doc.text('www.rhuma.id', rightX, margin + 36, { align: 'right', width: 200 });

  doc.fontSize(8).text('Jl. Kapatenku No. 34, Lowokwaru,', rightX, margin + 52, { align: 'right', width: 200 });
  doc.text('Malang, Jawa Timur 65141', rightX, margin + 64, { align: 'right', width: 200 });

  // Horizontal line
  doc
    .moveTo(margin, margin + 85)
    .lineTo(pageWidth - margin, margin + 85)
    .stroke();

  return margin + 95;
}

// Create document title
function createTitle(doc: typeof PDFDocument.prototype, y: number, transaksi: TransaksiData) {
  const pageWidth = doc.page.width;
  const margin = 50;

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('SURAT PEMESANAN RUMAH (SPR)', margin, y, { align: 'center', width: pageWidth - 2 * margin });

  const docNumber = generateDocNumber(transaksi);
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(`Nomor: ${docNumber}`, margin, y + 25, { align: 'center', width: pageWidth - 2 * margin });

  return y + 50;
}

// Section I: Buyer Data
function createBuyerSection(doc: typeof PDFDocument.prototype, y: number, transaksi: TransaksiData) {
  const margin = 50;
  const pageWidth = doc.page.width;
  const labelX = margin;
  const valueX = margin + 150;
  const lineHeight = 20;

  doc.fontSize(11).font('Helvetica-Bold').text('I. DATA PEMBELI', margin, y);
  y += 25;

  doc.fontSize(10).font('Helvetica');

  // Nama Lengkap
  doc.text('Nama Lengkap', labelX, y);
  doc.text(': ', valueX - 10, y);
  doc.text('_____________________________________________', valueX, y);
  if (transaksi.konsumen?.name || transaksi.konsumen?.nama) {
    doc.text(transaksi.konsumen?.name || transaksi.konsumen?.nama || '', valueX, y);
  }
  y += lineHeight;

  // Alamat
  doc.text('Alamat', labelX, y);
  doc.text(': ', valueX - 10, y);
  doc.text('_____________________________________________', valueX, y);
  if (transaksi.konsumen?.alamat || transaksi.konsumen?.address) {
    doc.text(transaksi.konsumen?.alamat || transaksi.konsumen?.address || '', valueX, y);
  }
  y += lineHeight;

  // Nomor KTP
  doc.text('Nomor KTP', labelX, y);
  doc.text(': ', valueX - 10, y);
  doc.text('_____________________________________________', valueX, y);
  if (transaksi.konsumen?.nomor_ktp || transaksi.konsumen?.ktp_number) {
    doc.text(transaksi.konsumen?.nomor_ktp || transaksi.konsumen?.ktp_number || '', valueX, y);
  }
  y += lineHeight;

  // Nomor Telepon/HP
  doc.text('Nomor Telepon/HP', labelX, y);
  doc.text(': ', valueX - 10, y);
  doc.text('_____________________________________________', valueX, y);
  if (transaksi.konsumen?.telepon || transaksi.konsumen?.phone) {
    doc.text(transaksi.konsumen?.telepon || transaksi.konsumen?.phone || '', valueX, y);
  }
  y += lineHeight + 10;

  return y;
}

// Section II: Unit Data
function createUnitSection(doc: typeof PDFDocument.prototype, y: number, transaksi: TransaksiData) {
  const margin = 50;
  const pageWidth = doc.page.width;
  const labelX = margin;
  const valueX = margin + 150;
  const lineHeight = 20;

  doc.fontSize(11).font('Helvetica-Bold').text('II. DATA UNIT YANG DIPESAN', margin, y);
  y += 25;

  doc.fontSize(10).font('Helvetica');

  // Nama Proyek
  doc.text('Nama Proyek', labelX, y);
  doc.text(': ', valueX - 10, y);
  doc.text('_____________________________________________', valueX, y);
  const projectName = transaksi.projek?.name || transaksi.properti?.name || '';
  if (projectName) {
    doc.text(projectName, valueX, y);
  }
  y += lineHeight;

  // Alamat Lokasi
  doc.text('Alamat Lokasi', labelX, y);
  doc.text(': ', valueX - 10, y);
  doc.text('_____________________________________________', valueX, y);
  const projectAddress = transaksi.projek?.address || transaksi.properti?.lokasi || transaksi.properti?.address || '';
  if (projectAddress) {
    doc.text(projectAddress, valueX, y);
  }
  y += lineHeight;

  // Nomor Kavling/Unit
  doc.text('Nomor Kavling/Unit', labelX, y);
  doc.text(': ', valueX - 10, y);
  doc.text('_____________________________________________', valueX, y);
  const unitInfo =
    `${transaksi.blok?.name || ''} ${transaksi.unit?.name || ''}`.trim() || transaksi.kavling_dipesan || '';
  if (unitInfo) {
    doc.text(unitInfo, valueX, y);
  }
  y += lineHeight;

  // Tipe Bangunan
  doc.text('Tipe Bangunan', labelX, y);
  doc.text(': ', valueX - 10, y);
  const luasBangunan = transaksi.tipe?.luas_bangunan || '';
  const luasTanah = transaksi.tipe?.luas_tanah || '';
  const tipeText = `_________ m² (Luas Bangunan)  /  _________ m² (Luas Tanah)`;
  doc.text(tipeText, valueX, y);
  if (luasBangunan && luasTanah) {
    doc.text(`${luasBangunan} m² (Luas Bangunan)  /  ${luasTanah} m² (Luas Tanah)`, valueX, y);
  }
  y += lineHeight;

  // Harga Jual
  doc.text('Harga Jual', labelX, y);
  doc.text(': Rp ', valueX - 10, y);
  doc.text('_____________________________________________', valueX, y);
  if (transaksi.grand_total) {
    doc.text(formatRupiah(transaksi.grand_total), valueX, y);
  }
  y += lineHeight;

  // Metode Pembayaran
  doc.text('Metode Pembayaran', labelX, y);
  doc.text(': ', valueX - 10, y);
  y += 5;

  const skemaName = (transaksi.skema_pembayaran?.nama || transaksi.skemaPembayaran?.nama || '').toLowerCase();
  const checkboxY = y;
  const checkboxSize = 12;
  const checkboxSpacing = 100;

  // Cash Keras
  doc.rect(valueX, checkboxY, checkboxSize, checkboxSize).stroke();
  if (skemaName.includes('cash keras') || skemaName.includes('hard cash')) {
    doc.text('✓', valueX + 2, checkboxY);
  }
  doc.text('Cash Keras', valueX + checkboxSize + 5, checkboxY);

  // Cash by Progress
  doc.rect(valueX + checkboxSpacing, checkboxY, checkboxSize, checkboxSize).stroke();
  if (skemaName.includes('progress') || skemaName.includes('bertahap')) {
    doc.text('✓', valueX + checkboxSpacing + 2, checkboxY);
  }
  doc.text('Cash by Progress', valueX + checkboxSpacing + checkboxSize + 5, checkboxY);

  // KPR
  doc.rect(valueX + checkboxSpacing * 2, checkboxY, checkboxSize, checkboxSize).stroke();
  if (skemaName.includes('kpr')) {
    doc.text('✓', valueX + checkboxSpacing * 2 + 2, checkboxY);
  }
  doc.text('KPR', valueX + checkboxSpacing * 2 + checkboxSize + 5, checkboxY);

  // Inhouse
  doc.rect(valueX + checkboxSpacing * 2.6, checkboxY, checkboxSize, checkboxSize).stroke();
  if (skemaName.includes('inhouse') || skemaName.includes('in house') || skemaName.includes('kredit')) {
    doc.text('✓', valueX + checkboxSpacing * 2.6 + 2, checkboxY);
  }
  doc.text('Inhouse (___)', valueX + checkboxSpacing * 2.6 + checkboxSize + 5, checkboxY);

  y += lineHeight + 5;

  // Booking Fee/Tanda Jadi
  doc.text('Booking Fee/Tanda Jadi', labelX, y);
  doc.text(': Rp ', valueX - 10, y);
  doc.text('_____________________________________________', valueX, y);
  // Booking fee is typically a fixed amount or the first payment
  y += lineHeight;

  // Detail Tahap Akhir
  doc.text('Detail Tahap Akhir', labelX, y);
  doc.text(': ', valueX - 10, y);
  y += 5;

  // Furnish / Non Furnish checkboxes
  doc.rect(valueX, y, checkboxSize, checkboxSize).stroke();
  doc.text('Furnish', valueX + checkboxSize + 5, y);

  doc.rect(valueX + 100, y, checkboxSize, checkboxSize).stroke();
  doc.text('Non Furnish', valueX + 100 + checkboxSize + 5, y);

  y += lineHeight + 10;

  return y;
}

// Section III: Payment Schedule
function createPaymentSection(doc: typeof PDFDocument.prototype, y: number, transaksi: TransaksiData) {
  const margin = 50;
  const pageWidth = doc.page.width;
  const tableWidth = pageWidth - 2 * margin;

  doc.fontSize(11).font('Helvetica-Bold').text('III. RINCIAN PEMBAYARAN', margin, y);
  y += 25;

  // Table headers
  const colWidths = [30, 150, 100, 120, 140];
  const tableX = margin;
  const rowHeight = 25;

  // Header row
  doc.rect(tableX, y, tableWidth, rowHeight).stroke();
  doc.fontSize(9).font('Helvetica-Bold');

  let currentX = tableX;
  doc.text('No', currentX + 5, y + 8, { width: colWidths[0] - 10, align: 'center' });
  currentX += colWidths[0];

  doc.rect(currentX, y, 0, rowHeight).stroke();
  doc.text('Pembayaran', currentX + 5, y + 8, { width: colWidths[1] - 10, align: 'left' });
  currentX += colWidths[1];

  doc.rect(currentX, y, 0, rowHeight).stroke();
  doc.text('Tanggal', currentX + 5, y + 8, { width: colWidths[2] - 10, align: 'center' });
  currentX += colWidths[2];

  doc.rect(currentX, y, 0, rowHeight).stroke();
  doc.text('Nominal (Rp)', currentX + 5, y + 8, { width: colWidths[3] - 10, align: 'center' });
  currentX += colWidths[3];

  doc.rect(currentX, y, 0, rowHeight).stroke();
  doc.text('Keterangan', currentX + 5, y + 8, { width: colWidths[4] - 10, align: 'center' });

  y += rowHeight;

  // Calculate payment rows
  const skemaPembayaran = transaksi.skema_pembayaran || transaksi.skemaPembayaran;
  const detailPembayaran = transaksi.detail_pembayaran || [];

  // Create a map of detail_pembayaran by detail_skema_pembayaran_id
  const detailPembayaranMap = new Map();
  detailPembayaran.forEach((dp: any) => {
    detailPembayaranMap.set(dp.detail_skema_pembayaran_id, dp);
  });

  const basePrice = Number(transaksi.harga ?? transaksi.harga_asli ?? transaksi.properti?.harga ?? 0);
  const kelebihanMeter = Number(transaksi.kelebihan_tanah ?? 0);
  const hargaPerMeter = Number(transaksi.harga_per_meter ?? 0);
  const subtotal = Math.max(basePrice + Math.max(0, kelebihanMeter) * Math.max(0, hargaPerMeter), 0);

  const diskonVal = Number(transaksi.diskon ?? 0);
  const tipeDiskon = String(transaksi.tipe_diskon ?? '').toLowerCase();
  const isPercentDiskon = tipeDiskon === 'percent' || tipeDiskon === 'persen';

  const discountAmount = (() => {
    if (!diskonVal || subtotal <= 0) return 0;
    if (isPercentDiskon) {
      const pct = Math.max(0, Math.min(diskonVal, 100));
      return Math.round(subtotal * (pct / 100));
    }
    return Math.min(diskonVal, subtotal);
  })();

  const finalPrice = Math.max(subtotal - discountAmount, 0);

  // Data rows
  doc.font('Helvetica');
  let rowNumber = 1;
  const maxRows = 6; // Leave space for page 2

  if (skemaPembayaran?.details && Array.isArray(skemaPembayaran.details)) {
    for (let i = 0; i < Math.min(skemaPembayaran.details.length, maxRows); i++) {
      const detail = skemaPembayaran.details[i];
      const amount = Math.round((finalPrice * detail.persentase) / 100);
      const detailPembayaranItem = detailPembayaranMap.get(detail.id);
      const tanggal = detailPembayaranItem?.tanggal ? formatDate(detailPembayaranItem.tanggal) : '';

      doc.rect(tableX, y, tableWidth, rowHeight).stroke();

      currentX = tableX;
      doc.text(rowNumber.toString(), currentX + 5, y + 8, { width: colWidths[0] - 10, align: 'center' });
      currentX += colWidths[0];

      doc.rect(currentX, y, 0, rowHeight).stroke();
      doc.text(detail.nama || '', currentX + 5, y + 8, { width: colWidths[1] - 10, align: 'left' });
      currentX += colWidths[1];

      doc.rect(currentX, y, 0, rowHeight).stroke();
      doc.text(tanggal, currentX + 5, y + 8, { width: colWidths[2] - 10, align: 'center' });
      currentX += colWidths[2];

      doc.rect(currentX, y, 0, rowHeight).stroke();
      doc.text(amount.toLocaleString('id-ID'), currentX + 5, y + 8, { width: colWidths[3] - 10, align: 'right' });
      currentX += colWidths[3];

      doc.rect(currentX, y, 0, rowHeight).stroke();
      doc.text('', currentX + 5, y + 8, { width: colWidths[4] - 10, align: 'left' });

      y += rowHeight;
      rowNumber++;
    }
  }

  // Fill empty rows to maintain table structure
  while (rowNumber <= maxRows) {
    doc.rect(tableX, y, tableWidth, rowHeight).stroke();

    currentX = tableX;
    doc.text('', currentX + 5, y + 8, { width: colWidths[0] - 10, align: 'center' });
    currentX += colWidths[0];

    for (let j = 1; j < colWidths.length; j++) {
      doc.rect(currentX, y, 0, rowHeight).stroke();
      currentX += colWidths[j];
    }

    y += rowHeight;
    rowNumber++;
  }

  return y + 10;
}

// Create Page 2: Terms and Signatures
function createPage2(doc: typeof PDFDocument.prototype, transaksi: TransaksiData) {
  doc.addPage();

  const margin = 50;
  const pageWidth = doc.page.width;
  let y = margin;

  // Header on page 2
  y = createHeader(doc, transaksi);

  // Section IV: Terms
  doc.fontSize(11).font('Helvetica-Bold').text('IV. KETENTUAN', margin, y);
  y += 20;

  doc.fontSize(9).font('Helvetica');

  const terms = [
    {
      label: 'A. NUP (Nomor Urut Pemesanan)',
      text: 'sebesar Rp 5.000.000,- berlaku selama 2 hari sebagai tanda minat awal pembelian unit dan bersifat refundable 100%. Apabila NUP sudah dibayarkan, konsumen akan dilakukan sebelum pemilihan unit dan akan dikonversi menjadi Booking Fee / Ikatan Tanda Jadi (ITJ) setelah pemilihan unit dilakukan dan formulir pemesanan ditandatangani.'
    },
    {
      label: 'B. Booking Fee / Ikatan Tanda Jadi (ITJ)',
      text: 'sebesar Rp 10.000.000,- berlaku selama 7 hari sejak ditandatangani form pemesanan. Booking Fee / Ikatan Tanda Jadi (ITJ) bersifat refundable (100%) dengan ketentuan bahwa pembeli membatalkan pemesanan sebelum melewati batas waktu tersebut. Apabila pembeli mengundurkan diri setelah melewati batas waktu atau pihak Developer terkait harga dan posisi kavling, maka Booking Fee / Ikatan Tanda Jadi (ITJ) tidak dapat dikembalikan.'
    },
    {
      label: 'C. Pembayaran Down Payment (DP)',
      text: 'dianggap sah apabila dibayarkan melalui transfer dan atau dibayarkan kepada pihak developer diatas kwitansi asli developer.'
    },
    {
      label: 'D. Serah Terima Unit',
      text: 'rumah akan dilakukan oleh pihak developer kepada user, setelah bangunan unit rumah selesai 100% dan semua fasilitas rumah (PDAM, PLN) sudah terpasang/berfungsi, yang diikuti dengan perlantantanganan Berita Acara Serah Terima Unit Rumah.'
    }
  ];

  terms.forEach((term, index) => {
    const labelHeight = doc.heightOfString(term.label, { width: pageWidth - 2 * margin });
    doc.font('Helvetica-Bold').text(term.label, margin, y, { width: pageWidth - 2 * margin });
    y += labelHeight + 2;

    const textHeight = doc.heightOfString(term.text, { width: pageWidth - 2 * margin - 15 });
    doc.font('Helvetica').text(term.text, margin + 15, y, { width: pageWidth - 2 * margin - 15, align: 'justify' });
    y += textHeight + 10;
  });

  y += 10;

  // Section V: Signatures
  doc.fontSize(11).font('Helvetica-Bold').text('V. TANDA TANGAN', margin, y);
  y += 30;

  const col1X = margin;
  const col2X = margin + 180;
  const col3X = margin + 360;

  // Pembeli
  doc.fontSize(10).font('Helvetica').text('Pembeli', col1X, y);
  y += 60;
  doc.text(`Nama    : ${'_'.repeat(20)}`, col1X, y);
  y += 15;
  doc.text(`Tanggal : ___ / ___ / 2025`, col1X, y);

  // Developer - Sales Supervisor
  y = doc.y - 75; // Reset y for next column
  doc.text('Developer', col2X, y);
  y += 60;
  doc.text(`Nama    : ${'_'.repeat(20)}`, col2X, y);
  const supervisorName = transaksi.created_by?.parent?.name || transaksi.created_by?.parent?.nama || '';
  if (supervisorName) {
    doc.text(`Nama    : ${supervisorName}`, col2X, y);
  }
  y += 15;
  doc.text('Jabatan : Sales Supervisor', col2X, y);
  y += 15;
  doc.text(`Tanggal : ___ / ___ / 2025`, col2X, y);

  // Developer - Sales Staff
  y = doc.y - 90; // Reset y for next column
  doc.text('Developer', col3X, y);
  y += 60;
  doc.text(`Nama    : ${'_'.repeat(20)}`, col3X, y);
  const salesName = transaksi.created_by?.name || transaksi.created_by?.nama || '';
  if (salesName) {
    doc.text(`Nama    : ${salesName}`, col3X, y);
  }
  y += 15;
  doc.text('Jabatan : Sales Staff', col3X, y);
  y += 15;
  doc.text(`Tanggal : ___ / ___ / 2025`, col3X, y);

  // Lampiran
  y = doc.y + 30;
  doc.fontSize(10).font('Helvetica-Bold').text('Lampiran:', margin, y);
  y += 20;
  doc.fontSize(9).font('Helvetica');
  doc.text('• Fotokopi KTP Pembeli', margin + 10, y);
  y += 15;
  doc.text('• Bukti Pembayaran Booking Fee', margin + 10, y);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    // Extract token from request headers
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || '';

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    // Fetch transaksi data
    const transaksi = await fetchTransaksiData(id, token);

    if (!transaksi) {
      return NextResponse.json({ error: 'Transaksi not found' }, { status: 404 });
    }

    // Create PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    // Set response headers
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
    });

    // Generate PDF content
    let y = createHeader(doc, transaksi);
    y = createTitle(doc, y, transaksi);
    y = createBuyerSection(doc, y, transaksi);
    y = createUnitSection(doc, y, transaksi);
    y = createPaymentSection(doc, y, transaksi);

    // Page 2: Terms and Signatures
    createPage2(doc, transaksi);

    // Finalize PDF
    doc.end();

    const pdfBuffer = await pdfPromise;

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="SPR-${transaksi.no_transaksi || transaksi.id}.pdf"`
      }
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
