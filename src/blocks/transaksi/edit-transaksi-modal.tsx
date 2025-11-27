'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/primitive-select';
import { Select as SearchSelect } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePermissions } from '@/services/auth';
import { useKonsumenList } from '@/services/konsumen';
import { usePenjualanById, useUpdatePenjualan } from '@/services/penjualan';
import { getAllProjek, getPembayaranByProjekTipe, getTipesByProjek } from '@/services/projek';
import { useSupervisorMitraList, useUsersByParent } from '@/services/user';
import { useQuery } from '@tanstack/react-query';

import { toast } from 'react-toastify';

interface EditTransaksiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaksiId: number | null;
}

// Konsistensi ukuran field – pakai modifier `!` agar override semua style bawaan komponen
const FIELD_CLS =
  '!h-12 !min-h-12 !w-full !rounded-lg !border !px-3 !py-0 !text-sm focus-visible:!ring-2 focus-visible:!ring-offset-2';
const FIELD_SMALL_CLS = '!h-9 !min-h-9 !w-16 !rounded-md !px-2 !py-0 !text-center !text-sm';

// Formatter sederhana untuk tampilan angka lokal tanpa desimal
const formatRupiahPlain = (amount: number) =>
  new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
    Number.isFinite(amount) ? amount : 0
  );

// Ambil hanya digit dari input pengguna
const parseNumeric = (val: string) => (val || '').replace(/\D/g, '');

