'use client';

import { memo, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/primitive-select';
import { Select as SearchSelect } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/services/auth';
import { useKonsumenList } from '@/services/konsumen';
import { useCreatePenjualan } from '@/services/penjualan';
import { getAllProjek, getPembayaranByProjekTipe, getTipesByProjek } from '@/services/projek';
import { useSupervisorList, useUserList } from '@/services/user';
import { useQuery } from '@tanstack/react-query';

import { toast } from 'react-toastify';

interface AddTransaksiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTransaksiModal = memo(function AddTransaksiModal({ open, onOpenChange }: AddTransaksiModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [dpPercent, setDpPercent] = useState(30);
  const [selectedSkemaId, setSelectedSkemaId] = useState<number | null>(null);
  const [noTransaksi, setNoTransaksi] = useState<string>('');
  const [tipeDiskon, setTipeDiskon] = useState<'persen' | 'nominal'>('persen');
  const [diskon, setDiskon] = useState<string>('');
  const { data: projekList = [] } = useQuery(['/projek'], getAllProjek);
  const [selectedProjekId, setSelectedProjekId] = useState<number | null>(null);
  const [selectedTipeId, setSelectedTipeId] = useState<number | null>(null);
  const [kelebihanTanah, setKelebihanTanah] = useState<string>('0');
  const [hargaPerMeter, setHargaPerMeter] = useState<string>('0');
  const [jumlahKavling, setJumlahKavling] = useState<string>('1');
  const { data: tipeList = [] } = useQuery(
    ['/projek', selectedProjekId, 'tipes'],
    () => getTipesByProjek(selectedProjekId as number),
    { enabled: !!selectedProjekId }
  );

  // Skema pembayaran bergantung pada projek dan tipe yang dipilih
  const { data: skemaPembayaranOptions = [] } = useQuery(
    ['/projek', selectedProjekId, 'tipe', selectedTipeId, 'pembayaran'],
    () => getPembayaranByProjekTipe(selectedProjekId as number, selectedTipeId as number),
    { enabled: !!selectedProjekId && !!selectedTipeId }
  );

  // Reset skema pembayaran ketika tipe berubah
  useEffect(() => {
    setSelectedSkemaId(null);
  }, [selectedTipeId]);
  const { data: supervisorData, isLoading: isLoadingSpv } = useSupervisorList();
  const { data: salesData, isLoading: isLoadingSales } = useUserList({ perPage: 1000, role_id: 3 });
  const [selectedSpvId, setSelectedSpvId] = useState<string>('');
  const [selectedSalesId, setSelectedSalesId] = useState<string>('');
  const [selectedKonsumenId, setSelectedKonsumenId] = useState<string>('');
  const selectedProjek = useMemo(() => {
    if (!selectedProjekId) return null;
    return (projekList as any[]).find((p: any) => p.id === selectedProjekId) ?? null;
  }, [projekList, selectedProjekId]);

  const selectedTipe = useMemo(() => {
    if (!selectedTipeId) return null;
    return (tipeList as any[]).find((t: any) => t.id === selectedTipeId) ?? null;
  }, [tipeList, selectedTipeId]);

  const harga = useMemo(() => {
    const skema = skemaPembayaranOptions.find((s) => s.id === selectedSkemaId);
    const skemaHarga = Number(skema?.harga);
    const base = Number.isFinite(skemaHarga) ? skemaHarga : Number((selectedTipe as any)?.harga ?? 0);
    // Do not include kelebihan tanah into base harga; show it separately in UI
    return base;
  }, [selectedSkemaId, skemaPembayaranOptions, selectedTipe, kelebihanTanah, hargaPerMeter]);
  const kelebihanTanahAmount = useMemo(() => {
    return Number(kelebihanTanah || 0) * Number(hargaPerMeter || 0);
  }, [kelebihanTanah, hargaPerMeter]);
  const dpValue = useMemo(() => Math.round((harga * dpPercent) / 100), [harga, dpPercent]);
  const discountAmount = useMemo(() => {
    if (!diskon || diskon.trim() === '') return 0;
    const val = Number(diskon);
    if (Number.isNaN(val) || val <= 0) return 0;
    const totalBeforeDiscount = harga + kelebihanTanahAmount;
    if (tipeDiskon === 'persen') {
      const pct = Math.max(0, Math.min(val, 100));
      return Math.round(totalBeforeDiscount * (pct / 100));
    }
    return Math.min(val, totalBeforeDiscount);
  }, [diskon, tipeDiskon, harga, kelebihanTanahAmount]);
  const hargaSetelahDiskon = useMemo(
    () => Math.max(harga + kelebihanTanahAmount - discountAmount, 0),
    [harga, kelebihanTanahAmount, discountAmount]
  );
  const sisaPembayaran = useMemo(() => Math.max(hargaSetelahDiskon - dpValue, 0), [hargaSetelahDiskon, dpValue]);
  const selectedSkemaNama = useMemo(() => {
    const skema = skemaPembayaranOptions.find((s) => s.id === selectedSkemaId);
    return skema?.nama || '';
  }, [skemaPembayaranOptions, selectedSkemaId]);
  const sisaLabel = useMemo(() => {
    const nama = selectedSkemaNama.toLowerCase();
    if (nama.includes('kpr')) return 'Sisa Plafon';
    return 'Sisa Pembayaran';
  }, [selectedSkemaNama]);

  const isProgressSkema = useMemo(() => {
    return (
      selectedSkemaNama.includes('Cash By progress 3 lantai') || selectedSkemaNama.includes('Cash By progress 2 lantai')
    );
  }, [selectedSkemaNama]);

  const isInhouseSkema = useMemo(() => {
    return (
      selectedSkemaNama.includes('Inhouse 3x') ||
      selectedSkemaNama.includes('Inhouse 6x') ||
      selectedSkemaNama.includes('Inhouse 12x')
    );
  }, [selectedSkemaNama]);

  useEffect(() => {
    if (isProgressSkema && (dpPercent < 40 || dpPercent > 50)) {
      setDpPercent(40);
    }
  }, [isProgressSkema, dpPercent]);

  useEffect(() => {
    if (isInhouseSkema && (dpPercent < 30 || dpPercent > 50)) {
      setDpPercent(30);
    }
  }, [isInhouseSkema, dpPercent]);

  useEffect(() => {
    if (diskon === '') return;
    const val = Number(diskon);
    if (Number.isNaN(val)) return;
    if (tipeDiskon === 'persen') {
      if (val < 0) setDiskon('0');
      else if (val > 100) setDiskon('100');
    } else if (tipeDiskon === 'nominal') {
      if (val < 0) setDiskon('0');
      else if (val > harga) setDiskon(harga.toString());
    }
  }, [diskon, tipeDiskon, harga]);

  const filteredSales = useMemo(() => {
    if (!selectedSpvId) return [] as any[];
    return (salesData?.data ?? []).filter((u: any) => String(u.parent_id) === String(selectedSpvId));
  }, [salesData, selectedSpvId]);

  const safeSpvOptions = useMemo(() => {
    return (supervisorData?.data ?? [])
      .filter((u: any) => u && u.id && (u.name || u.nama))
      .map((u: any) => ({ value: String(u.id), label: u.name || u.nama }));
  }, [supervisorData]);

  const safeSalesOptions = useMemo(() => {
    return (filteredSales ?? [])
      .filter((u: any) => u && u.id && (u.name || u.nama))
      .map((u: any) => ({ value: String(u.id), label: u.name || u.nama }));
  }, [filteredSales]);

  const { getUserData } = usePermissions();
  const userData = getUserData();
  const userRole = userData?.roles?.[0]?.role?.name || '';
  const userRoleId = userData?.roles?.[0]?.role_id || 0;
  const isAdmin = userRole === 'Administrator' || userRole === 'Admin' || userRoleId === 1;
  const currentUserId = userData?.user?.id;

  const effectiveCreatedId = useMemo(() => {
    if (selectedSalesId) return parseInt(selectedSalesId);
    if (selectedSpvId) return parseInt(selectedSpvId);
    if (!selectedSpvId && !selectedSalesId) return currentUserId;
    return undefined;
  }, [selectedSalesId, selectedSpvId, currentUserId]);

  const konsumenParams = useMemo(() => {
    const p: any = { per_page: 1000 };
    if (effectiveCreatedId) p.created_id = effectiveCreatedId;
    return p;
  }, [effectiveCreatedId]);

  const { data: konsumenRes, isLoading: isLoadingKonsumen } = useKonsumenList(konsumenParams);
  const paymentRows = useMemo(() => {
    if (!selectedSkemaNama) return [] as { label: string; amount: number; periode: string }[];

    const rows: { label: string; amount: number; periode: string }[] = [];

    rows.push({ label: 'DP', amount: dpValue, periode: '-' });
    const skemaLower = selectedSkemaNama.toLowerCase();
    if (skemaLower.includes('kpr')) {
      rows.push({ label: 'Sisa Plafon', amount: sisaPembayaran, periode: '-' });
      return rows;
    } else if (skemaLower.includes('cash keras')) {
      rows.push({ label: 'Sisa Pembayaran', amount: sisaPembayaran, periode: '-' });
      return rows;
    }

    if (selectedSkemaNama.includes('Cash By progress 3 lantai')) {
      const lantaiPct = dpPercent >= 50 ? 15 : 20;
      const parts = [
        { label: 'Pengecoran Plat lantai 2', pct: lantaiPct },
        { label: 'Pengecoran Plat lantai 3', pct: lantaiPct },
        { label: 'Bangunan Hitam (Sudah Mau Masuk Acian)', pct: 10 },
        { label: 'Pengecatan Terakhir sebelum PDAM/PLN ter instal', pct: 10 }
      ];
      let assigned = dpValue;
      for (let i = 0; i < parts.length; i++) {
        if (i < parts.length - 1) {
          const amt = Math.round((harga * parts[i].pct) / 100);
          rows.push({ label: parts[i].label, amount: amt, periode: '-' });
          assigned += amt;
        } else {
          const amt = Math.max(harga - assigned, 0);
          rows.push({ label: parts[i].label, amount: amt, periode: '-' });
        }
      }
    } else if (selectedSkemaNama.includes('Cash By progress 2 lantai')) {
      const platPct = dpPercent >= 50 ? 30 : 40;
      const parts = [
        { label: 'Pengecoran Plat lantai 2', pct: platPct },
        { label: 'Bata terpasang 100%', pct: 10 },
        { label: 'Pengecatan Terakhir sebelum PDAM/PLN ter instal', pct: 10 }
      ];
      let assigned = dpValue;
      for (let i = 0; i < parts.length; i++) {
        if (i < parts.length - 1) {
          const amt = Math.round((harga * parts[i].pct) / 100);
          rows.push({ label: parts[i].label, amount: amt, periode: '-' });
          assigned += amt;
        } else {
          const amt = Math.max(harga - assigned, 0);
          rows.push({ label: parts[i].label, amount: amt, periode: '-' });
        }
      }
    } else if (selectedSkemaNama.includes('Inhouse 3x')) {
      const n = 3;
      const total = sisaPembayaran;
      let assigned = 0;
      for (let i = 1; i <= n; i++) {
        const amt = i < n ? Math.round(total / n) : Math.max(total - assigned, 0);
        rows.push({ label: 'Cicilan ' + i, amount: amt, periode: i + ' bulan' });
        assigned += amt;
      }
    } else if (selectedSkemaNama.includes('Inhouse 6x')) {
      const n = 6;
      const total = sisaPembayaran;
      let assigned = 0;
      for (let i = 1; i <= n; i++) {
        const amt = i < n ? Math.round(total / n) : Math.max(total - assigned, 0);
        rows.push({ label: 'Cicilan ' + i, amount: amt, periode: i + ' bulan' });
        assigned += amt;
      }
    } else if (selectedSkemaNama.includes('Inhouse 12x')) {
      const n = 12;
      const total = sisaPembayaran;
      let assigned = 0;
      for (let i = 1; i <= n; i++) {
        const amt = i < n ? Math.round(total / n) : Math.max(total - assigned, 0);
        rows.push({ label: 'Cicilan ' + i, amount: amt, periode: i + ' bulan' });
        assigned += amt;
      }
    }

    return rows;
  }, [selectedSkemaNama, dpValue, sisaPembayaran, dpPercent, harga]);

  const createPenjualan = useCreatePenjualan();

  const safeKonsumenOptions = useMemo(() => {
    return (konsumenRes?.data ?? [])
      .filter((k: any) => k && k.id && (k.name || k.nama))
      .map((k: any) => ({ value: String(k.id), label: k.name || k.nama }));
  }, [konsumenRes]);

  const handleNext = () => {
    if (!selectedKonsumenId) {
      toast.error('Silakan pilih konsumen');
      return;
    }
    setStep(2);
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setStep(1);
      setDpPercent(30);
      setSelectedSpvId('');
      setSelectedSalesId('');
      setSelectedKonsumenId('');
      setSelectedProjekId(null);
      setSelectedTipeId(null);
      setSelectedSkemaId(null);
    }
    onOpenChange(val);
  };

  const handleSubmit = async () => {
    if (!jumlahKavling || jumlahKavling.trim() === '') {
      toast.error('No. Kavling wajib diisi');
      return;
    }
    const tipe_diskon_api = tipeDiskon === 'persen' ? 'percent' : 'fixed';

    const payload: any = {
      no_transaksi: Number(noTransaksi) || 0,
      konsumen_id: selectedKonsumenId ? parseInt(selectedKonsumenId) : undefined,
      ...(effectiveCreatedId ? { created_id: effectiveCreatedId } : {}),
      ...(selectedProjekId ? { projeks_id: selectedProjekId } : {}),
      ...(selectedTipeId ? { tipe_id: selectedTipeId } : {}),
      kavling_dipesan: jumlahKavling,
      ...(kelebihanTanah !== '' ? { kelebihan_tanah: Number(kelebihanTanah) } : {}),
      ...(hargaPerMeter !== '' ? { harga_per_meter: Number(hargaPerMeter) } : {}),
      ...(selectedSkemaId ? { skema_pembayaran_id: selectedSkemaId } : {}),
      ...(diskon !== '' ? { diskon: Number(diskon) } : {}),
      tipe_diskon: tipe_diskon_api,
      dp: dpValue
    };

    try {
      await createPenjualan.mutateAsync(payload as any);
      toast.success('Data transaksi berhasil ditambahkan');
      handleClose(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Terjadi kesalahan saat menambahkan data');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-[900px] border-0 p-0'>
        {step === 1 ? (
          <div className='flex h-full flex-col'>
            <DialogHeader className='px-6 pt-6'>
              <DialogTitle className='text-2xl'>Tambah Data Transaksi</DialogTitle>
            </DialogHeader>

            <div className='grid gap-6 px-6 pt-4 pb-10'>
              {isAdmin ? (
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <Label className='mb-2 block'>Nama SPV</Label>
                    <SearchSelect
                      className='h-12 w-full rounded-lg'
                      options={safeSpvOptions}
                      value={selectedSpvId}
                      onChange={(v) => {
                        setSelectedSpvId(v as string);
                        setSelectedSalesId('');
                      }}
                      placeholder={isLoadingSpv ? 'Loading...' : 'Pilih SPV'}
                      inputPlaceholder={'Cari SPV...'}
                      disabled={isLoadingSpv}
                    />
                  </div>
                  <div>
                    <Label className='mb-2 block'>Nama Sales</Label>
                    <SearchSelect
                      className='h-12 w-full rounded-lg'
                      options={safeSalesOptions}
                      value={selectedSalesId}
                      onChange={(v) => setSelectedSalesId(v as string)}
                      placeholder={
                        !selectedSpvId ? 'Pilih SPV terlebih dahulu' : isLoadingSales ? 'Loading...' : 'Pilih Sales'
                      }
                      inputPlaceholder={'Cari Sales...'}
                      disabled={!selectedSpvId || isLoadingSales}
                    />
                  </div>
                </div>
              ) : (
                ''
              )}
              <div>
                <Label className='mb-2 block'>Nama Konsumen</Label>
                <SearchSelect
                  className='h-12 w-full rounded-lg'
                  options={safeKonsumenOptions}
                  value={selectedKonsumenId}
                  onChange={(val) => setSelectedKonsumenId(val as string)}
                  placeholder={isLoadingKonsumen ? 'Loading...' : 'Pilih Konsumen'}
                  inputPlaceholder={'Cari konsumen...'}
                  disabled={isLoadingKonsumen}
                />
              </div>
            </div>

            <div className='bg-muted/40 px-6 py-8'>
              <div className='flex items-center justify-center'>
                <Button
                  onClick={handleNext}
                  className='h-12 rounded-lg bg-orange-400 px-8 py-2 text-white hover:bg-orange-500'
                  disabled={createPenjualan.isPending || !selectedKonsumenId}>
                  Selanjutnya
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className='flex h-full flex-col'>
            <DialogHeader className='px-6 pt-6'>
              <DialogTitle className='text-2xl'>Pemesanan</DialogTitle>
              <DialogDescription />
            </DialogHeader>

            <div className='max-h-[70vh] space-y-4 overflow-y-auto px-6 pt-2 pb-6'>
              <div>
                <Label className='mb-2 block'>No. Transaksi</Label>
                <Input
                  type='text'
                  placeholder='Masukkan no transaksi'
                  className='h-12 w-full rounded-lg'
                  value={noTransaksi}
                  onChange={(e) => setNoTransaksi(e.target.value)}
                />
              </div>

              <div>
                <Label className='mb-2 block'>Nama Projek</Label>
                <Select
                  value={selectedProjekId?.toString()}
                  onValueChange={(v) => {
                    setSelectedProjekId(Number(v));
                    setSelectedTipeId(null);
                  }}>
                  <SelectTrigger className='h-12 w-full rounded-lg'>
                    <SelectValue placeholder='Pilih projek' />
                  </SelectTrigger>
                  <SelectContent>
                    {projekList.map((p: any) => (
                      <SelectItem key={p.id} value={p.id?.toString?.() ?? String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label className='mb-2 block'>Tipe</Label>
                  <Select value={selectedTipeId?.toString()} onValueChange={(v) => setSelectedTipeId(Number(v))}>
                    <SelectTrigger className='h-12 w-full rounded-lg'>
                      <SelectValue placeholder='Pilih tipe' />
                    </SelectTrigger>
                    <SelectContent>
                      {tipeList.map((t: any) => (
                        <SelectItem key={t.id} value={t.id?.toString?.() ?? String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className='mb-2 block'>No. Kavling</Label>
                  <Input
                    type='text'
                    placeholder='Masukkan no kavling'
                    className='h-12 w-full rounded-lg'
                    value={jumlahKavling}
                    onChange={(e) => setJumlahKavling(e.target.value)}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label className='mb-2 block'>Kelebihan Tanah</Label>
                  <Input
                    type='number'
                    placeholder='0'
                    className='h-12 w-full rounded-lg'
                    min={0}
                    value={kelebihanTanah}
                    onChange={(e) => setKelebihanTanah(e.target.value)}
                  />
                </div>
                <div>
                  <Label className='mb-2 block'>Harga per meter</Label>
                  <Input
                    type='number'
                    placeholder='0'
                    className='h-12 w-full rounded-lg'
                    min={0}
                    value={hargaPerMeter}
                    onChange={(e) => setHargaPerMeter(e.target.value)}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label className='mb-2 block'>Tipe Diskon</Label>
                  <Select value={tipeDiskon} onValueChange={(v) => setTipeDiskon(v as 'persen' | 'nominal')}>
                    <SelectTrigger className='h-12 w-full rounded-lg'>
                      <SelectValue placeholder='Pilih tipe diskon' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='persen'>Persen</SelectItem>
                      <SelectItem value='nominal'>Nominal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className='mb-2 block'>Diskon</Label>
                  <Input
                    type='number'
                    placeholder={tipeDiskon === 'persen' ? '0-100' : '0'}
                    className='h-12 w-full rounded-lg'
                    min={0}
                    max={tipeDiskon === 'persen' ? 100 : undefined}
                    value={diskon}
                    onChange={(e) => setDiskon(e.target.value)}
                  />
                </div>
              </div>

              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>LB/LT</span>
                  <span className='text-sm'>
                    {selectedTipe?.luas_bangunan ?? 0}m²/{selectedTipe?.luas_tanah ?? 0}m²
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground text-sm'>Lokasi</span>
                  <span className='text-sm'>{(selectedProjek as any)?.address ?? '-'}</span>
                </div>
              </div>

              {selectedSkemaId ? (
                <>
                  <Separator />

                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span>Harga</span>
                      <span className='font-medium'>Rp {harga.toLocaleString('id-ID')}</span>
                    </div>
                    {kelebihanTanahAmount > 0 && (
                      <div className='flex items-center justify-between'>
                        <span>Kelebihan Tanah</span>
                        <span className='font-medium'>Rp {kelebihanTanahAmount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {discountAmount > 0 && (
                      <div className='flex items-center justify-between'>
                        <span>Diskon</span>
                        <span className='font-medium'>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className='flex items-center justify-between'>
                      <span>Harga Setelah Diskon</span>
                      <span className='font-medium'>Rp {hargaSetelahDiskon.toLocaleString('id-ID')}</span>
                    </div>
                    <div>
                      <div className='flex items-center justify-between'>
                        <span>Down Payment ({dpPercent}%)</span>
                        <span className='font-medium'>Rp {dpValue.toLocaleString('id-ID')}</span>
                      </div>
                      <div className='mt-3 flex items-center gap-3'>
                        <input
                          type='range'
                          min={isProgressSkema ? 40 : isInhouseSkema ? 30 : 0}
                          max={isProgressSkema ? 50 : isInhouseSkema ? 50 : 100}
                          step={1}
                          value={dpPercent}
                          onChange={(e) => setDpPercent(Number(e.target.value))}
                          className='h-1 w-full appearance-none rounded-full bg-gray-200 accent-orange-500'
                        />
                        <span className='text-muted-foreground w-10 text-right text-sm'>{dpPercent}%</span>
                      </div>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>{sisaLabel}</span>
                      <span className='font-medium'>Rp {sisaPembayaran.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <Separator />
                </>
              ) : null}

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='flex items-center justify-between gap-4'>
                  <Label className='whitespace-nowrap'>Skema Pembayaran</Label>
                </div>
                <div>
                  <Select value={selectedSkemaId?.toString()} onValueChange={(v) => setSelectedSkemaId(Number(v))}>
                    <SelectTrigger className='h-12 w-full rounded-lg'>
                      <SelectValue placeholder='Pilih skema pembayaran' />
                    </SelectTrigger>
                    <SelectContent>
                      {skemaPembayaranOptions.map((skema) => (
                        <SelectItem key={skema.id} value={skema.id.toString()}>
                          {skema.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='rounded-lg border md:col-span-2'>
                  <div className='text-muted-foreground grid grid-cols-3 gap-2 border-b px-4 py-3 text-sm'>
                    <div>Pembayaran</div>
                    <div>Periode</div>
                    <div className='text-right'>Angsuran</div>
                  </div>
                  {paymentRows.map((row, idx) => (
                    <div key={idx} className='grid grid-cols-3 items-center gap-2 px-4 py-3'>
                      <div>{row.label}</div>
                      <div>
                        {row.periode && row.periode !== '-' ? (
                          <Input value={row.periode} className='h-9 w-16 rounded-md text-center' readOnly />
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                      <div className='text-right font-medium'>Rp {row.amount.toLocaleString('id-ID')}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='bg-muted/40 flex items-center justify-center border-t px-6 py-6'>
                <div className='flex w-full max-w-sm items-center justify-center'>
                  <Button
                    className='h-11 rounded-lg bg-emerald-500 px-8 text-white hover:bg-emerald-600'
                    onClick={handleSubmit}
                    disabled={createPenjualan.isPending}>
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
});
