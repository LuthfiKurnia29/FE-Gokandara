'use client';

import { memo, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/primitive-select';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/services/auth';
import { useKonsumenList } from '@/services/konsumen';
import { usePenjualanById, useUpdatePenjualan } from '@/services/penjualan';
import { getAllProjek, getTipesByProjek } from '@/services/projek';
import { useAllSkemaPembayaran } from '@/services/skema-pembayaran';
import { useSupervisorList, useUserList } from '@/services/user';
import { useQuery } from '@tanstack/react-query';

import { toast } from 'react-toastify';

interface EditTransaksiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaksiId: number | null;
}

export const EditTransaksiModal = memo(function EditTransaksiModal({
  open,
  onOpenChange,
  transaksiId
}: EditTransaksiModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [dpPercent, setDpPercent] = useState(30);
  const { data: skemaPembayaranOptions = [] } = useAllSkemaPembayaran();
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
    const qty = Number(jumlahKavling || 1);
    const base = Number((selectedTipe as any)?.harga ?? 0) * qty;
    const extra = Number(kelebihanTanah || 0) * Number(hargaPerMeter || 0) * 1000000;
    return base + extra;
  }, [selectedTipe, kelebihanTanah, hargaPerMeter, jumlahKavling]);
  const dpValue = useMemo(() => Math.round((harga * dpPercent) / 100), [harga, dpPercent]);
  const sisaPembayaran = useMemo(() => Math.max(harga - dpValue, 0), [harga, dpValue]);
  const discountAmount = useMemo(() => {
    if (!diskon || diskon.trim() === '') return 0;
    const val = Number(diskon);
    if (Number.isNaN(val) || val <= 0) return 0;
    if (tipeDiskon === 'persen') {
      const pct = Math.max(0, Math.min(val, 100));
      return Math.round(harga * (pct / 100));
    }
    return Math.min(val, harga);
  }, [diskon, tipeDiskon, harga]);
  const hargaSetelahDiskon = useMemo(() => Math.max(harga - discountAmount, 0), [harga, discountAmount]);
  const selectedSkemaNama = useMemo(() => {
    const skema = skemaPembayaranOptions.find((s) => s.id === selectedSkemaId);
    return skema?.nama || '';
  }, [skemaPembayaranOptions, selectedSkemaId]);

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
    // Saat mode edit, jangan batasi berdasarkan created_id agar opsi konsumen
    // yang sudah dipilih tetap muncul walaupun tidak sesuai filter.
    if (!transaksiId && effectiveCreatedId) p.created_id = effectiveCreatedId;
    return p;
  }, [effectiveCreatedId, transaksiId]);

  const { data: konsumenRes, isLoading: isLoadingKonsumen } = useKonsumenList(konsumenParams);

  // Load current transaksi detail
  const { data: detail } = usePenjualanById(transaksiId, [
    'konsumen',
    'properti',
    'blok',
    'tipe',
    'unit',
    // Sesuaikan nama relasi dengan konvensi backend
    'projek',
    'skema_pembayaran',
    'created_by'
  ]);

  // Prefill fields when detail is available
  useEffect(() => {
    if (!detail) return;
    setNoTransaksi(String(detail.no_transaksi ?? ''));
    setSelectedKonsumenId(String(detail.konsumen_id ?? (detail as any)?.konsumen?.id ?? ''));
    setSelectedSkemaId((detail as any)?.skema_pembayaran_id ?? null);
    setTipeDiskon((detail.tipe_diskon === 'fixed' ? 'nominal' : 'persen') as 'persen' | 'nominal');
    setDiskon(String(detail.diskon ?? ''));
    const projekId = (detail as any)?.projek?.id ?? (detail.properti as any)?.project_id ?? null;
    setSelectedProjekId(projekId);
    setSelectedTipeId(detail.tipe_id ?? (detail.tipe as any)?.id ?? null);
    setJumlahKavling(String((detail as any)?.kavling_dipesan ?? '1'));
    setKelebihanTanah(String((detail as any)?.kelebihan_tanah ?? '0'));
    setHargaPerMeter(String((detail as any)?.harga_per_meter ?? '0'));
    // Prefill SPV/Sales berdasarkan pembuat transaksi
    const creator = (detail as any)?.created_by;
    if (creator?.id) {
      const roleId = Number(creator.role_id);
      if (roleId === 3) {
        // Sales
        setSelectedSalesId(String(creator.id));
        if (creator.parent_id) setSelectedSpvId(String(creator.parent_id));
      } else if (roleId === 2) {
        // Supervisor
        setSelectedSpvId(String(creator.id));
        setSelectedSalesId('');
      }
    }
    // Estimate dpPercent from dp and harga if possible
    const dp = Number(detail.dp ?? 0);
    const estHarga = Number((detail as any)?.harga ?? (detail.properti as any)?.harga ?? 0);
    if (dp > 0 && estHarga > 0) {
      const pct = Math.round((dp / estHarga) * 100);
      setDpPercent(Math.max(0, Math.min(pct, 100)));
    }
  }, [detail]);

  const paymentRows = useMemo(() => {
    if (!selectedSkemaNama) return [] as { label: string; amount: number; periode: string }[];

    const rows: { label: string; amount: number; periode: string }[] = [];

    rows.push({ label: 'DP', amount: dpValue, periode: '-' });

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

  const updatePenjualan = useUpdatePenjualan();

  const handleNext = () => setStep(2);

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
    if (!transaksiId) return;
    const tipe_diskon_api = tipeDiskon === 'persen' ? 'percent' : 'fixed';

    const payload: any = {
      no_transaksi: Number(noTransaksi) || undefined,
      konsumen_id: selectedKonsumenId ? parseInt(selectedKonsumenId) : undefined,
      ...(effectiveCreatedId ? { created_id: effectiveCreatedId } : {}),
      ...(selectedProjekId ? { projeks_id: selectedProjekId } : {}),
      ...(selectedTipeId ? { tipe_id: selectedTipeId } : {}),
      kavling_dipesan: Number(jumlahKavling) || undefined,
      ...(kelebihanTanah !== '' ? { kelebihan_tanah: Number(kelebihanTanah) } : {}),
      ...(hargaPerMeter !== '' ? { harga_per_meter: Number(hargaPerMeter) } : {}),
      ...(selectedSkemaId ? { skema_pembayaran_id: selectedSkemaId } : {}),
      ...(diskon !== '' ? { diskon: Number(diskon) } : {}),
      tipe_diskon: tipe_diskon_api,
      dp: dpValue
    };

    try {
      await updatePenjualan.mutateAsync({ id: transaksiId, data: payload });
      toast.success('Data transaksi berhasil diperbarui');
      handleClose(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Terjadi kesalahan saat memperbarui data');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-[900px] border-0 p-0'>
        {step === 1 ? (
          <div className='flex h-full flex-col'>
            <DialogHeader className='px-6 pt-6'>
              <DialogTitle className='text-2xl'>Edit Data Transaksi</DialogTitle>
            </DialogHeader>

            <div className='grid gap-6 px-6 pt-4 pb-10'>
              {isAdmin ? (
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <Label className='mb-2 block'>Nama SPV</Label>
                    <Select
                      value={selectedSpvId}
                      onValueChange={(v) => {
                        setSelectedSpvId(v);
                        setSelectedSalesId('');
                      }}>
                      <SelectTrigger className='h-12 w-full rounded-lg'>
                        <SelectValue placeholder={isLoadingSpv ? 'Loading...' : 'Pilih SPV'} />
                      </SelectTrigger>
                      <SelectContent>
                        {(supervisorData?.data ?? []).map((user: any) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className='mb-2 block'>Nama Sales</Label>
                    <Select value={selectedSalesId} onValueChange={(v) => setSelectedSalesId(v)}>
                      <SelectTrigger className='h-12 w-full rounded-lg' disabled={!selectedSpvId || isLoadingSales}>
                        <SelectValue
                          placeholder={
                            !selectedSpvId ? 'Pilih SPV terlebih dahulu' : isLoadingSales ? 'Loading...' : 'Pilih Sales'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSales.map((user: any) => (
                          <SelectItem key={user.id} value={String(user.id)}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                ''
              )}
              <div>
                <Label className='mb-2 block'>Nama Konsumen</Label>
                <Select value={selectedKonsumenId} onValueChange={(v) => setSelectedKonsumenId(v)}>
                  <SelectTrigger className='h-12 w-full rounded-lg' disabled={isLoadingKonsumen}>
                    <SelectValue placeholder={isLoadingKonsumen ? 'Loading...' : 'Pilih Konsumen'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(konsumenRes?.data ?? []).map((k: any) => (
                      <SelectItem key={k.id} value={String(k.id)}>
                        {k.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='bg-muted/40 px-6 py-8'>
              <div className='flex items-center justify-center'>
                <Button
                  onClick={handleNext}
                  className='h-12 rounded-lg bg-orange-400 px-8 py-2 text-white hover:bg-orange-500'
                  disabled={updatePenjualan.isPending}>
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
                  <Label className='mb-2 block'>Kavling</Label>
                  <Input
                    type='number'
                    placeholder='1'
                    className='h-12 w-full rounded-lg'
                    min={0}
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

              <Separator />

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span>Harga</span>
                  <span className='font-medium'>Rp {harga.toLocaleString('id-ID')}</span>
                </div>
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
                  <span>Sisa Pembayaran</span>
                  <span className='font-medium'>Rp {sisaPembayaran.toLocaleString('id-ID')}</span>
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='flex items-center justify-between gap-4'>
                    <Label className='mb-2 block'>Skema Pembayaran</Label>
                  </div>
                  <div>
                    <Select value={selectedSkemaId?.toString()} onValueChange={(v) => setSelectedSkemaId(Number(v))}>
                      <SelectTrigger className='h-12 w-full rounded-lg'>
                        <SelectValue placeholder='Pilih skema pembayaran' />
                      </SelectTrigger>
                      <SelectContent>
                        {skemaPembayaranOptions.map((s: any) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>Rincian Pembayaran</span>
                  <span className='text-muted-foreground text-sm'>Skema: {selectedSkemaNama || '-'}</span>
                </div>
                <div className='rounded-md border'>
                  {paymentRows.map((row, idx) => (
                    <div key={idx} className='flex items-center justify-between border-b p-3 last:border-b-0'>
                      <div>
                        <div className='text-sm font-medium'>{row.label}</div>
                        <div className='text-muted-foreground text-xs'>Periode: {row.periode}</div>
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
                    disabled={updatePenjualan.isPending}>
                    Simpan
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