export const EditTransaksiModal = memo(function EditTransaksiModal({
  open,
  onOpenChange,
  transaksiId
}: EditTransaksiModalProps) {
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

  const [selectedSpvId, setSelectedSpvId] = useState<string>('');
  const [selectedSalesId, setSelectedSalesId] = useState<string>('');
  const [selectedKonsumenId, setSelectedKonsumenId] = useState<string>('');
  const [paymentDates, setPaymentDates] = useState<Record<number, Date | undefined>>({});

  // Controlled per-detail percents and textbox amounts with debounce
  const [paymentPercents, setPaymentPercents] = useState<Record<number, number>>({});
  const [paymentAmounts, setPaymentAmounts] = useState<Record<number, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSyncedAmountsRef = useRef<Record<number, string> | null>(null);

  const { data: supervisorData, isLoading: isLoadingSpv } = useSupervisorMitraList();
  const { data: salesData, isLoading: isLoadingSales } = useUsersByParent(selectedSpvId ? Number(selectedSpvId) : null);

  // Options for SPV and Sales derived from fetched data
  const safeSpvOptions = useMemo(() => {
    return (supervisorData?.data ?? [])
      .filter((u: any) => u && u.id && (u.name || u.nama))
      .map((u: any) => {
        const displayName = u.name || u.nama;
        const roleLabel = u.role_name || (u.role && (u.role.name || u.role.role_name));
        const label = roleLabel ? `${displayName} (${roleLabel})` : displayName;
        return { value: String(u.id), label };
      });
  }, [supervisorData]);

  const selectedSpvRoleName = useMemo(() => {
    const spv = (supervisorData?.data ?? []).find((u: any) => String(u.id) === String(selectedSpvId));
    const roleLabel = spv?.role_name || (spv?.role && (spv.role.name || spv.role.role_name));
    return roleLabel || '';
  }, [supervisorData, selectedSpvId]);

  const safeSalesOptions = useMemo(() => {
    return (salesData?.data ?? [])
      .filter((u: any) => u && u.id && (u.name || u.nama))
      .map((u: any) => ({ value: String(u.id), label: u.name || u.nama }));
  }, [salesData]);

  // permissions / user context (used to compute effectiveCreatedId)
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

  // Konsumen list (filtered by creator when editing/creating)
  const konsumenParams = useMemo(() => {
    const p: any = { per_page: 1000 };
    if (!transaksiId && effectiveCreatedId) p.created_id = effectiveCreatedId;
    return p;
  }, [effectiveCreatedId, transaksiId]);

  const { data: konsumenRes, isLoading: isLoadingKonsumen } = useKonsumenList(konsumenParams);

  const safeKonsumenOptions = useMemo(() => {
    return (konsumenRes?.data ?? [])
      .filter((k: any) => k && k.id && (k.name || k.nama))
      .map((k: any) => ({ value: String(k.id), label: k.name || k.nama }));
  }, [konsumenRes]);

  // Load current transaksi detail early so effects below can reference it safely
  const { data: detail } = usePenjualanById(transaksiId, [
    'konsumen',
    'properti',
    'blok',
    'tipe',
    'unit',
    'projek',
    'skema_pembayaran',
    'created_by',
    'detail_pembayaran'
  ]);

  const selectedProjek = useMemo(() => {
    if (!selectedProjekId) return null;
    return (projekList as any[]).find((p: any) => p.id === selectedProjekId) ?? null;
  }, [projekList, selectedProjekId]);

  const selectedTipe = useMemo(() => {
    if (!selectedTipeId) return null;
    return (tipeList as any[]).find((t: any) => t.id === selectedTipeId) ?? null;
  }, [tipeList, selectedTipeId]);

  const harga = useMemo(() => {
    const skema = skemaPembayaranOptions.find((s) => s.skema_pembayaran_id === selectedSkemaId);
    const skemaHarga = Number(skema?.harga);
    const base = Number.isFinite(skemaHarga) ? skemaHarga : Number((selectedTipe as any)?.harga ?? 0);
    return base;
  }, [selectedSkemaId, skemaPembayaranOptions, selectedTipe]);

  const kelebihanTanahAmount = useMemo(() => {
    return Number(kelebihanTanah || 0) * Number(hargaPerMeter || 0);
  }, [kelebihanTanah, hargaPerMeter]);
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
  const dpValue = useMemo(() => Math.round((hargaSetelahDiskon * dpPercent) / 100), [hargaSetelahDiskon, dpPercent]);
  const sisaPembayaran = useMemo(() => Math.max(hargaSetelahDiskon - dpValue, 0), [hargaSetelahDiskon, dpValue]);
  const selectedSkemaNama = useMemo(() => {
    const skema = skemaPembayaranOptions.find((s) => s.skema_pembayaran_id === selectedSkemaId);
    return skema?.skema_pembayaran?.nama || '';
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

  const isCashKeras = useMemo(() => {
    return selectedSkemaNama.toLowerCase().includes('cash keras');
  }, [selectedSkemaNama]);

  // Use functional updates and only react to skema flag changes to avoid render loops
  useEffect(() => {
    if (!isProgressSkema) return;
    setDpPercent((prev) => {
      if (prev < 40 || prev > 50) return 40;
      return prev;
    });
  }, [isProgressSkema]);

  useEffect(() => {
    if (!isInhouseSkema) return;
    setDpPercent((prev) => {
      if (prev < 30 || prev > 50) return 30;
      return prev;
    });
  }, [isInhouseSkema]);

  useEffect(() => {
    if (!isCashKeras) return;
    setDpPercent((prev) => {
      if (prev !== 100) return 100;
      return prev;
    });
  }, [isCashKeras]);

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

  // Initialize paymentPercents from existing detail.detail_pembayaran if present or from skema defaults
  useEffect(() => {
    if (!selectedSkemaId) {
      setPaymentPercents((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      setPaymentAmounts((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      lastSyncedAmountsRef.current = null;
      return;
    }

    const selectedSkema = skemaPembayaranOptions.find((s) => s.skema_pembayaran_id === selectedSkemaId);
    if (!selectedSkema?.skema_pembayaran?.details) return;

    const mapPct: Record<number, number> = {};
    // Prefer existing saved percents from detail.detail_pembayaran
    const existingDetails = (detail as any)?.detail_pembayaran ?? [];
    const existingMap = new Map<number, number>();
    existingDetails.forEach((d: any) => {
      existingMap.set(d.detail_skema_pembayaran_id, Number(d.persentase) || 0);
    });

    selectedSkema.skema_pembayaran.details.forEach((d: any) => {
      const pct = existingMap.has(d.id) ? existingMap.get(d.id) as number : (Number(d.persentase) || 0);
      mapPct[d.id] = pct;
    });

    setPaymentPercents((prev) => {
      const keysA = Object.keys(mapPct);
      const keysB = Object.keys(prev);
      if (keysA.length !== keysB.length) return mapPct;
      for (const k of keysA) {
        if (prev[Number(k)] !== mapPct[Number(k)]) return mapPct;
      }
      return prev;
    });

    // Initialize amounts map accordingly
    const amtMap: Record<number, string> = {};
    selectedSkema.skema_pembayaran.details.forEach((d: any) => {
      const pct = mapPct[d.id] ?? 0;
      const amt = Math.round((hargaSetelahDiskon * pct) / 100) || 0;
      amtMap[d.id] = String(amt);
    });
    setPaymentAmounts((prev) => {
      const prevKeys = Object.keys(prev);
      const newKeys = Object.keys(amtMap);
      if (prevKeys.length !== newKeys.length) return amtMap;
      for (const k of newKeys) if ((prev[Number(k)] ?? '') !== (amtMap[Number(k)] ?? '')) return amtMap;
      return prev;
    });
    lastSyncedAmountsRef.current = amtMap;
  }, [selectedSkemaId, skemaPembayaranOptions, detail, hargaSetelahDiskon]);

  // Compute total percent
  const totalPercent = useMemo(() => {
    if (!selectedSkemaId) return 0;
    const selectedSkema = skemaPembayaranOptions.find((s) => s.skema_pembayaran_id === selectedSkemaId);
    if (!selectedSkema?.skema_pembayaran?.details) return 0;
    return selectedSkema.skema_pembayaran.details.reduce((acc: number, d: any) => {
      const pct = paymentPercents[d.id] ?? Number(d.persentase) ?? 0;
      return acc + pct;
    }, 0);
  }, [selectedSkemaId, skemaPembayaranOptions, paymentPercents]);

  // Debounce applying amounts -> percents
  useEffect(() => {
    const last = lastSyncedAmountsRef.current;
    if (last) {
      const aKeys = Object.keys(last);
      const bKeys = Object.keys(paymentAmounts);
      if (aKeys.length === bKeys.length) {
        let equal = true;
        for (const k of aKeys) {
          if ((last[Number(k)] ?? '') !== (paymentAmounts[Number(k)] ?? '')) {
            equal = false;
            break;
          }
        }
        if (equal) return;
      }
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPaymentPercents((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(paymentAmounts).forEach((k) => {
          const id = Number(k);
          const num = Number(paymentAmounts[id] || '0') || 0;
          let newPct = 0;
          if (hargaSetelahDiskon > 0) newPct = Math.round((num / hargaSetelahDiskon) * 100);
          newPct = Math.max(0, Math.min(100, newPct));
          if (next[id] !== newPct) {
            next[id] = newPct;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [paymentAmounts, hargaSetelahDiskon]);

  // Redistribute function (auto-normalize)
  const redistributePercents = () => {
    const selectedSkema = skemaPembayaranOptions.find((s) => s.skema_pembayaran_id === selectedSkemaId);
    if (!selectedSkema?.skema_pembayaran?.details) return;
    const ids = selectedSkema.skema_pembayaran.details.map((d: any) => d.id);
    const current = ids.map((id) => paymentPercents[id] ?? 0);
    const sum = current.reduce((a, b) => a + b, 0);
    let newPercentsArr: number[] = [];
    if (sum === 0) {
      const n = ids.length;
      const base = Math.floor(100 / n);
      newPercentsArr = Array(n).fill(base);
      let rem = 100 - base * n;
      for (let i = 0; i < rem; i++) newPercentsArr[i]++;
    } else {
      const floats = current.map((v) => (v / sum) * 100);
      const floored = floats.map((f) => Math.floor(f));
      const fracs = floats.map((f, idx) => ({ idx, frac: f - Math.floor(f) }));
      fracs.sort((a, b) => b.frac - a.frac);
      let rem = 100 - floored.reduce((a, b) => a + b, 0);
      for (let i = 0; i < rem; i++) floored[fracs[i].idx]++;
      newPercentsArr = floored;
    }
    const next: Record<number, number> = {};
    ids.forEach((id, i) => (next[id] = newPercentsArr[i]));
    setPaymentPercents((prev) => {
      const keys = Object.keys(next);
      let changed = false;
      for (const k of keys) if ((prev[Number(k)] ?? -1) !== next[Number(k)]) { changed = true; break; }
      if (!changed) return prev;
      return next;
    });
    const amtMap: Record<number, string> = {};
    ids.forEach((id, i) => {
      const pct = newPercentsArr[i];
      amtMap[id] = String(Math.round((hargaSetelahDiskon * pct) / 100) || 0);
    });
    setPaymentAmounts(amtMap);
    lastSyncedAmountsRef.current = amtMap;
  };

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
    const creator = (detail as any)?.created_by;
    // if (creator?.id) {
    //   const roleId = Number(creator.roles[0].role_id);
    //   if (roleId === 3) {
    //     setSelectedSalesId(String(creator.id));
    //     if (creator.parent_id) setSelectedSpvId(String(creator.parent_id));
    //   } else if (roleId === 2) {
    //     setSelectedSpvId(String(creator.id));
    //     setSelectedSalesId('');
    //   }
    // }
    const dp = Number(detail.dp ?? 0);
    const estHarga = Number((detail as any)?.harga ?? (detail.properti as any)?.harga ?? 0);
    if (dp > 0 && estHarga > 0) {
      const pct = Math.round((dp / estHarga) * 100);
      setDpPercent(Math.max(0, Math.min(pct, 100)));
    }

    // Load existing payment dates if available
    const detailPembayaran = (detail as any)?.detail_pembayaran;
    if (detailPembayaran && Array.isArray(detailPembayaran)) {
      const dates: Record<number, Date | undefined> = {};
      detailPembayaran.forEach((item: any) => {
        if (item.detail_skema_pembayaran_id && item.tanggal) {
          dates[item.detail_skema_pembayaran_id] = new Date(item.tanggal);
        }
      });
      setPaymentDates(dates);
    }
  }, [detail]);

  // Map existing detail_pembayaran by detail_skema_pembayaran_id for quick lookup
  const existingDetailPembayaranMap = useMemo(() => {
    const map: Record<number, any> = {};
    const items = (detail as any)?.detail_pembayaran ?? [];
    if (Array.isArray(items)) {
      items.forEach((it: any) => {
        if (it && it.detail_skema_pembayaran_id) {
          map[it.detail_skema_pembayaran_id] = it;
        }
      });
    }
    return map;
  }, [detail]);

  const paymentRows = useMemo(() => {
    if (!selectedSkemaId) return [] as { id: number; label: string; amount: number; periode: string; persentase?: number }[];

    const selectedSkema = skemaPembayaranOptions.find((s) => s.skema_pembayaran_id === selectedSkemaId);
    if (!selectedSkema?.skema_pembayaran?.details) return [];

    return selectedSkema.skema_pembayaran.details.map((detail) => {
      // prefer nama/persentase from existing detail_pembayaran if available
      const existing = existingDetailPembayaranMap[detail.id];
      const pct = paymentPercents[detail.id] ?? (existing && Number(existing.persentase) ? Number(existing.persentase) : (Number(detail.persentase) || 0));
      const label = existing && existing.nama && String(existing.nama).trim() !== '' ? existing.nama : detail.nama;
      return {
        id: detail.id,
        label,
        persentase: pct,
        amount: (hargaSetelahDiskon * pct) / 100,
        periode: ''
      };
    });
  }, [skemaPembayaranOptions, selectedSkemaId, hargaSetelahDiskon, paymentPercents]);

  // Reset payment dates when skema changes
  useEffect(() => {
    setPaymentDates({});
  }, [selectedSkemaId]);

  // Sync paymentAmounts when paymentRows or percents change
  useEffect(() => {
    if (!selectedSkemaId) {
      setPaymentAmounts((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      lastSyncedAmountsRef.current = null;
      return;
    }
    const map: Record<number, string> = {};
    paymentRows.forEach((r) => {
      const amt = Math.round((hargaSetelahDiskon * (r.persentase ?? 0)) / 100);
      map[r.id] = String(amt);
    });
    setPaymentAmounts((prev) => {
      const prevKeys = Object.keys(prev).map((k) => Number(k)).sort((a, b) => a - b);
      const newKeys = Object.keys(map).map((k) => Number(k)).sort((a, b) => a - b);
      if (prevKeys.length !== newKeys.length) return map;
      for (let i = 0; i < newKeys.length; i++) {
        const k = newKeys[i];
        if ((prev[k] ?? '') !== (map[k] ?? '')) return map;
      }
      return prev;
    });
    lastSyncedAmountsRef.current = map;
  }, [paymentRows, hargaSetelahDiskon, selectedSkemaId]);

  const updatePenjualan = useUpdatePenjualan();

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
      setPaymentDates({});
    }
    onOpenChange(val);
  };

  const handleSubmit = async () => {
    if (!transaksiId) return;
    const tipe_diskon_api = tipeDiskon === 'persen' ? 'percent' : 'fixed';

    // Build detail_pembayaran array
    const detail_pembayaran = paymentRows
      .map((row) => ({
        skema_pembayaran_id: selectedSkemaId,
        detail_skema_pembayaran_id: row.id,
        tanggal: paymentDates[row.id] ? paymentDates[row.id]?.toISOString().split('T')[0] : undefined
      }))
      .filter((item) => item.tanggal !== undefined);

    const payload: any = {
      no_transaksi: noTransaksi || undefined,
      konsumen_id: selectedKonsumenId ? parseInt(selectedKonsumenId) : undefined,
      ...(effectiveCreatedId ? { created_id: effectiveCreatedId } : {}),
      ...(selectedProjekId ? { projeks_id: selectedProjekId } : {}),
      ...(selectedTipeId ? { tipe_id: selectedTipeId } : {}),
      ...(jumlahKavling !== '' ? { kavling_dipesan: jumlahKavling } : {}),
      ...(kelebihanTanah !== '' ? { kelebihan_tanah: Number(kelebihanTanah) } : {}),
      ...(hargaPerMeter !== '' ? { harga_per_meter: Number(hargaPerMeter) } : {}),
      ...(selectedSkemaId ? { skema_pembayaran_id: selectedSkemaId } : {}),
      ...(diskon !== '' ? { diskon: Number(diskon) } : {}),
      tipe_diskon: tipe_diskon_api,
      dp: dpValue,
      ...(detail_pembayaran.length > 0 ? { detail_pembayaran } : {})
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
      <DialogContent className='!max-w-[900px] border-0 p-0'>
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
                    <SearchSelect
                      options={safeSpvOptions}
                      value={selectedSpvId}
                      onChange={(v) => {
                        setSelectedSpvId(v as string);
                        setSelectedSalesId('');
                      }}
                      placeholder={isLoadingSpv ? 'Loading...' : 'Pilih SPV'}
                      inputPlaceholder={'Cari SPV...'}
                      disabled={isLoadingSpv}
                      className={FIELD_CLS}
                    />
                  </div>
                  <div>
                    <Label className='mb-2 block'>Nama Sales</Label>
                    <SearchSelect
                      options={safeSalesOptions}
                      value={selectedSalesId}
                      onChange={(v) => setSelectedSalesId(v as string)}
                      placeholder={
                        !selectedSpvId
                          ? 'Pilih SPV terlebih dahulu'
                          : selectedSpvRoleName?.toLowerCase() === 'mitra'
                            ? 'Sales tidak diperlukan untuk Mitra'
                            : isLoadingSales
                              ? 'Loading...'
                              : 'Pilih Sales'
                      }
                      inputPlaceholder={'Cari Sales...'}
                      disabled={!selectedSpvId || isLoadingSales || selectedSpvRoleName?.toLowerCase() === 'mitra'}
                      className={FIELD_CLS}
                    />
                  </div>
                </div>
              ) : (
                ''
              )}
              <div>
                <Label className='mb-2 block'>Nama Konsumen</Label>
                <SearchSelect
                  options={safeKonsumenOptions}
                  value={selectedKonsumenId}
                  onChange={(val) => setSelectedKonsumenId(val as string)}
                  placeholder={isLoadingKonsumen ? 'Loading...' : 'Pilih Konsumen'}
                  inputPlaceholder={'Cari konsumen...'}
                  disabled={isLoadingKonsumen}
                  className={FIELD_CLS}
                />
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
                  className={FIELD_CLS}
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
                  <SelectTrigger className={FIELD_CLS}>
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
                    <SelectTrigger className={FIELD_CLS}>
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
                    className={FIELD_CLS}
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
                    className={FIELD_CLS}
                    min={0}
                    value={kelebihanTanah}
                    onChange={(e) => setKelebihanTanah(e.target.value)}
                  />
                </div>
                <div>
                  <Label className='mb-2 block'>Harga per meter</Label>
                  <Input
                    type='text'
                    placeholder='0'
                    className={FIELD_CLS}
                    value={hargaPerMeter && hargaPerMeter !== '' ? formatRupiahPlain(Number(hargaPerMeter)) : ''}
                    onChange={(e) => {
                      const numeric = parseNumeric(e.target.value);
                      setHargaPerMeter(numeric);
                    }}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label className='mb-2 block'>Tipe Diskon</Label>
                  <Select value={tipeDiskon} onValueChange={(v) => setTipeDiskon(v as 'persen' | 'nominal')}>
                    <SelectTrigger className={FIELD_CLS}>
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
                    className={FIELD_CLS}
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
                {/* <div>
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
                </div> */}
                <div className='flex items-center justify-between'>
                  <span>{sisaLabel}</span>
                  <span className='font-medium'>Rp {sisaPembayaran.toLocaleString('id-ID')}</span>
                </div>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='flex items-center justify-between gap-4'>
                    <Label className='whitespace-nowrap'>Skema Pembayaran</Label>
                  </div>
                  <div>
                    <Select value={`${selectedSkemaId ?? ''}`} onValueChange={(v) => setSelectedSkemaId(Number(v))}>
                      <SelectTrigger className={FIELD_CLS}>
                        <SelectValue placeholder='Pilih skema pembayaran' />
                      </SelectTrigger>
                      <SelectContent>
                        {skemaPembayaranOptions.map((s: any) => (
                          <SelectItem key={s.id} value={String(s.skema_pembayaran_id)}>
                            {s.skema_pembayaran.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div className='rounded-lg border md:col-span-2'>
                <div className='text-muted-foreground grid grid-cols-1 gap-2 border-b px-4 py-3 text-sm md:grid-cols-3'>
                  <div className='font-medium'>Pembayaran</div>
                  <div className='font-medium md:font-normal'>Tanggal</div>
                  <div className='text-right font-medium md:font-normal'>Angsuran</div>
                </div>
                {paymentRows.length === 0 ? (
                  <div className='text-muted-foreground px-4 py-8 text-center text-sm'>
                    Detail untuk Skema Pembayaran ini belum diisi. Silakan isi terlebih dahulu.
                  </div>
                ) : (
                  paymentRows.map((row, idx) => {
                    const pct = (paymentPercents[row.id] ?? (row as any).persentase ?? 0) as number;
                    const displayAmount = Math.round((hargaSetelahDiskon * pct) / 100);
                    return (
                      <div
                        key={idx}
                        className='grid grid-cols-1 gap-2 px-4 py-3 md:grid-cols-3 md:items-center md:gap-2'>
                        <div className='flex justify-between md:block'>
                          <span className='text-muted-foreground text-xs md:hidden'>Pembayaran</span>
                          <span>{row.label}</span>
                        </div>
                        <div>
                          <div className='text-muted-foreground mb-1 text-xs md:hidden'>Tanggal</div>
                          <DatePicker
                            value={paymentDates[row.id]}
                            onChange={(date) =>
                              setPaymentDates((prev) => ({
                                ...prev,
                                [row.id]: date
                              }))
                            }
                            placeholder='Pilih tanggal'
                            className='!h-9 !w-full'
                          />
                        </div>
                        <div className='flex flex-col items-end gap-2 md:text-right'>
                          <div className='flex items-center gap-3 w-full'>
                            <input
                              type='range'
                              min={0}
                              max={100}
                              step={1}
                              value={pct}
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                setPaymentPercents((prev) => ({ ...prev, [row.id]: v }));
                                setPaymentAmounts((prev) => ({ ...prev, [row.id]: String(Math.round((hargaSetelahDiskon * v) / 100)) }));
                              }}
                              className='h-1 flex-1 appearance-none rounded-full bg-gray-200 accent-orange-500'
                            />

                            <span className='whitespace-nowrap pl-3 text-sm text-muted-foreground'>{pct}%</span>
                          </div>
                          <div className='text-muted-foreground text-xs md:hidden'>Angsuran</div>

                          <div className='mt-2 flex items-center gap-3'>
                            <Input
                              type='text'
                              className='!h-9 w-40 text-right'
                              value={paymentAmounts[row.id] ? formatRupiahPlain(Number(paymentAmounts[row.id])) : formatRupiahPlain(displayAmount)}
                              onChange={(e) => {
                                const numeric = parseNumeric(e.target.value);
                                setPaymentAmounts((prev) => ({ ...prev, [row.id]: numeric }));
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Total percent validator and auto-normalize action */}
            <div className='px-6'>
              <div className='flex items-center justify-between gap-4 py-3'>
                <div>
                  <span className={totalPercent !== 100 ? 'font-medium text-rose-600' : 'font-medium text-emerald-600'}>
                    Total: {totalPercent}%
                  </span>
                  {totalPercent !== 100 ? (
                    <div className='text-rose-600 text-sm'>Total persentase harus 100% untuk konsistensi (opsional: normalisasi otomatis).</div>
                  ) : null}
                </div>
                {totalPercent !== 100 ? (
                  <div className='flex items-center gap-2'>
                    <Button className='h-9 rounded-md bg-orange-400 px-3 text-white hover:bg-orange-500' onClick={redistributePercents}>
                      Auto-normalize
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

             <div className='bg-muted/40 flex items-center justify-center border-t px-6 py-6'>
               <div className='flex w-full max-w-sm items-center justify-center'>
                 <Button
                   className='h-11 rounded-lg bg-emerald-500 px-8 text-white hover:bg-emerald-600'
                   onClick={handleSubmit}
                   disabled={updatePenjualan.isPending}>
                   Submit
                 </Button>
               </div>
             </div>
           </div>
       )}
     </DialogContent>
   </Dialog>
 );
});
