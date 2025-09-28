'use client';

import { memo, useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { currency, uncurrency } from '@/lib/utils';
import { useAllBlok, useAllTipe, useAllUnit } from '@/services/penjualan';
import { useAllProjects, usePropertyById } from '@/services/properti';
import { CreatePropertyData, PropertyData, UpdatePropertyData } from '@/types/properti';
import { zodResolver } from '@hookform/resolvers/zod';

import { FilePondFile } from 'filepond';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const propertiSchema = z.object({
  project_id: z.string().min(1, 'Proyek harus dipilih'),
  luas_bangunan: z.string().min(1, 'Luas bangunan harus diisi'),
  luas_tanah: z.string().min(1, 'Luas tanah harus diisi'),
  kelebihan: z.string().min(1, 'Kelebihan harus diisi').max(255, 'Kelebihan maksimal 255 karakter'),
  lokasi: z.string().min(1, 'Lokasi harus diisi').max(255, 'Lokasi maksimal 255 karakter'),
  harga: z.string().optional(),
  // Multiple select fields
  unit_ids: z.array(z.string()).optional(),
  tipe_ids: z.array(z.string()).optional(),
  blok_ids: z.array(z.string()).optional(),
  properti__gambars: z.array(z.any()).optional(),
  fasilitas: z
    .array(
      z.object({
        name: z.string().min(1, 'Nama fasilitas harus diisi').max(255, 'Nama fasilitas maksimal 255 karakter')
      })
    )
    .optional(),
  daftar_harga: z
    .array(
      z.object({
        tipe_id: z.string().min(1, 'Tipe harus dipilih'),
        unit_id: z.string().min(1, 'Unit harus dipilih'),
        harga: z
          .string()
          .min(1, 'Harga harus diisi')
          .refine(
            (value) => {
              const numericValue = value.replace(/[^\d]/g, '');
              return !isNaN(parseFloat(numericValue)) && parseFloat(numericValue) >= 0;
            },
            { message: 'Harga harus berupa angka positif' }
          )
      })
    )
    .optional()
});

type PropertiFormData = z.infer<typeof propertiSchema>;

interface PropertiFormProps {
  selectedId?: number | null;
  onSubmit: (data: CreatePropertyData | UpdatePropertyData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PropertiForm = memo(function PropertiForm({
  selectedId,
  onSubmit,
  onCancel,
  isLoading = false
}: PropertiFormProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { data: projectOptions = [], isLoading: isLoadingProjects } = useAllProjects();
  const { data: blokOptions = [], isLoading: isLoadingBlok } = useAllBlok();
  const { data: tipeOptions = [], isLoading: isLoadingTipe } = useAllTipe();
  const { data: unitOptions = [], isLoading: isLoadingUnit } = useAllUnit();

  const safeProjectOptions = projectOptions.map((project) => ({
    value: project.id.toString(),
    label: project.name
  }));
  const safeBlokOptions = blokOptions.map((blok) => ({
    value: blok.id.toString(),
    label: blok.name
  }));
  const safeTipeOptions = tipeOptions.map((tipe) => ({
    value: tipe.id.toString(),
    label: tipe.name
  }));
  const safeUnitOptions = unitOptions.map((unit) => ({
    value: unit.id.toString(),
    label: unit.name
  }));

  const {
    data: existingData,
    isFetching,
    error: fetchError
  } = usePropertyById(selectedId !== undefined ? selectedId : null, ['projek', 'properti_gambar']);

  const existingImages = useMemo(() => {
    return existingData?.properti_gambar?.map((img: any) => `${img.image_url}?v=${Date.now()}` || '') || [];
  }, [existingData?.properti_gambar]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<PropertiFormData>({
    resolver: zodResolver(propertiSchema),
    defaultValues: {
      project_id: '',
      luas_bangunan: '',
      luas_tanah: '',
      kelebihan: '',
      lokasi: '',
      harga: '1',
      unit_ids: [],
      tipe_ids: [],
      blok_ids: [],
      properti__gambars: [],
      fasilitas: [],
      daftar_harga: []
    }
  });

  const projectId = watch('project_id');
  const harga = watch('harga');
  const daftarHarga = watch('daftar_harga') || [];
  const fasilitas = watch('fasilitas') || [];
  const unitIds = watch('unit_ids') || [];
  const tipeIds = watch('tipe_ids') || [];
  const blokIds = watch('blok_ids') || [];

  const safeTipeHargaOptions = tipeOptions
    .filter((tipe) => tipeIds.includes(tipe.id.toString()))
    .map((tipe) => ({
      value: tipe.id.toString(),
      label: tipe.name
    }));
  const safeUnitHargaOptions = unitOptions
    .filter((unit) => unitIds.includes(unit.id.toString()))
    .map((unit) => ({
      value: unit.id.toString(),
      label: unit.name
    }));

  const handleAddDaftarHarga = () => {
    const currentDaftarHarga = daftarHarga || [];
    setValue('daftar_harga', [...currentDaftarHarga, { tipe_id: '', unit_id: '', harga: '' }]);
  };

  const handleRemoveDaftarHarga = (index: number) => {
    const currentDaftarHarga = daftarHarga || [];
    const updatedDaftarHarga = currentDaftarHarga.filter((_, i) => i !== index);
    setValue('daftar_harga', updatedDaftarHarga);
  };

  const handleAddFasilitas = () => {
    const currentFasilitas = fasilitas || [];
    setValue('fasilitas', [...currentFasilitas, { name: '' }]);
  };

  const handleRemoveFasilitas = (index: number) => {
    const currentFasilitas = fasilitas || [];
    const updatedFasilitas = currentFasilitas.filter((_, i) => i !== index);
    setValue('fasilitas', updatedFasilitas);
  };

  useEffect(() => {
    if (existingData && selectedId) {
      const formValues = {
        project_id: existingData.project_id?.toString() || '',
        luas_bangunan: existingData.luas_bangunan || '',
        luas_tanah: existingData.luas_tanah || '',
        kelebihan: existingData.kelebihan || '',
        lokasi: existingData.lokasi || '',
        harga: existingData.harga != null ? currency(existingData.harga) : '',
        unit_ids: existingData.unit_ids ? existingData.unit_ids.map((id: number) => id.toString()) : [],
        tipe_ids: existingData.tipe_ids ? existingData.tipe_ids.map((id: number) => id.toString()) : [],
        blok_ids: existingData.blok_ids ? existingData.blok_ids.map((id: number) => id.toString()) : [],
        properti__gambars: [],
        fasilitas: existingData.fasilitas || [],
        daftar_harga: existingData.daftar_harga
          ? existingData.daftar_harga.map((item) => ({
              tipe_id: item.tipe_id.toString(),
              unit_id: item.unit_id.toString(),
              harga: currency(item.harga)
            }))
          : []
      };

      reset(formValues);

      // FIXED: Don't convert existing images to File objects
      // FileUpload will handle existing images via initialFiles prop
      setUploadedFiles([]);
    } else if (!selectedId) {
      reset({
        project_id: '',
        luas_bangunan: '',
        luas_tanah: '',
        kelebihan: '',
        lokasi: '',
        harga: '',
        unit_ids: [],
        tipe_ids: [],
        blok_ids: [],
        properti__gambars: [],
        fasilitas: [],
        daftar_harga: []
      });
      setUploadedFiles([]);
    }
  }, [existingData, reset, selectedId, isFetching]);

  const handleFileUploadChange = (file: FilePondFile[] | null) => {
    if (file && file.length > 0) {
      setUploadedFiles(file.map((f) => f.file as File));
      setValue(
        'properti__gambars',
        file.map((f) => f.file as File)
      );
    } else {
      setUploadedFiles([]);
      setValue('properti__gambars', []);
    }
  };

  const handleFormSubmit = (data: PropertiFormData) => {
    if (!selectedId && uploadedFiles.length === 0) {
      alert('Minimal 1 gambar harus diupload');
      return;
    }

    if (selectedId && uploadedFiles.length === 0 && existingImages.length === 0) {
      alert('Minimal 1 gambar harus ada (existing atau upload baru)');
      return;
    }

    if (!data.project_id || !data.luas_bangunan || !data.luas_tanah || !data.kelebihan || !data.lokasi) {
      alert('Semua field wajib diisi');
      return;
    }

    const hargaNumber = data.harga ? uncurrency(data.harga) : 0;
    // if (isNaN(hargaNumber) || hargaNumber <= 0) {
    //   alert('Harga harus berupa angka positif');
    //   return;
    // }

    if (data.daftar_harga && data.daftar_harga.length > 0) {
      const invalidDaftarHarga = data.daftar_harga.some((item) => !item.tipe_id || !item.unit_id || !item.harga);
      if (invalidDaftarHarga) {
        alert('Semua field di Daftar Harga harus diisi');
        return;
      }
    }

    if (selectedId) {
      // Edit mode - handle existing images and new uploads
      const hasNewFiles = uploadedFiles.length > 0;
      const hasExistingImages = existingImages.length > 0;

      // If no new files uploaded, we need to preserve existing images
      // Convert existing image URLs to File objects for submission
      let filesToSubmit: File[] = [];

      if (hasNewFiles) {
        // User uploaded new files
        filesToSubmit = uploadedFiles;
      } else if (hasExistingImages) {
        // No new files, but we have existing images - convert URLs to File objects
        filesToSubmit = existingImages.map((imageUrl, index) => {
          return new File([], `existing-image-${index + 1}.jpg`, { type: 'image/jpeg' });
        });
      }

      const submitData: UpdatePropertyData = {
        project_id: parseInt(data.project_id),
        luas_bangunan: data.luas_bangunan.trim(),
        luas_tanah: data.luas_tanah.trim(),
        kelebihan: data.kelebihan.trim(),
        lokasi: data.lokasi.trim(),
        harga: hargaNumber,
        unit_ids: data.unit_ids ? data.unit_ids.map((id) => parseInt(id)) : [],
        tipe_ids: data.tipe_ids ? data.tipe_ids.map((id) => parseInt(id)) : [],
        blok_ids: data.blok_ids ? data.blok_ids.map((id) => parseInt(id)) : [],
        // FIXED: Send existing images as files if no new files uploaded
        properti__gambars: filesToSubmit,
        fasilitas: data.fasilitas || [],
        daftar_harga: data.daftar_harga
          ? data.daftar_harga.map((item) => ({
              tipe_id: parseInt(item.tipe_id),
              unit_id: parseInt(item.unit_id),
              harga: uncurrency(item.harga)
            }))
          : []
      };

      onSubmit(submitData as CreatePropertyData);
    } else {
      // Create mode - always send files
      const submitData: CreatePropertyData = {
        project_id: parseInt(data.project_id),
        luas_bangunan: data.luas_bangunan.trim(),
        luas_tanah: data.luas_tanah.trim(),
        kelebihan: data.kelebihan.trim(),
        lokasi: data.lokasi.trim(),
        harga: hargaNumber,
        unit_ids: data.unit_ids ? data.unit_ids.map((id) => parseInt(id)) : [],
        tipe_ids: data.tipe_ids ? data.tipe_ids.map((id) => parseInt(id)) : [],
        blok_ids: data.blok_ids ? data.blok_ids.map((id) => parseInt(id)) : [],
        properti__gambars: uploadedFiles.length > 0 ? uploadedFiles : [],
        fasilitas: data.fasilitas || [],
        daftar_harga: data.daftar_harga
          ? data.daftar_harga.map((item) => ({
              tipe_id: parseInt(item.tipe_id),
              unit_id: parseInt(item.unit_id),
              harga: uncurrency(item.harga)
            }))
          : []
      };

      console.log(submitData);
      onSubmit(submitData);
    }
  };

  const handleCancel = () => {
    reset({
      project_id: '',
      luas_bangunan: '',
      luas_tanah: '',
      kelebihan: '',
      lokasi: '',
      harga: '',
      unit_ids: [],
      tipe_ids: [],
      blok_ids: [],
      properti__gambars: [],
      fasilitas: [],
      daftar_harga: []
    });
    setUploadedFiles([]);
    onCancel();
  };

  if (selectedId && isFetching) {
    return (
      <div className='space-y-4'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={`skeleton-${index}`} className='space-y-2'>
              <Skeleton className='h-4 w-16' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-32 w-full' />
        </div>
        <div className='flex justify-end space-x-2 pt-4'>
          <Skeleton className='h-10 w-16' />
          <Skeleton className='h-10 w-20' />
        </div>
      </div>
    );
  }

  if (selectedId && fetchError) {
    return (
      <div className='space-y-4'>
        <div className='rounded-md bg-red-50 p-4'>
          <div className='flex'>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-800'>Error Loading Property Data</h3>
              <div className='mt-2 text-sm text-red-700'>
                <p>Failed to load property data. Please try again.</p>
                {fetchError instanceof Error && <p className='mt-1 text-xs'>Error: {fetchError.message}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className='flex justify-end space-x-2 pt-4'>
          <Button type='button' variant='outline' onClick={onCancel}>
            Cancel
          </Button>
          <Button type='button' onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      <div className='max-h-[600px] overflow-y-auto'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='project_id'>Proyek *</Label>
            <Select
              options={safeProjectOptions}
              value={projectId}
              onChange={(value) => setValue('project_id', value as string)}
              placeholder={isLoadingProjects ? 'Loading...' : 'Pilih Proyek'}
              disabled={isLoadingProjects || isLoading}
            />
            {errors.project_id && <p className='text-sm text-red-600'>{errors.project_id.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='luas_bangunan'>Luas Bangunan *</Label>
            <Input id='luas_bangunan' {...register('luas_bangunan')} placeholder='Contoh: 7×8' disabled={isLoading} />
            {errors.luas_bangunan && <p className='text-sm text-red-600'>{errors.luas_bangunan.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='luas_tanah'>Luas Tanah *</Label>
            <Input id='luas_tanah' {...register('luas_tanah')} placeholder='Contoh: 8×14' disabled={isLoading} />
            {errors.luas_tanah && <p className='text-sm text-red-600'>{errors.luas_tanah.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='kelebihan'>Kelebihan *</Label>
            <Input
              id='kelebihan'
              {...register('kelebihan')}
              placeholder='Contoh: Lingkungan Aman'
              disabled={isLoading}
            />
            {errors.kelebihan && <p className='text-sm text-red-600'>{errors.kelebihan.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='lokasi'>Lokasi *</Label>
            <Input
              id='lokasi'
              {...register('lokasi')}
              placeholder='Contoh: Jalan Anggrek Biru No. 30, Surabaya'
              disabled={isLoading}
            />
            {errors.lokasi && <p className='text-sm text-red-600'>{errors.lokasi.message}</p>}
          </div>

          {/* <div className='space-y-2'>
            <Label htmlFor='harga'>Harga *</Label>
            <Input
              id='harga'
              type='currency'
              placeholder='Contoh: 100.000.000'
              {...register('harga')}
              disabled={isLoading}
            />
            {errors.harga && <p className='text-sm text-red-600'>{errors.harga.message}</p>}
          </div> */}
        </div>

        {/* Multiple Select Fields */}
        <div className='my-8 space-y-4'>
          <h3 className='text-lg font-semibold'>Master Data Terkait</h3>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-2'>
              <Label>Unit</Label>
              <Select
                options={safeUnitOptions}
                value={unitIds}
                onChange={(value) => setValue('unit_ids', value as string[])}
                placeholder={isLoadingUnit ? 'Loading...' : 'Pilih Unit'}
                disabled={isLoadingUnit || isLoading}
                multiple={true}
              />
              {errors.unit_ids && <p className='text-sm text-red-600'>{errors.unit_ids.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Tipe</Label>
              <Select
                options={safeTipeOptions}
                value={tipeIds}
                onChange={(value) => setValue('tipe_ids', value as string[])}
                placeholder={isLoadingTipe ? 'Loading...' : 'Pilih Tipe'}
                disabled={isLoadingTipe || isLoading}
                multiple={true}
              />
              {errors.tipe_ids && <p className='text-sm text-red-600'>{errors.tipe_ids.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Blok</Label>
              <Select
                options={safeBlokOptions}
                value={blokIds}
                onChange={(value) => setValue('blok_ids', value as string[])}
                placeholder={isLoadingBlok ? 'Loading...' : 'Pilih Blok'}
                disabled={isLoadingBlok || isLoading}
                multiple={true}
              />
              {errors.blok_ids && <p className='text-sm text-red-600'>{errors.blok_ids.message}</p>}
            </div>
          </div>
        </div>

        <div className='my-8 space-y-4'>
          <div className='flex items-center justify-between'>
            <Label>Daftar Harga</Label>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleAddDaftarHarga}
              disabled={isLoading || isLoadingTipe || isLoadingUnit}>
              + Tambah Harga
            </Button>
          </div>

          {daftarHarga && daftarHarga.length > 0 ? (
            <div className='space-y-4'>
              {daftarHarga.map((_, index) => (
                <div key={`daftar_harga_${index}`} className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                  <div className='space-y-2'>
                    <Label>Tipe *</Label>
                    <Select
                      options={safeTipeHargaOptions}
                      value={watch(`daftar_harga.${index}.tipe_id`)}
                      onChange={(value) => setValue(`daftar_harga.${index}.tipe_id`, value as string)}
                      placeholder='Pilih Tipe'
                      disabled={isLoading || isLoadingTipe}
                    />
                    {errors.daftar_harga?.[index]?.tipe_id && (
                      <p className='text-sm text-red-600'>{errors.daftar_harga[index]?.tipe_id?.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>Unit *</Label>
                    <Select
                      options={safeUnitHargaOptions}
                      value={watch(`daftar_harga.${index}.unit_id`)}
                      onChange={(value) => setValue(`daftar_harga.${index}.unit_id`, value as string)}
                      placeholder='Pilih Unit'
                      disabled={isLoading || isLoadingUnit}
                    />
                    {errors.daftar_harga?.[index]?.unit_id && (
                      <p className='text-sm text-red-600'>{errors.daftar_harga[index]?.unit_id?.message}</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label>Harga *</Label>
                    <div className='flex items-center gap-2'>
                      <Input
                        type='currency'
                        placeholder='Contoh: 100.000.000'
                        {...register(`daftar_harga.${index}.harga`)}
                        disabled={isLoading}
                      />
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        onClick={() => handleRemoveDaftarHarga(index)}
                        disabled={isLoading}>
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                    {errors.daftar_harga?.[index]?.harga && (
                      <p className='text-sm text-red-600'>{errors.daftar_harga[index]?.harga?.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center'>
              <p className='text-sm text-gray-500'>Belum ada daftar harga</p>
            </div>
          )}
        </div>

        <div className='my-8 space-y-4'>
          <div className='flex items-center justify-between'>
            <Label>Fasilitas</Label>
            <Button type='button' variant='outline' size='sm' onClick={handleAddFasilitas} disabled={isLoading}>
              + Tambah Fasilitas
            </Button>
          </div>

          {fasilitas && fasilitas.length > 0 ? (
            <div className='space-y-4'>
              {fasilitas.map((_, index) => (
                <div key={`fasilitas_${index}`} className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label>Nama Fasilitas *</Label>
                    <div className='flex items-center gap-2'>
                      <Input
                        placeholder='Contoh: Kolam Renang'
                        {...register(`fasilitas.${index}.name`)}
                        disabled={isLoading}
                      />
                      <Button
                        type='button'
                        variant='destructive'
                        size='icon'
                        onClick={() => handleRemoveFasilitas(index)}
                        disabled={isLoading}>
                        <X className='h-4 w-4' />
                      </Button>
                    </div>
                    {errors.fasilitas?.[index]?.name && (
                      <p className='text-sm text-red-600'>{errors.fasilitas[index]?.name?.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center'>
              <p className='text-sm text-gray-500'>Belum ada fasilitas</p>
            </div>
          )}
        </div>

        <div className='space-y-4'>
          <Label>Gambar Properti *</Label>

          {selectedId && existingImages.length > 0 && (
            <div className='space-y-3'>
              <div className='rounded-lg border border-blue-200 bg-blue-50 p-3'>
                <p className='text-sm text-blue-800'>
                  💡 <strong>Petunjuk:</strong> Jika tidak ingin mengubah gambar, langsung update saja. Upload gambar
                  baru hanya jika ingin menambah atau mengganti gambar existing.
                </p>
              </div>
            </div>
          )}

          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700'>
              {selectedId ? 'Upload Gambar Baru (Opsional)' : 'Upload Gambar'}
            </Label>
            <FileUpload
              onChange={handleFileUploadChange}
              acceptedFileTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
              allowMultiple={true}
              maxFiles={10}
              disabled={isLoading}
              initialFiles={existingImages}
            />
          </div>

          {!selectedId && uploadedFiles.length === 0 && (
            <p className='text-sm text-red-600'>Minimal 1 gambar harus diupload</p>
          )}

          {selectedId && uploadedFiles.length === 0 && existingImages.length === 0 && (
            <p className='text-sm text-red-600'>Minimal 1 gambar harus ada (existing atau upload baru)</p>
          )}
        </div>
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={handleCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : selectedId ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
});
