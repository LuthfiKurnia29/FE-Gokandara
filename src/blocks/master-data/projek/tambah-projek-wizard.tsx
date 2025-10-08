'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAllSkemaPembayaran } from '@/services/skema-pembayaran';

import { FilePondFile } from 'filepond';

interface Props {
  onCancel: () => void;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  initialData?: any;
  title?: string;
}

type TabKey = 'proyek' | 'tipe' | 'harga' | 'fasilitas';

const steps: { key: TabKey; label: string }[] = [
  { key: 'proyek', label: 'Projek' },
  { key: 'tipe', label: 'Tipe' },
  { key: 'harga', label: 'Harga' },
  { key: 'fasilitas', label: 'Fasilitas' }
];

export default function TambahProjekWizard({ onCancel, onSubmit, isLoading, initialData, title }: Props) {
  const [active, setActive] = useState<TabKey>('proyek');

  // Step 1: Projek
  const [projectName, setProjectName] = useState('');
  const [address, setAddress] = useState('');
  const [jumlahKavling, setJumlahKavling] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Step 2: Tipe
  const [types, setTypes] = useState(
    Array.from({ length: 2 }).map(() => ({
      name: '',
      luasTanah: '',
      luasBangunan: '',
      jumlahUnit: '',
      unitTerjual: ''
    }))
  );

  // Step 3: Harga per Jenis Pembayaran
  const [prices, setPrices] = useState(
    Array.from({ length: 2 }).map(() => ({ tipe: '', items: [] as { jenisId: string; harga: string }[] }))
  );

  // Step 4: Fasilitas
  const [facilities, setFacilities] = useState(Array.from({ length: 2 }).map(() => ({ name: '', luas: '' })));

  useEffect(() => {
    if (!initialData) return;
    if (typeof initialData.projectName === 'string') setProjectName(initialData.projectName);
    if (typeof initialData.address === 'string') setAddress(initialData.address);
    if (typeof initialData.jumlahKavling === 'string' || typeof initialData.jumlahKavling === 'number') {
      setJumlahKavling(String(initialData.jumlahKavling ?? ''));
    }
    if (Array.isArray(initialData.types) && initialData.types.length > 0) {
      setTypes(
        initialData.types.map((t: any) => ({
          name: t.name ?? '',
          luasTanah: t.luasTanah ? String(t.luasTanah) : '',
          luasBangunan: t.luasBangunan ? String(t.luasBangunan) : '',
          jumlahUnit: t.jumlahUnit ? String(t.jumlahUnit) : '',
          unitTerjual: t.unitTerjual ? String(t.unitTerjual) : ''
        }))
      );
    }
    if (Array.isArray(initialData.prices) && initialData.prices.length > 0) {
      setPrices(
        initialData.prices.map((p: any) => ({
          tipe: p.tipe ?? '',
          items: Array.isArray(p.items)
            ? p.items.map((it: any) => ({ jenisId: String(it.jenisId ?? it.id ?? ''), harga: String(it.harga ?? '') }))
            : []
        }))
      );
    }
    if (Array.isArray(initialData.facilities) && initialData.facilities.length > 0) {
      setFacilities(
        initialData.facilities.map((f: any) => ({ name: f.name ?? '', luas: f.luas ? String(f.luas) : '' }))
      );
    }
  }, [initialData]);

  // Sync jumlah baris Harga dengan jumlah baris Tipe
  useEffect(() => {
    setPrices((prev) => {
      const target = types.length;
      const next = Array.from({ length: target }).map((_, i) => {
        const cur = prev[i] ?? { tipe: '', items: [] as { jenisId: string; harga: string }[] };
        return { ...cur, tipe: types[i]?.name ?? '' };
      });
      return next;
    });
  }, [types]);

  const canNext = useMemo(() => {
    if (active === 'proyek') return projectName.trim().length > 0;
    return true;
  }, [active, projectName]);

  const { data: skemaPembayaranOptions = [], isLoading: isLoadingSkema } = useAllSkemaPembayaran();
  const paymentOptions = useMemo(
    () => skemaPembayaranOptions.map((skema) => ({ value: skema.id.toString(), label: skema.nama })),
    [skemaPembayaranOptions]
  );
  const paymentLabelById = useMemo(() => {
    const map: Record<string, string> = {};
    paymentOptions.forEach((opt) => (map[opt.value] = opt.label));
    return map;
  }, [paymentOptions]);

  const handleFileUploadChange = (files: FilePondFile[] | null) => {
    if (!files) {
      setUploadedFiles([]);
      return;
    }
    setUploadedFiles(files.map((f) => f.file as File));
  };

  const handleSubmit = () => {
    onSubmit({ projectName, address, jumlahKavling, types, prices, facilities, gambars: uploadedFiles });
  };

  const tabIndex = steps.findIndex((s) => s.key === active);
  const goNext = () => setActive(steps[Math.min(tabIndex + 1, steps.length - 1)].key);
  const goPrev = () => setActive(steps[Math.max(tabIndex - 1, 0)].key);

  return (
    <div className='flex w-full flex-col'>
      {/* Header */}
      <div className='border-b px-6 pt-6'>
        <h2 className='text-2xl font-bold'>{title ?? 'Tambah Projek'}</h2>
        {/* Tabs */}
        <div className='mt-6 flex gap-8'>
          {steps.map((s) => (
            <button
              key={s.key}
              className={`border-teal-600 pb-3 text-sm font-semibold ${
                active === s.key ? 'border-b-2 text-teal-700' : 'text-gray-500'
              }`}
              onClick={() => setActive(s.key)}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className='max-h-[70vh] overflow-y-auto px-6 py-6'>
        {active === 'proyek' && (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label>Nama Projek</Label>
              <Input
                placeholder='Masukkan nama projek'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className='h-12'
              />
            </div>
            <div className='space-y-2 md:col-span-1'>
              <Label>Alamat</Label>
              <Textarea
                placeholder='Masukkan alamat'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='h-28'
              />
            </div>
            <div className='space-y-2 md:col-span-1'>
              <Label>Jumlah Kavling</Label>
              <Input
                type='number'
                min={1}
                step={1}
                placeholder=''
                value={jumlahKavling}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setJumlahKavling(val);
                }}
                className='h-12'
              />
            </div>
            <div className='space-y-2 md:col-span-2'>
              <Label>Upload Gambar Projek</Label>
              <FileUpload
                onChange={handleFileUploadChange}
                initialFiles={initialData?.gambarUrls ?? uploadedFiles}
                allowMultiple
                acceptedFileTypes={['image/*']}
                credits={false}
              />
            </div>
          </div>
        )}

        {active === 'tipe' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div />
              <button
                className='text-gray-500 hover:text-gray-700'
                onClick={() =>
                  setTypes((prev) => [
                    ...prev,
                    { name: '', luasTanah: '', luasBangunan: '', jumlahUnit: '', unitTerjual: '' }
                  ])
                }>
                {' '}
                + Tambah Tipe
              </button>
            </div>
            {types.map((t, idx) => {
              const unitTersisa = (Number(t.jumlahUnit) || 0) - (Number(t.unitTerjual) || 0);
              return (
                <div key={idx} className='grid grid-cols-1 gap-4 md:grid-cols-6'>
                  <div className='space-y-2'>
                    <Label>Nama Tipe</Label>
                    <Input
                      value={t.name}
                      onChange={(e) =>
                        setTypes((prev) => prev.map((it, i) => (i === idx ? { ...it, name: e.target.value } : it)))
                      }
                      className='h-12'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Luas Tanah</Label>
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      value={t.luasTanah}
                      onChange={(e) =>
                        setTypes((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, luasTanah: e.target.value.replace(/[^0-9]/g, '') } : it
                          )
                        )
                      }
                      className='h-12'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Luas Bangunan</Label>
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      value={t.luasBangunan}
                      onChange={(e) =>
                        setTypes((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, luasBangunan: e.target.value.replace(/[^0-9]/g, '') } : it
                          )
                        )
                      }
                      className='h-12'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Jumlah Unit</Label>
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      placeholder=''
                      value={t.jumlahUnit}
                      onChange={(e) =>
                        setTypes((prev) =>
                          prev.map((it, i) =>
                            i === idx ? { ...it, jumlahUnit: e.target.value.replace(/[^0-9]/g, '') } : it
                          )
                        )
                      }
                      className='h-12'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label>Unit Terjual</Label>
                    <Input type='number' min={0} step={1} placeholder='' readOnly className='h-12 bg-gray-50' />
                  </div>
                  <div className='space-y-2'>
                    <Label>Unit Tersisa</Label>
                    <Input value={unitTersisa.toString()} readOnly className='h-12 bg-gray-50' />
                  </div>
                  <div className='space-y-2 md:col-span-6'>
                    <Button
                      variant='destructive'
                      className='w-full'
                      disabled={types.length <= 1}
                      title={types.length <= 1 ? 'Minimal harus tersisa 1 baris' : undefined}
                      onClick={() => {
                        setTypes((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
                      }}>
                      Hapus
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {active === 'harga' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div />
            </div>
            {prices.map((p, idx) => (
              <div key={idx} className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='space-y-2'>
                  <Label>Nama Tipe</Label>
                  <Input value={p.tipe} readOnly className='h-12 bg-gray-50' />
                </div>
                <div className='space-y-2'>
                  <Label>Jenis Pembayaran</Label>
                  <Select
                    multiple
                    options={paymentOptions}
                    value={p.items.map((it) => it.jenisId)}
                    showCountWhenMultiple
                    renderMultipleCountLabel={(n) => `${n} jenis dipilih`}
                    onChange={(v) => {
                      const selected = ((v as string[]) ?? []).filter(Boolean);
                      setPrices((prev) =>
                        prev.map((it, i) => {
                          if (i !== idx) return it;
                          const existing = it.items ?? [];
                          const nextItems = selected.map((id) => {
                            const found = existing.find((e) => e.jenisId === id);
                            return { jenisId: id, harga: found?.harga ?? '' };
                          });
                          return { ...it, items: nextItems };
                        })
                      );
                    }}
                    placeholder={isLoadingSkema ? 'Loading...' : 'Pilih'}
                    className='h-12'
                  />
                </div>
                <div className='space-y-2 md:col-span-3'>
                  <Label>Harga per Jenis Pembayaran</Label>
                  {p.items.length === 0 ? (
                    <p className='text-sm text-gray-500'>Pilih jenis pembayaran terlebih dahulu</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jenis</TableHead>
                          <TableHead>Harga</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {p.items.map((item, jdx) => (
                          <TableRow key={jdx}>
                            <TableCell>
                              <Input
                                value={paymentLabelById[item.jenisId] ?? item.jenisId}
                                readOnly
                                className='h-10 w-full bg-gray-50'
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type='text'
                                inputMode='numeric'
                                pattern='[0-9]*'
                                placeholder='0'
                                value={item.harga ? new Intl.NumberFormat('id-ID').format(Number(item.harga)) : ''}
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/[^\d]/g, '');
                                  setPrices((prev) =>
                                    prev.map((it, i) => {
                                      if (i !== idx) return it;
                                      const nextItems = it.items.map((x, k) => (k === jdx ? { ...x, harga: raw } : x));
                                      return { ...it, items: nextItems };
                                    })
                                  );
                                }}
                                className='h-10 w-full'
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                <div className='md:col-span-3'>
                  <Separator className='my-2' />
                </div>
              </div>
            ))}
          </div>
        )}

        {active === 'fasilitas' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div />
              <button
                className='text-gray-500 hover:text-gray-700'
                onClick={() => setFacilities((prev) => [...prev, { name: '', luas: '' }])}>
                + Tambah Fasilitas
              </button>
            </div>
            {facilities.map((f, idx) => (
              <div key={idx} className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div className='space-y-2'>
                  <Label>Nama Fasilitas</Label>
                  <Input
                    value={f.name}
                    onChange={(e) =>
                      setFacilities((prev) => prev.map((it, i) => (i === idx ? { ...it, name: e.target.value } : it)))
                    }
                    className='h-12'
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Luas Fasilitas</Label>
                  <div className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2'>
                    <Input
                      type='number'
                      min={1}
                      step={1}
                      value={f.luas}
                      onChange={(e) =>
                        setFacilities((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, luas: e.target.value.replace(/[^0-9]/g, '') } : it))
                        )
                      }
                      className='h-12'
                    />
                    <Button
                      variant='destructive'
                      className='shrink-0'
                      disabled={facilities.length <= 1}
                      title={facilities.length <= 1 ? 'Minimal harus tersisa 1 baris' : undefined}
                      onClick={() => {
                        setFacilities((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
                      }}>
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between gap-3 bg-gray-50 px-6 py-6'>
        <Button variant='secondary' onClick={onCancel} className='h-11 px-6'>
          Batalkan
        </Button>
        {active !== 'fasilitas' ? (
          <Button
            onClick={goNext}
            disabled={!canNext}
            className='h-11 bg-orange-400 px-6 text-white hover:bg-orange-500'>
            Selanjutnya
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className='h-11 bg-green-500 px-6 text-white hover:bg-green-600'>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
}
