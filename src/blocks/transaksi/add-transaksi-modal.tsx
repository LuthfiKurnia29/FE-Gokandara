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
import { useKonsumenByCreated } from '@/services/konsumen';
import { useCreatePenjualan } from '@/services/penjualan';
import { getAllProjek, getPembayaranByProjekTipe, getTipesByProjek } from '@/services/projek';
import { useSupervisorMitraList, useUsersByParent } from '@/services/user';
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

  const FIELD_CLS =
    '!h-12 !min-h-12 !w-full !rounded-lg !border !px-3 !py-0 !text-sm focus-visible:!ring-2 focus-visible:!ring-offset-2';

  // Formatter sederhana untuk tampilan Rupiah tanpa desimal
  const formatRupiahPlain = (amount: number) =>
    new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(
      Number.isFinite(amount) ? amount : 0
    );

  // Ambil hanya digit dari input pengguna
  const parseNumeric = (val: string) => (val || '').replace(/\D/g, '');

  // Reset skema pembayaran ketika tipe berubah
  useEffect(() => {
    setSelectedSkemaId(null);
  }, [selectedTipeId]);
  const [selectedSpvId, setSelectedSpvId] = useState<string>('');
  const [selectedSalesId, setSelectedSalesId] = useState<string>('');
  const [selectedKonsumenId, setSelectedKonsumenId] = useState<string>('');
  const [jangkaWaktu, setJangkaWaktu] = useState<string>('');
  const [catatan, setCatatan] = useState<string>('');
  const [paymentDates, setPaymentDates] = useState<Record<number, Date | undefined>>({});
  // Per-detail percentage values controlled by sliders (keyed by detail id)
  const [paymentPercents, setPaymentPercents] = useState<Record<number, number>>({});
  // Hold raw numeric values (as plain digits) for the angsuran textbox per detail id
  const [paymentAmounts, setPaymentAmounts] = useState<Record<number, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the last amounts map that we synced from paymentPercents to avoid re-triggering debounce
  const lastSyncedAmountsRef = useRef<Record<number, string> | null>(null);
  const { data: supervisorData, isLoading: isLoadingSpv } = useSupervisorMitraList();
  const { data: salesData, isLoading: isLoadingSales } = useUsersByParent(selectedSpvId ? Number(selectedSpvId) : null);
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
    // Do not include kelebihan tanah into base harga; show it separately in UI
    return Number.isFinite(skemaHarga) ? skemaHarga : Number((selectedTipe as any)?.harga ?? 0);
  }, [selectedSkemaId, skemaPembayaranOptions, selectedTipe, kelebihanTanah, hargaPerMeter]);
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

  // Update dpPercent only when skema flags change. Use functional updates so we don't need dpPercent
  // in the dependency array which could cause extra renders/loops.
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
    let newVal: string | null = null;
    if (tipeDiskon === 'persen') {
      if (val < 0) newVal = '0';
      else if (val > 100) newVal = '100';
    } else if (tipeDiskon === 'nominal') {
      if (val < 0) newVal = '0';
      else if (val > harga) newVal = harga.toString();
    }
    if (newVal !== null && newVal !== diskon) setDiskon(newVal);
  }, [diskon, tipeDiskon, harga]);

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

  const { data: konsumenRes, isLoading: isLoadingKonsumen } = useKonsumenByCreated(effectiveCreatedId ?? null);
  // const paymentRows = useMemo(() => {
  //   if (!selectedSkemaNama) return [] as { label: string; amount: number; periode: string }[];

  //   const rows: { label: string; amount: number; periode: string }[] = [];

  //   rows.push({ label: 'DP', amount: dpValue, periode: '-' });
  //   const skemaLower = selectedSkemaNama.toLowerCase();
  //   if (skemaLower.includes('kpr')) {
  //     rows.push({ label: 'Sisa Plafon', amount: sisaPembayaran, periode: '-' });
  //     return rows;
  //   } else if (skemaLower.includes('cash keras')) {
  //     rows.push({ label: 'Sisa Pembayaran', amount: sisaPembayaran, periode: '-' });
  //     return rows;
  //   }

  //   if (selectedSkemaNama.includes('Cash By progress 3 lantai')) {
  //     const lantaiPct = dpPercent >= 50 ? 15 : 20;
  //     const parts = [
  //       { label: 'Pengecoran Plat lantai 2', pct: lantaiPct },
  //       { label: 'Pengecoran Plat lantai 3', pct: lantaiPct },
  //       { label: 'Bangunan Hitam (Sudah Mau Masuk Acian)', pct: 10 },
  //       { label: 'Pengecatan Terakhir sebelum PDAM/PLN ter instal', pct: 10 }
  //     ];
  //     let assigned = dpValue;
  //     for (let i = 0; i < parts.length; i++) {
  //       if (i < parts.length - 1) {
  //         const amt = Math.round((harga * parts[i].pct) / 100);
  //         rows.push({ label: parts[i].label, amount: amt, periode: '-' });
  //         assigned += amt;
  //       } else {
  //         const amt = Math.max(harga - assigned, 0);
  //         rows.push({ label: parts[i].label, amount: amt, periode: '-' });
  //       }
  //     }
  //   } else if (selectedSkemaNama.includes('Cash By progress 2 lantai')) {
  //     const platPct = dpPercent >= 50 ? 30 : 40;
  //     const parts = [
  //       { label: 'Pengecoran Plat lantai 2', pct: platPct },
  //       { label: 'Bata terpasang 100%', pct: 10 },
  //       { label: 'Pengecatan Terakhir sebelum PDAM/PLN ter instal', pct: 10 }
  //     ];
  //     let assigned = dpValue;
  //     for (let i = 0; i < parts.length; i++) {
  //       if (i < parts.length - 1) {
  //         const amt = Math.round((harga * parts[i].pct) / 100);
  //         rows.push({ label: parts[i].label, amount: amt, periode: '-' });
  //         assigned += amt;
  //       } else {
  //         const amt = Math.max(harga - assigned, 0);
  //         rows.push({ label: parts[i].label, amount: amt, periode: '-' });
  //       }
  //     }
  //   } else if (selectedSkemaNama.includes('Inhouse 3x')) {
  //     const n = 3;
  //     const total = sisaPembayaran;
  //     let assigned = 0;
  //     for (let i = 1; i <= n; i++) {
  //       const amt = i < n ? Math.round(total / n) : Math.max(total - assigned, 0);
  //       rows.push({ label: 'Cicilan ' + i, amount: amt, periode: i + ' bulan' });
  //       assigned += amt;
  //     }
  //   } else if (selectedSkemaNama.includes('Inhouse 6x')) {
  //     const n = 6;
  //     const total = sisaPembayaran;
  //     let assigned = 0;
  //     for (let i = 1; i <= n; i++) {
  //       const amt = i < n ? Math.round(total / n) : Math.max(total - assigned, 0);
  //       rows.push({ label: 'Cicilan ' + i, amount: amt, periode: i + ' bulan' });
  //       assigned += amt;
  //     }
  //   } else if (selectedSkemaNama.includes('Inhouse 12x')) {
  //     const n = 12;
  //     const total = sisaPembayaran;
  //     let assigned = 0;
  //     for (let i = 1; i <= n; i++) {
  //       const amt = i < n ? Math.round(total / n) : Math.max(total - assigned, 0);
  //       rows.push({ label: 'Cicilan ' + i, amount: amt, periode: i + ' bulan' });
  //       assigned += amt;
  //     }
  //   }

  //   return rows;
  // }, [selectedSkemaNama, dpValue, sisaPembayaran, dpPercent, harga]);

  const paymentRows = useMemo(() => {
    if (!selectedSkemaId) return [] as { id: number; label: string; amount: number; periode: string }[];

    const selectedSkema = skemaPembayaranOptions.find((s) => s.skema_pembayaran_id === selectedSkemaId);

    if (!selectedSkema?.skema_pembayaran?.details) return [];

    return selectedSkema.skema_pembayaran.details.map((detail) => {
      // prefer any user-controlled percent from state, fallback to schema percent
      const pct = paymentPercents[detail.id] ?? (Number(detail.persentase) || 0);
      return {
        id: detail.id,
        label: detail.nama,
        persentase: pct,
        amount: (hargaSetelahDiskon * pct) / 100,
        periode: ''
      };
    });
  }, [skemaPembayaranOptions, selectedSkemaId, hargaSetelahDiskon, paymentPercents]);

  // Total percentage across all payment details (derived: prefer controlled percents)
  const totalPercent = useMemo(() => {
    if (!paymentRows || paymentRows.length === 0) return 0;
    return paymentRows.reduce((acc, r) => {
      const pct = paymentPercents[r.id] ?? (r as any).persentase ?? 0;
      return acc + Number(pct || 0);
    }, 0);
  }, [paymentRows, paymentPercents]);

  // Normalize/redistribute percentages so they sum to 100
  const redistributePercents = () => {
    if (!paymentRows || paymentRows.length === 0) return;

    const ids = paymentRows.map((r) => r.id);
    const current: number[] = ids.map((id) => paymentPercents[id] ?? 0);
    const sum = current.reduce((s, v) => s + v, 0);

    let newPercentsArr: number[] = [];

    if (sum === 0) {
      // distribute equally
      const n = ids.length;
      const base = Math.floor(100 / n);
      newPercentsArr = Array(n).fill(base);
      let rem = 100 - base * n;
      for (let i = 0; i < rem; i++) newPercentsArr[i]++;
    } else {
      // scale proportionally and correct rounding via fractional parts
      const floats = current.map((v) => (v / sum) * 100);
      const floored = floats.map((f) => Math.floor(f));
      let flooredSum = floored.reduce((a, b) => a + b, 0);
      const fracs = floats.map((f, idx) => ({ idx, frac: f - Math.floor(f) }));
      fracs.sort((a, b) => b.frac - a.frac);
      let rem = 100 - flooredSum;
      for (let i = 0; i < rem; i++) {
        floored[fracs[i].idx] = floored[fracs[i].idx] + 1;
      }
      newPercentsArr = floored;
    }

    // Build map and apply
    const next: Record<number, number> = {};
    ids.forEach((id, i) => (next[id] = newPercentsArr[i]));

    setPaymentPercents((prev) => {
      // only set if changed
      const keys = Object.keys(next);
      let changed = false;
      for (const k of keys) {
        if ((prev[Number(k)] ?? -1) !== next[Number(k)]) {
          changed = true;
          break;
        }
      }
      if (!changed) return prev;
      return next;
    });

    // Update amounts to reflect new percents and mark as last synced
    const amountsMap: Record<number, string> = {};
    ids.forEach((id, i) => {
      const pct = newPercentsArr[i];
      const amt = Math.round((hargaSetelahDiskon * pct) / 100) || 0;
      amountsMap[id] = String(amt);
    });
    setPaymentAmounts(amountsMap);
    lastSyncedAmountsRef.current = amountsMap;
  };

  // Initialize paymentPercents when skema changes
  useEffect(() => {
    // We'll use functional updater so this effect does not need to depend on paymentPercents
    if (!selectedSkemaId) {
      setPaymentPercents((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    const selectedSkema = skemaPembayaranOptions.find((s) => s.skema_pembayaran_id === selectedSkemaId);
    if (!selectedSkema?.skema_pembayaran?.details) {
      setPaymentPercents((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    const map: Record<number, number> = {};
    selectedSkema.skema_pembayaran.details.forEach((d: any) => {
      map[d.id] = typeof d.persentase === 'number' ? d.persentase : Number(d.persentase) || 0;
    });

    setPaymentPercents((prev) => {
      const keysA = Object.keys(map);
      const keysB = Object.keys(prev);
      if (keysA.length !== keysB.length) return map;
      for (const k of keysA) {
        if (prev[Number(k)] !== map[Number(k)]) return map;
      }
      return prev; // unchanged
    });
  }, [selectedSkemaId, skemaPembayaranOptions]);

  // Sync paymentAmounts whenever skema/harga change (reset when skema changes)
  useEffect(() => {
    if (!selectedSkemaId) {
      setPaymentAmounts((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      lastSyncedAmountsRef.current = null;
      return;
    }

    const map: Record<number, string> = {};
    paymentRows.forEach((r) => {
      const pct = paymentPercents[r.id] ?? (r as any).persentase ?? 0;
      const amt = Math.round((hargaSetelahDiskon * pct) / 100);
      map[r.id] = String(amt);
    });
    // Use functional updater so we compare against the freshest prev state
    setPaymentAmounts((prev) => {
      const prevKeys = Object.keys(prev).map((k) => Number(k)).sort((a, b) => a - b);
      const newKeys = Object.keys(map).map((k) => Number(k)).sort((a, b) => a - b);
      let shouldSet = false;
      if (prevKeys.length !== newKeys.length) shouldSet = true;
      else {
        for (let i = 0; i < newKeys.length; i++) {
          const k = newKeys[i];
          if ((prev[k] ?? '') !== (map[k] ?? '')) {
            shouldSet = true;
            break;
          }
        }
      }
      if (shouldSet) {
        lastSyncedAmountsRef.current = map;
        return map;
      }
      return prev;
    });
  }, [selectedSkemaId, paymentRows, hargaSetelahDiskon]);

  // Debounce: apply textbox amounts to paymentPercents after user stops typing
  useEffect(() => {
    // If the current paymentAmounts are exactly what we last synced from paymentPercents,
    // skip running the debounce to avoid a feedback loop.
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
     // wait 600ms after the last change
     debounceRef.current = setTimeout(() => {
       setPaymentPercents((prev) => {
         const next = { ...prev };
         let changed = false;
         Object.keys(paymentAmounts).forEach((k) => {
           const id = Number(k);
           const num = Number(paymentAmounts[id] || '0') || 0;
           let newPct = 0;
           if (hargaSetelahDiskon > 0) {
             newPct = Math.round((num / hargaSetelahDiskon) * 100);
           }
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

  // Reset payment dates when skema changes
  useEffect(() => {
    setPaymentDates({});
  }, [selectedSkemaId]);

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
      setPaymentDates({});
      setJangkaWaktu('');
      setCatatan('');
    }
    onOpenChange(val);
  };

  const handleSubmit = async () => {
    if (!jumlahKavling || jumlahKavling.trim() === '') {
      toast.error('No. Kavling wajib diisi');
      return;
    }
    const tipe_diskon_api = tipeDiskon === 'persen' ? 'percent' : 'fixed';

    // Build detail_pembayaran array using user-controlled percents (from sliders)
    const detail_pembayaran = paymentRows
      .map((row) => {
        const pct = paymentPercents[row.id] ?? (row as any).persentase ?? 0;
        return {
          skema_pembayaran_id: selectedSkemaId,
          detail_skema_pembayaran_id: row.id,
          tanggal: paymentDates[row.id] ? paymentDates[row.id]?.toISOString().split('T')[0] : undefined,
          nama: row.label,
          persentase: pct
        };
      })
      .filter((item) => item.tanggal !== undefined);

    const payload: any = {
      no_transaksi: noTransaksi || '',
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
      dp: dpValue,
      ...(jangkaWaktu !== '' ? { jangka_waktu: Number(jangkaWaktu) } : {}),
      ...(catatan !== '' ? { catatan } : {}),
      ...(detail_pembayaran.length > 0 ? { detail_pembayaran } : {})
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
      <DialogContent className='!max-w-[900px] border-0 p-0'>
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
                      className={FIELD_CLS}
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
                      className={FIELD_CLS}
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
                    />
                  </div>
                </div>
              ) : (
                ''
              )}
              <div>
                <Label className='mb-2 block'>Nama Konsumen</Label>
                <SearchSelect
                  className={FIELD_CLS}
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
                  <Label className='mb-2 block'>No. Kavling</Label>
                  <Input
                    type='text'
                    placeholder='Masukkan no kavling'
                    className={FIELD_CLS}
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
                  {tipeDiskon === 'nominal' ? (
                    <Input
                      type='text'
                      placeholder='0'
                      className={FIELD_CLS}
                      value={diskon && diskon !== '' ? formatRupiahPlain(Number(diskon)) : ''}
                      onChange={(e) => {
                        const numeric = parseNumeric(e.target.value);
                        setDiskon(numeric);
                      }}
                    />
                  ) : (
                    <Input
                      type='number'
                      placeholder='0-100'
                      className={FIELD_CLS}
                      min={0}
                      max={100}
                      value={diskon}
                      onChange={(e) => setDiskon(e.target.value)}
                    />
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <Label className='mb-2 block'>Jangka Waktu (bulan)</Label>
                  <Input
                    type='number'
                    placeholder='12'
                    className={FIELD_CLS}
                    min={1}
                    value={jangkaWaktu}
                    onChange={(e) => setJangkaWaktu(e.target.value)}
                  />
                </div>
                <div>
                  <Label className='mb-2 block'>Catatan</Label>
                  <Input
                    type='text'
                    placeholder='Masukkan catatan'
                    className={FIELD_CLS}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
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
                    <SelectTrigger className={FIELD_CLS}>
                      <SelectValue placeholder='Pilih skema pembayaran' />
                    </SelectTrigger>
                    <SelectContent>
                      {skemaPembayaranOptions.map((skema) => (
                        <SelectItem key={skema.id} value={skema.skema_pembayaran_id.toString()}>
                          {skema.skema_pembayaran.nama}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                              onChange={(date) => {
                                setPaymentDates((prev) => ({
                                  ...prev,
                                  [row.id]: date
                                }));
                              }}
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
                                  // reflect slider change immediately in textbox
                                  setPaymentAmounts((prev) => ({ ...prev, [row.id]: String(Math.round((hargaSetelahDiskon * v) / 100)) }));
                                }}
                                className='h-1 flex-1 appearance-none rounded-full bg-gray-200 accent-orange-500'
                              />

                              <span className='whitespace-nowrap pl-3 text-sm text-muted-foreground'>{pct}%</span>
                            </div>
                            <div className='text-muted-foreground text-xs md:hidden'>Angsuran</div>

                            {/* Editable angsuran input: when user edits amount we compute the corresponding percent */}
                            <div className='mt-2 flex items-center gap-3'>
                              <Input
                                type='text'
                                className='!h-9 w-40 text-right'
                                // show formatted amount when available; otherwise fallback to computed displayAmount
                                value={paymentAmounts[row.id] ? formatRupiahPlain(Number(paymentAmounts[row.id])) : formatRupiahPlain(displayAmount)}
                                onChange={(e) => {
                                  // store only digits in paymentAmounts immediately
                                  const numeric = parseNumeric(e.target.value);
                                  setPaymentAmounts((prev) => ({ ...prev, [row.id]: numeric }));
                                  // do not update paymentPercents here; the debounced effect will apply after user stops typing
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
                    <span className={`font-medium ${totalPercent !== 100 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Total: {totalPercent}%
                    </span>
                    {totalPercent !== 100 ? (
                      <div className='text-rose-600 text-sm'>Total persentase harus 100% untuk konsistensi (opsional: normalisasi otomatis).</div>
                    ) : null}
                  </div>
                  {totalPercent !== 100 ? (
                    <div className='flex items-center gap-2'>
                      <Button
                        className='h-9 rounded-md bg-orange-400 px-3 text-white hover:bg-orange-500'
                        onClick={redistributePercents}>
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
