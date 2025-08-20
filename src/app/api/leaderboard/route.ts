import { NextRequest, NextResponse } from 'next/server';

type LeaderboardItem = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  leads: number;
  target_percentage: number;
  units_sold: number;
  revenue: number;
};

// Build a deterministic set of dummy data
const buildDummyData = (): LeaderboardItem[] => {
  const names = [
    'Andi Saputra',
    'Budi Santoso',
    'Citra Dewi',
    'Dedi Firmansyah',
    'Eka Lestari',
    'Fajar Pratama',
    'Gita Rahma',
    'Hendra Wijaya',
    'Indah Putri',
    'Joko Susilo',
    'Kurniawan Adi',
    'Laras Sari',
    'Mahendra Putra',
    'Nadia Ayu',
    'Oka Permana',
    'Putri Amelia',
    'Qori Azzahra',
    'Rama Dwi',
    'Sari Puspita',
    'Tegar Maulana',
    'Uli Novita',
    'Vino Bastian',
    'Wulan Safitri',
    'Xaverius Dio',
    'Yuda Prakoso',
    'Zahra Kartika'
  ];

  const items: LeaderboardItem[] = names.map((name, idx) => {
    const base = idx + 1;
    const leads = 10 + ((base * 7) % 30);
    const units = 3 + ((base * 5) % 10);
    const target = 60 + ((base * 9) % 41); // 60..100
    const revenue = (units * 125_000_000 + (leads % 5) * 35_000_000) * 2; // IDR
    return {
      id: base,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: '0812-3456-7890',
      avatar_url: null,
      leads,
      target_percentage: Math.min(100, target),
      units_sold: units,
      revenue
    };
  });

  // Duplicate to have more rows
  const extended: LeaderboardItem[] = [];
  for (let i = 0; i < 4; i++) {
    items.forEach((item) =>
      extended.push({
        ...item,
        id: item.id + i * items.length,
        leads: item.leads + i * 2,
        units_sold: item.units_sold + (i % 3),
        target_percentage: Math.min(100, item.target_percentage + i),
        revenue: item.revenue + i * 50_000_000
      })
    );
  }

  return extended;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = (searchParams.get('search') || '').toLowerCase();
  const page = Number(searchParams.get('page') || '1');
  const per = Number(searchParams.get('per') || '10');
  const memberId = Number(searchParams.get('member_id') || '0');

  let data = buildDummyData();

  if (memberId) {
    data = data.filter((d) => d.id === memberId);
  }

  if (search) {
    data = data.filter((d) => d.name.toLowerCase().includes(search) || d.email.toLowerCase().includes(search));
  }

  const total = data.length;
  const lastPage = Math.max(1, Math.ceil(total / per));
  const currentPage = Math.min(Math.max(1, page), lastPage);
  const start = (currentPage - 1) * per;
  const end = start + per;
  const paged = data.slice(start, end);

  return NextResponse.json({
    data: paged,
    total,
    current_page: currentPage,
    last_page: lastPage,
    from: total === 0 ? 0 : start + 1,
    to: Math.min(end, total)
  });
}
