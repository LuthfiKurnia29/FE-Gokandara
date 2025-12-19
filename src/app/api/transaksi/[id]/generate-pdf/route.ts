import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import fs from 'fs';
import path from 'path';

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

// Create PDF using jsPDF
function createPDF(transaksi: TransaksiData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // Set font to support Unicode characters
  doc.setFont('helvetica');

  // Header - RHUMA logo
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo_kandara.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

    // Add logo image (adjust width and height as needed)
    doc.addImage(logoBase64, 'PNG', margin, y - 3, 30, 15);
  } catch (error) {
    console.error('Error loading logo:', error);
    // Fallback to text if image fails
    doc.setFontSize(16).setFont('helvetica', 'bold').text('RHUMA', margin, y);
    doc.setFontSize(8).setFont('helvetica', 'normal').text('by Kardara', margin, y + 7);
  }

  // Contact info on the right
  doc.setFontSize(7);
  const rightX = pageWidth - margin - 50;
  doc.text('0811 9000 8000', rightX, y, { align: 'right' });
  doc.text('rhuma.bykardara@gmail.com', rightX, y + 5, { align: 'right' });
  doc.text('@rhumabykardara', rightX, y + 10, { align: 'right' });
  doc.text('www.rhuma.id', rightX, y + 15, { align: 'right' });
  doc.setFontSize(6).text('Jl. Kapatenku No. 34, Lowokwaru,', rightX, y + 20, { align: 'right' });
  doc.text('Malang, Jawa Timur 65141', rightX, y + 24, { align: 'right' });

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(margin, y + 30, pageWidth - margin, y + 30);

  y += 40;

  // Document title
  doc.setFontSize(12).setFont('helvetica', 'bold').text('SURAT PEMESANAN RUMAH (SPR)', pageWidth / 2, y, { align: 'center' });
  const docNumber = generateDocNumber(transaksi);
  doc.setFontSize(8).setFont('helvetica', 'normal').text(`Nomor: ${docNumber}`, pageWidth / 2, y + 8, { align: 'center' });
  y += 20;

  // Section I: Buyer Data
  doc.setFontSize(10).setFont('helvetica', 'bold').text('I. DATA PEMBELI', margin, y);
  y += 10;
  doc.setFontSize(9).setFont('helvetica', 'normal');

  // Buyer information
  const buyerFields = [
    { label: 'Nama Lengkap', value: transaksi.konsumen?.name || transaksi.konsumen?.nama || '' },
    { label: 'Alamat', value: transaksi.konsumen?.alamat || transaksi.konsumen?.address || '' },
    { label: 'Nomor KTP', value: transaksi.konsumen?.nomor_ktp || transaksi.konsumen?.ktp_number || '' },
    { label: 'Nomor Telepon/HP', value: transaksi.konsumen?.telepon || transaksi.konsumen?.phone || '' }
  ];

  buyerFields.forEach(field => {
    doc.text(`${field.label}:`, margin, y);
    doc.text(field.value || '_________________________', margin + 40, y);
    y += 7;
  });

  y += 5;

  // Section II: Unit Data
  doc.setFontSize(10).setFont('helvetica', 'bold').text('II. DATA UNIT YANG DIPESAN', margin, y);
  y += 10;
  doc.setFontSize(9).setFont('helvetica', 'normal');

  const projectName = transaksi.projek?.name || transaksi.properti?.name || '';
  const projectAddress = transaksi.projek?.address || transaksi.properti?.lokasi || transaksi.properti?.address || '';
  const unitInfo = `${transaksi.blok?.name || ''} ${transaksi.unit?.name || ''}`.trim() || transaksi.kavling_dipesan || '';
  const luasBangunan = transaksi.tipe?.luas_bangunan || '';
  const luasTanah = transaksi.tipe?.luas_tanah || '';

  const unitFields = [
    { label: 'Nama Proyek', value: projectName },
    { label: 'Alamat Lokasi', value: projectAddress },
    { label: 'Nomor Kavling/Unit', value: unitInfo },
    { label: 'Tipe Bangunan', value: luasBangunan && luasTanah ? `${luasBangunan} m² / ${luasTanah} m²` : '________ m² / ________ m²' },
    { label: 'Harga Jual', value: transaksi.grand_total ? formatRupiah(transaksi.grand_total) : '' }
  ];

  unitFields.forEach(field => {
    doc.text(`${field.label}:`, margin, y);
    if (field.label === 'Harga Jual') {
      doc.text('Rp ', margin + 40, y);
      doc.text(field.value || '_________________________', margin + 50, y);
    } else {
      doc.text(field.value || '_________________________', margin + 40, y);
    }
    y += 7;
  });

  // Payment method checkboxes
  doc.text('Metode Pembayaran:', margin, y);
  y += 5;

  const skemaName = (transaksi.skema_pembayaran?.nama || transaksi.skemaPembayaran?.nama || '').toLowerCase();
  const checkboxY = y;
  const checkboxSize = 3;

  // Cash Keras
  doc.rect(margin + 40, checkboxY - 2, checkboxSize, checkboxSize);
  if (skemaName.includes('cash keras') || skemaName.includes('hard cash')) {
    doc.text('✓', margin + 40.5, checkboxY + 0.5);
  }
  doc.text('Cash Keras', margin + 45, checkboxY);

  // Cash by Progress
  doc.rect(margin + 80, checkboxY - 2, checkboxSize, checkboxSize);
  if (skemaName.includes('progress') || skemaName.includes('bertahap')) {
    doc.text('✓', margin + 80.5, checkboxY + 0.5);
  }
  doc.text('Cash by Progress', margin + 85, checkboxY);

  // KPR
  doc.rect(margin + 130, checkboxY - 2, checkboxSize, checkboxSize);
  if (skemaName.includes('kpr')) {
    doc.text('✓', margin + 130.5, checkboxY + 0.5);
  }
  doc.text('KPR', margin + 135, checkboxY);

  // Inhouse
  doc.rect(margin + 150, checkboxY - 2, checkboxSize, checkboxSize);
  if (skemaName.includes('inhouse') || skemaName.includes('in house') || skemaName.includes('kredit')) {
    doc.text('✓', margin + 150.5, checkboxY + 0.5);
  }
  doc.text('Inhouse', margin + 155, checkboxY);

  y += 10;

  // Section III: Payment Schedule
  doc.setFontSize(10).setFont('helvetica', 'bold').text('III. RINCIAN PEMBAYARAN', margin, y);
  y += 10;

  // Table headers
  const tableHeaders = ['No', 'Pembayaran', 'Tanggal', 'Nominal (Rp)', 'Keterangan'];
  const colWidths = [10, 40, 25, 35, 30];
  const tableX = margin;
  const rowHeight = 8;
  let currentX = tableX;

  doc.setFontSize(8).setFont('helvetica', 'bold');
  tableHeaders.forEach((header, index) => {
    doc.text(header, currentX + 1, y);
    currentX += colWidths[index];
  });

  y += rowHeight;

  // Calculate payment details
  const skemaPembayaran = transaksi.skema_pembayaran || transaksi.skemaPembayaran;
  const detailPembayaran = transaksi.detail_pembayaran || [];
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

  // Payment rows
  doc.setFontSize(7).setFont('helvetica', 'normal');
  let rowNumber = 1;
  const maxRows = 6;

  if (skemaPembayaran?.details && Array.isArray(skemaPembayaran.details)) {
    for (let i = 0; i < Math.min(skemaPembayaran.details.length, maxRows); i++) {
      const detail = skemaPembayaran.details[i];
      const amount = Math.round((finalPrice * detail.persentase) / 100);
      const detailPembayaranItem = detailPembayaranMap.get(detail.id);
      const tanggal = detailPembayaranItem?.tanggal ? formatDate(detailPembayaranItem.tanggal) : '';

      currentX = tableX;
      doc.text(rowNumber.toString(), currentX + 1, y);
      currentX += colWidths[0];

      doc.text(detail.nama || '', currentX + 1, y);
      currentX += colWidths[1];

      doc.text(tanggal, currentX + 1, y, { align: 'center' });
      currentX += colWidths[2];

      doc.text(amount.toLocaleString('id-ID'), currentX + 1, y, { align: 'right' });
      currentX += colWidths[3];

      doc.text('', currentX + 1, y);

      y += rowHeight;
      rowNumber++;
    }
  }

  // Fill empty rows
  while (rowNumber <= maxRows) {
    currentX = tableX;
    for (let j = 0; j < colWidths.length; j++) {
      doc.text('', currentX + 1, y);
      currentX += colWidths[j];
    }
    y += rowHeight;
    rowNumber++;
  }

  // Add new page for terms and signatures
  doc.addPage();
  y = margin;

  // Header on page 2
  try {
    const logoPath = path.join(process.cwd(), 'public', 'images', 'logo_kandara.png');
    const logoBuffer = fs.readFileSync(logoPath);
    const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

    // Add logo image (adjust width and height as needed)
    doc.addImage(logoBase64, 'PNG', margin, y - 3, 30, 15);
  } catch (error) {
    console.error('Error loading logo:', error);
    // Fallback to text if image fails
    doc.setFontSize(16).setFont('helvetica', 'bold').text('RHUMA', margin, y);
    doc.setFontSize(8).setFont('helvetica', 'normal').text('by Kardara', margin, y + 7);
  }
  y += 20;

  // Section IV: Terms
  doc.setFontSize(10).setFont('helvetica', 'bold').text('IV. KETENTUAN', margin, y);
  y += 10;

  doc.setFontSize(7).setFont('helvetica', 'normal');

  const terms = [
    {
      label: 'A. NUP (Nomor Urut Pemesanan)',
      text: 'sebesar Rp 5.000.000,- berlaku selama 2 hari sebagai tanda minat awal pembelian unit dan bersifat refundable 100%.'
    },
    {
      label: 'B. Booking Fee / Ikatan Tanda Jadi (ITJ)',
      text: 'sebesar Rp 10.000.000,- berlaku selama 7 hari sejak ditandatangani form pemesanan. Booking Fee / Ikatan Tanda Jadi (ITJ) bersifat refundable (100%).'
    },
    {
      label: 'C. Pembayaran Down Payment (DP)',
      text: 'dianggap sah apabila dibayarkan melalui transfer dan atau dibayarkan kepada pihak developer diatas kwitansi asli developer.'
    },
    {
      label: 'D. Serah Terima Unit',
      text: 'rumah akan dilakukan oleh pihak developer kepada user, setelah bangunan unit rumah selesai 100% dan semua fasilitas rumah (PDAM, PLN) sudah terpasang/berfungsi.'
    }
  ];

  terms.forEach((term, index) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
    }

    doc.setFont('helvetica', 'bold').text(term.label, margin, y);
    y += 5;

    // Split long text into lines
    const lines = doc.splitTextToSize(term.text, pageWidth - 2 * margin - 10);
    doc.setFont('helvetica', 'normal');
    lines.forEach((line: string) => {
      if (y > pageHeight - 15) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + 10, y);
      y += 4;
    });
    y += 3;
  });

  y += 10;

  // Section V: Signatures
  doc.setFontSize(10).setFont('helvetica', 'bold').text('V. TANDA TANGAN', margin, y);
  y += 15;

  const col1X = margin;
  const col2X = margin + 50;
  const col3X = margin + 100;

  // Pembeli
  doc.setFontSize(8).setFont('helvetica', 'normal').text('Pembeli', col1X, y);
  y += 20;
  doc.text(`Nama    : ${'_'.repeat(15)}`, col1X, y);
  y += 5;
  doc.text(`Tanggal : ___ / ___ / 2025`, col1X, y);

  // Developer - Sales Supervisor
  y = y - 25;
  doc.text('Developer', col2X, y);
  y += 20;
  doc.text(`Nama    : ${'_'.repeat(15)}`, col2X, y);
  const supervisorName = transaksi.created_by?.parent?.name || transaksi.created_by?.parent?.nama || '';
  if (supervisorName) {
    doc.text(`Nama    : ${supervisorName}`, col2X, y);
  }
  y += 5;
  doc.text('Jabatan : Sales Supervisor', col2X, y);
  y += 5;
  doc.text(`Tanggal : ___ / ___ / 2025`, col2X, y);

  // Developer - Sales Staff
  y = y - 30;
  doc.text('Developer', col3X, y);
  y += 20;
  doc.text(`Nama    : ${'_'.repeat(15)}`, col3X, y);
  const salesName = transaksi.created_by?.name || transaksi.created_by?.nama || '';
  if (salesName) {
    doc.text(`Nama    : ${salesName}`, col3X, y);
  }
  y += 5;
  doc.text('Jabatan : Sales Staff', col3X, y);
  y += 5;
  doc.text(`Tanggal : ___ / ___ / 2025`, col3X, y);

  // Lampiran
  y += 15;
  doc.setFontSize(8).setFont('helvetica', 'bold').text('Lampiran:', margin, y);
  y += 8;
  doc.setFontSize(7).setFont('helvetica', 'normal');
  doc.text('• Fotokopi KTP Pembeli', margin + 5, y);
  y += 5;
  doc.text('• Bukti Pembayaran Booking Fee', margin + 5, y);

  return doc;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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

    // Create PDF using jsPDF
    const doc = createPDF(transaksi);

    // Generate PDF as buffer
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
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
