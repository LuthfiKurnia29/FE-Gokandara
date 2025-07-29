'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllProjects, usePropertyById } from '@/services/properti';
import { CreatePropertyData, PropertyData, UpdatePropertyData } from '@/types/properti';
import { zodResolver } from '@hookform/resolvers/zod';

import { Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form validation schema sesuai dengan Laravel controller validation
const propertiSchema = z.object({
  project_id: z.string().min(1, 'Proyek harus dipilih'),
  luas_bangunan: z.string().min(1, 'Luas bangunan harus diisi'),
  luas_tanah: z.string().min(1, 'Luas tanah harus diisi'),
  kelebihan: z.string().min(1, 'Kelebihan harus diisi').max(255, 'Kelebihan maksimal 255 karakter'),
  lokasi: z.string().min(1, 'Lokasi harus diisi').max(255, 'Lokasi maksimal 255 karakter'),
  harga: z
    .string()
    .min(1, 'Harga harus diisi')
    .refine(
      (value) => {
        const numericValue = value.replace(/,/g, '');
        return !isNaN(parseFloat(numericValue)) && parseFloat(numericValue) >= 0;
      },
      { message: 'Harga harus berupa angka positif' }
    ),
  properti__gambars: z.array(z.instanceof(File)).optional()
});

// Debug validation function
const debugValidation = (data: any) => {
  console.log('🔍 Validation Debug:', {
    project_id: { value: data.project_id, valid: !!data.project_id && data.project_id.length > 0 },
    luas_bangunan: { value: data.luas_bangunan, valid: !!data.luas_bangunan && data.luas_bangunan.length > 0 },
    luas_tanah: { value: data.luas_tanah, valid: !!data.luas_tanah && data.luas_tanah.length > 0 },
    kelebihan: { value: data.kelebihan, valid: !!data.kelebihan && data.kelebihan.length > 0 },
    lokasi: { value: data.lokasi, valid: !!data.lokasi && data.lokasi.length > 0 },
    harga: { value: data.harga, valid: !!data.harga && data.harga.length > 0 }
  });
};

type PropertiFormData = z.infer<typeof propertiSchema>;

interface PropertiFormProps {
  selectedId?: number | null; // ← ID properti yang akan diedit
  onSubmit: (data: CreatePropertyData | UpdatePropertyData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PropertiForm = memo(function PropertiForm({
  selectedId, // ← ID diterima sebagai prop
  onSubmit,
  onCancel,
  isLoading = false
}: PropertiFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]); // ← Separate state for existing images
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]); // ← Separate state for new image previews

  // Fetch master data from APIs
  const { data: projectOptions = [], isLoading: isLoadingProjects } = useAllProjects();

  // Get existing data for edit mode
  const {
    data: existingData,
    isFetching,
    error: fetchError
  } = usePropertyById(
    selectedId !== undefined ? selectedId : null, // ← ID dikirim ke hook
    ['project', 'properti_gambar'] // ← Include relations (sesuaikan dengan API)
  );

  // Debug logging
  useEffect(() => {
    if (selectedId) {
      console.log('🔍 PropertiForm - Edit Mode Debug:', {
        selectedId,
        existingData,
        isFetching,
        fetchError,
        hasData: !!existingData,
        dataKeys: existingData ? Object.keys(existingData) : [],
        existingImages: existingImages.length,
        selectedFiles: selectedFiles.length,
        newImagePreviews: newImagePreviews.length,
        existingImagesUrls: existingImages,
        selectedFilesNames: selectedFiles.map((f) => f.name)
      });
    }
  }, [selectedId, existingData, isFetching, fetchError, existingImages, selectedFiles, newImagePreviews]);

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
      harga: '',
      properti__gambars: []
    }
  });

  // Watch form values for Select components
  const projectId = watch('project_id');
  const harga = watch('harga');

  // Debug: Watch all form values
  const allFormValues = watch();
  useEffect(() => {
    if (selectedId) {
      console.log('🔍 Form Values Watch:', allFormValues);
    }
  }, [allFormValues, selectedId]);

  // Safe option mapping
  const safeProjectOptions = projectOptions.map((project) => ({
    value: project.id.toString(),
    label: project.name
  }));

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Populate form with existing data in edit mode
  useEffect(() => {
    console.log('🔍 PropertiForm - useEffect Debug:', {
      selectedId,
      existingData,
      isFetching,
      hasExistingData: !!existingData,
      propertiGambars: existingData?.properti_gambar,
      propertiGambarsLength: existingData?.properti_gambar?.length,
      propertiGambarsType: typeof existingData?.properti_gambar,
      isArray: Array.isArray(existingData?.properti_gambar)
    });

    if (existingData && selectedId) {
      const formValues = {
        project_id: existingData.project_id?.toString() || '',
        luas_bangunan: existingData.luas_bangunan || '',
        luas_tanah: existingData.luas_tanah || '',
        kelebihan: existingData.kelebihan || '',
        lokasi: existingData.lokasi || '',
        harga: existingData.harga ? formatCurrency(existingData.harga.toString()) : '',
        properti__gambars: []
      };

      console.log('📝 Populating form with values:', formValues);
      reset(formValues);

      // Set existing images for preview
      if (
        existingData.properti_gambar &&
        Array.isArray(existingData.properti_gambar) &&
        existingData.properti_gambar.length > 0
      ) {
        console.log('📸 Setting existing images:', existingData.properti_gambar);
        const urls = existingData.properti_gambar.map((img: any) => {
          console.log('🖼️ Image object:', img);
          return img.image_url || img.image; // Use image_url if available, fallback to image
        });
        console.log('🔗 Image URLs:', urls);
        setExistingImages(urls);
      } else {
        console.log('⚠️ No existing images found or invalid format');
        setExistingImages([]);
      }
    } else if (!selectedId) {
      // Reset form when not in edit mode
      reset({
        project_id: '',
        luas_bangunan: '',
        luas_tanah: '',
        kelebihan: '',
        lokasi: '',
        harga: '',
        properti__gambars: []
      });
      setExistingImages([]);
      setNewImagePreviews([]);
    }
  }, [existingData, reset, selectedId, isFetching]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    setValue('harga', formatted);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate file types
    const validFiles = files.filter(
      (file) =>
        file.type.startsWith('image/') && ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (validFiles.length !== files.length) {
      alert('Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan');
    }

    // Add new files to selected files
    setSelectedFiles((prev) => [...prev, ...validFiles]);

    // Create preview URLs for new files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    // Clear the input
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (data: PropertiFormData) => {
    console.log('🔍 Form Submit Debug:', {
      selectedId,
      formData: data,
      existingImages: existingImages.length,
      selectedFiles: selectedFiles.length,
      isEditMode: !!selectedId,
      formValues: {
        project_id: data.project_id,
        luas_bangunan: data.luas_bangunan,
        luas_tanah: data.luas_tanah,
        kelebihan: data.kelebihan,
        lokasi: data.lokasi,
        harga: data.harga
      }
    });

    // Debug validation
    debugValidation(data);

    // Validate images for create mode
    if (!selectedId && selectedFiles.length === 0) {
      alert('Minimal 1 gambar harus diupload');
      return;
    }

    // Validate images for edit mode (must have existing images or new files)
    if (selectedId && existingImages.length === 0 && selectedFiles.length === 0) {
      alert('Minimal 1 gambar harus ada (existing atau baru)');
      return;
    }

    // Validate required fields
    if (!data.project_id || !data.luas_bangunan || !data.luas_tanah || !data.kelebihan || !data.lokasi || !data.harga) {
      console.error('❌ Missing required fields:', {
        project_id: !!data.project_id,
        luas_bangunan: !!data.luas_bangunan,
        luas_tanah: !!data.luas_tanah,
        kelebihan: !!data.kelebihan,
        lokasi: !!data.lokasi,
        harga: !!data.harga
      });
      alert('Semua field wajib diisi');
      return;
    }

    // Parse harga to number
    const hargaNumber = data.harga ? parseFloat(data.harga.replace(/,/g, '')) : 0;
    if (isNaN(hargaNumber) || hargaNumber <= 0) {
      alert('Harga harus berupa angka positif');
      return;
    }

    if (selectedId) {
      // Edit mode - use UpdatePropertyData
      const submitData: UpdatePropertyData = {
        project_id: parseInt(data.project_id),
        luas_bangunan: data.luas_bangunan.trim(),
        luas_tanah: data.luas_tanah.trim(),
        kelebihan: data.kelebihan.trim(),
        lokasi: data.lokasi.trim(),
        harga: hargaNumber,
        properti__gambars: selectedFiles.length > 0 ? selectedFiles : []
      };
      console.log('📤 Update Data:', submitData);
      console.log('📤 Update Data - Detailed:', {
        project_id: submitData.project_id,
        luas_bangunan: submitData.luas_bangunan,
        luas_tanah: submitData.luas_tanah,
        kelebihan: submitData.kelebihan,
        lokasi: submitData.lokasi,
        harga: submitData.harga,
        properti__gambars: submitData.properti__gambars?.length || 0
      });
      onSubmit(submitData as CreatePropertyData); // Type assertion for compatibility
    } else {
      // Create mode - use CreatePropertyData
      const submitData: CreatePropertyData = {
        project_id: parseInt(data.project_id),
        luas_bangunan: data.luas_bangunan.trim(),
        luas_tanah: data.luas_tanah.trim(),
        kelebihan: data.kelebihan.trim(),
        lokasi: data.lokasi.trim(),
        harga: hargaNumber,
        properti__gambars: selectedFiles.length > 0 ? selectedFiles : []
      };
      console.log('📤 Create Data:', submitData);
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
      properti__gambars: []
    });
    setSelectedFiles([]);
    setNewImagePreviews([]);
    setExistingImages([]);
    onCancel();
  };

  // Show skeleton while fetching property data for edit mode
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

  // Show error if fetch failed
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
      {/* Basic Information */}
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
          <Input id='luas_bangunan' {...register('luas_bangunan')} placeholder='Contoh: 72m²' disabled={isLoading} />
          {errors.luas_bangunan && <p className='text-sm text-red-600'>{errors.luas_bangunan.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='luas_tanah'>Luas Tanah *</Label>
          <Input id='luas_tanah' {...register('luas_tanah')} placeholder='Contoh: 120m²' disabled={isLoading} />
          {errors.luas_tanah && <p className='text-sm text-red-600'>{errors.luas_tanah.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='kelebihan'>Kelebihan *</Label>
          <Input
            id='kelebihan'
            {...register('kelebihan')}
            placeholder='Contoh: Taman, Kolam Renang'
            disabled={isLoading}
          />
          {errors.kelebihan && <p className='text-sm text-red-600'>{errors.kelebihan.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='lokasi'>Lokasi *</Label>
          <Input id='lokasi' {...register('lokasi')} placeholder='Contoh: Jakarta Selatan' disabled={isLoading} />
          {errors.lokasi && <p className='text-sm text-red-600'>{errors.lokasi.message}</p>}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='harga'>Harga *</Label>
          <Input
            id='harga'
            type='text'
            placeholder='0,000,000'
            {...register('harga')}
            onChange={handleCurrencyChange}
            disabled={isLoading}
          />
          {errors.harga && <p className='text-sm text-red-600'>{errors.harga.message}</p>}
        </div>
      </div>

      {/* Image Upload */}
      <div className='space-y-4'>
        <Label>Gambar Properti *</Label>

        {/* Existing Images Preview (Edit Mode) */}
        {selectedId && (
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700'>
              Gambar Existing: {existingImages.length > 0 ? `${existingImages.length} gambar` : 'Tidak ada gambar'}
            </Label>
            {existingImages.length > 0 ? (
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                {existingImages.map((url, index) => (
                  <div key={`existing-image-${index}-${url.substring(0, 10)}`} className='relative'>
                    <img
                      src={url}
                      alt={`Gambar Existing ${index + 1}`}
                      className='h-32 w-full rounded-lg object-cover'
                    />
                    <div className='absolute top-2 right-2 rounded-full bg-green-500 p-1'>
                      <span className='text-xs text-white'>Existing</span>
                    </div>
                    <button
                      type='button'
                      onClick={() => removeExistingImage(index)}
                      className='absolute top-2 left-2 rounded-full bg-red-500 p-1 hover:bg-red-600'
                      disabled={isLoading}>
                      <X className='h-3 w-3 text-white' />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className='rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center'>
                <p className='text-sm text-gray-500'>Tidak ada gambar existing</p>
              </div>
            )}
          </div>
        )}

        {/* New Files Preview */}
        {newImagePreviews.length > 0 && (
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-gray-700'>Gambar Baru:</Label>
            <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
              {newImagePreviews.map((url, index) => (
                <div key={`new-image-${index}-${url.substring(0, 10)}`} className='relative'>
                  <img src={url} alt={`Preview Baru ${index + 1}`} className='h-32 w-full rounded-lg object-cover' />
                  <div className='absolute top-2 right-2 rounded-full bg-blue-500 p-1'>
                    <span className='text-xs text-white'>New</span>
                  </div>
                  <button
                    type='button'
                    onClick={() => removeFile(index)}
                    className='absolute top-2 left-2 rounded-full bg-red-500 p-1 hover:bg-red-600'
                    disabled={isLoading}>
                    <X className='h-3 w-3 text-white' />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className='space-y-4'>
          <div className='flex w-full items-center justify-center'>
            <label className='flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'>
              <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                <Upload className='mb-4 h-8 w-8 text-gray-500' />
                <p className='mb-2 text-sm text-gray-500'>
                  <span className='font-semibold'>Klik untuk upload</span> atau drag and drop
                </p>
                <p className='text-xs text-gray-500'>PNG, JPG, WebP (MAX. 10MB)</p>
              </div>
              <input
                type='file'
                className='hidden'
                multiple
                accept='image/*'
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>

        {!selectedId && selectedFiles.length === 0 && (
          <p className='text-sm text-red-600'>Minimal 1 gambar harus diupload</p>
        )}

        {selectedId && existingImages.length === 0 && selectedFiles.length === 0 && (
          <p className='text-sm text-red-600'>
            Minimal 1 gambar harus ada (existing: {existingImages.length}, baru: {selectedFiles.length})
          </p>
        )}
      </div>

      {/* Action Buttons */}
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
