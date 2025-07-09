'use client';

import { memo, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KonsumenData } from '@/types/konsumen';

interface KonsumenFormProps {
  konsumen?: KonsumenData | null;
  onSubmit: (data: Omit<KonsumenData, 'id' | 'no'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const KonsumenForm = memo(function KonsumenForm({
  konsumen,
  onSubmit,
  onCancel,
  isLoading = false
}: KonsumenFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: ''
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Reset form when konsumen data changes
  useEffect(() => {
    if (konsumen) {
      setFormData({
        name: konsumen.name,
        description: konsumen.description,
        phone: konsumen.phone,
        email: konsumen.email,
        address: konsumen.address
      });
    } else {
      setFormData({
        name: '',
        description: '',
        phone: '',
        email: '',
        address: ''
      });
    }
    setErrors({});
  }, [konsumen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string[]> = {};
    const requiredFields = ['name', 'phone', 'email', 'address'];

    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData].trim()) {
        newErrors[field] = [`The ${field} field is required.`];
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = ['Please enter a valid email address.'];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      phone: '',
      email: '',
      address: ''
    });
    setErrors({});
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Nama *</Label>
        <Input
          id='name'
          type='text'
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder='Masukkan nama konsumen'
          disabled={isLoading}
        />
        {errors.name && <p className='text-sm text-red-600'>{errors.name[0]}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>Deskripsi</Label>
        <Input
          id='description'
          type='text'
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder='Masukkan deskripsi (opsional)'
          disabled={isLoading}
        />
        {errors.description && <p className='text-sm text-red-600'>{errors.description[0]}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='phone'>Nomor Telepon *</Label>
        <Input
          id='phone'
          type='tel'
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder='Masukkan nomor telepon'
          disabled={isLoading}
        />
        {errors.phone && <p className='text-sm text-red-600'>{errors.phone[0]}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='email'>Email *</Label>
        <Input
          id='email'
          type='email'
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder='Masukkan alamat email'
          disabled={isLoading}
        />
        {errors.email && <p className='text-sm text-red-600'>{errors.email[0]}</p>}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='address'>Alamat *</Label>
        <Input
          id='address'
          type='text'
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder='Masukkan alamat lengkap'
          disabled={isLoading}
        />
        {errors.address && <p className='text-sm text-red-600'>{errors.address[0]}</p>}
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={handleCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : konsumen ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
});
