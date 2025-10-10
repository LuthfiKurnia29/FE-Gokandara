'use client';

import { memo, useState } from 'react';

import { PageTitle } from '@/components/page-title';
import { PaginateTable } from '@/components/paginate-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useDelete } from '@/hooks/use-delete';
import { createProjek, getAllProjek, updateProjek, uploadProjekGambars } from '@/services/projek';
import { getProjek } from '@/services/projek';
import { CreateProjekData, ProjekData } from '@/types/projek';
import { useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createColumnHelper } from '@tanstack/react-table';

import TambahProjekWizard from './tambah-projek-wizard';
import { MoreHorizontal, Pencil, Plus, Trash } from 'lucide-react';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<ProjekData>();

const columns = [
  columnHelper.accessor('id', {
    header: 'ID',
    cell: ({ getValue }) => <span className='font-mono text-sm'>#{getValue()}</span>,
    meta: { style: { width: '80px' } }
  }),
  columnHelper.accessor('name', {
    header: 'Nama',
    cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
    meta: { style: { minWidth: '180px' } }
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ActionCell row={row} />,
    meta: { style: { width: '80px' } }
  })
];

const ActionCell = memo(function ActionCell({ row }: { row: any }) {
  const queryClient = useQueryClient();
  const { delete: handleDelete, DeleteConfirmDialog } = useDelete({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/projek'] });
    }
  });

  const [openForm, setOpenForm] = useState(false);
  const [selectedData, setSelectedData] = useState<ProjekData | null>(null);
  const [initialWizardData, setInitialWizardData] = useState<any>(null);

  const handleEdit = (data: ProjekData) => {
    setSelectedData(data);
    setInitialWizardData({ projectName: data.name });
    setOpenForm(true);
    getProjek(data.id)
      .then((detail: any) => {
        const tipeArr = Array.isArray(detail?.tipe) ? detail.tipe : [];
        const facilitiesArr = Array.isArray(detail?.fasilitas) ? detail.fasilitas : [];
        const gambarUrls = Array.isArray(detail?.gambar)
          ? detail.gambar
              .map((g: any) => (typeof g?.gambar === 'string' ? g.gambar : null))
              .filter((url: string | null): url is string => !!url)
          : [];
        setInitialWizardData({
          projectName: detail?.name ?? data.name ?? '',
          address: detail?.alamat ?? '',
          jumlahKavling: detail?.jumlah_kavling != null ? String(detail.jumlah_kavling) : '',
          gambarUrls,
          types: tipeArr.map((t: any) => ({
            name: t?.name ?? '',
            luasTanah: t?.luas_tanah != null ? String(t.luas_tanah) : '',
            luasBangunan: t?.luas_bangunan != null ? String(t.luas_bangunan) : '',
            jumlahUnit: t?.jumlah_unit != null ? String(t.jumlah_unit) : '',
            unitTerjual: t?.unit_terjual != null ? String(t.unit_terjual) : ''
          })),
          prices: tipeArr.map((t: any) => ({
            tipe: t?.name ?? '',
            items: Array.isArray(t?.jenis_pembayaran)
              ? t.jenis_pembayaran.map((jp: any) => ({
                  jenisId: String(jp?.id ?? ''),
                  harga: jp?.harga != null ? String(jp.harga) : ''
                }))
              : []
          })),
          facilities: facilitiesArr.map((f: any) => ({
            name: f?.name ?? '',
            luas: f?.luas != null ? String(f.luas) : ''
          }))
        });
      })
      .catch(() => {});
  };

  const handleDeleteProjek = async (data: ProjekData) => {
    handleDelete(`/projek/${data.id}`, 'delete');
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedData(null);
  };

  const handleWizardSubmit = async (data: {
    projectName: string;
    address?: string;
    jumlahKavling?: string;
    types?: any[];
    prices?: any[];
    facilities?: any[];
    gambars?: File[];
    kamarTidur?: number;
    kamarMandi?: number;
    wifi?: boolean;
  }) => {
    if (!selectedData) return;
    try {
      const tipePayload = (data.types ?? []).map((t, idx) => {
        const p = (data.prices ?? [])[idx] ?? { items: [] };
        return {
          name: t.name ?? '',
          luas_tanah: Number(t.luasTanah) || 0,
          luas_bangunan: Number(t.luasBangunan) || 0,
          jumlah_unit: Number(t.jumlahUnit) || 0,
          jenis_pembayaran: ((p.items ?? []) as { jenisId: string; harga: string }[]).map((it) => ({
            id: Number(it.jenisId) || 0,
            harga: Number(it.harga) || 0
          }))
        };
      });

      const fasilitasPayload = (data.facilities ?? []).map((f) => ({
        name: f.name ?? '',
        luas: Number(f.luas) || 0
      }));

      await updateProjek(selectedData.id, {
        name: data.projectName,
        alamat: data.address,
        jumlah_kavling: data.jumlahKavling ? Number(data.jumlahKavling) : undefined,
        tipe: tipePayload,
        fasilitas: fasilitasPayload,
        kamar_tidur: data.kamarTidur ? Number(data.kamarTidur) : 0,
        kamar_mandi: data.kamarMandi ? Number(data.kamarMandi) : 0,
        wifi: data.wifi ? true : false
      });

      if (data.gambars && data.gambars.length > 0) {
        await uploadProjekGambars(selectedData.id, data.gambars);
      }

      handleCloseForm();
      queryClient.invalidateQueries({ queryKey: ['/projek'] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi error!');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' size='sm'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => handleEdit(row.original)}>
            <Pencil className='mr-2 h-4 w-4' />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDeleteProjek(row.original)} variant='destructive'>
            <Trash className='mr-2 h-4 w-4' />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='w-[98vw] p-0 sm:max-w-[60rem]'>
          <TambahProjekWizard
            onCancel={handleCloseForm}
            onSubmit={handleWizardSubmit}
            isLoading={false}
            title='Edit Projek'
            initialData={initialWizardData}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog />
    </>
  );
});

const ProjekPage = memo(function ProjekPage() {
  const queryClient = useQueryClient();
  const [openForm, setOpenForm] = useState(false);

  const { data, isLoading } = useQuery(['/projek'], getAllProjek);
  const createMutation = useMutation(createProjek, {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/projek'] })
  });

  const handleCreate = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);

  const handleWizardSubmit = async (data: {
    projectName: string;
    address?: string;
    jumlahKavling?: string;
    types?: any[];
    prices?: any[];
    facilities?: any[];
    gambars?: File[];
    kamarTidur?: number;
    kamarMandi?: number;
    wifi?: boolean;
  }) => {
    try {
      const tipePayload = (data.types ?? []).map((t, idx) => {
        const p = (data.prices ?? [])[idx] ?? { items: [] };
        return {
          name: t.name ?? '',
          luas_tanah: Number(t.luasTanah) || 0,
          luas_bangunan: Number(t.luasBangunan) || 0,
          jumlah_unit: Number(t.jumlahUnit) || 0,
          jenis_pembayaran: ((p.items ?? []) as { jenisId: string; harga: string }[]).map((it) => ({
            id: Number(it.jenisId) || 0,
            harga: Number(it.harga) || 0
          }))
        };
      });

      const fasilitasPayload = (data.facilities ?? []).map((f) => ({
        name: f.name ?? '',
        luas: Number(f.luas) || 0
      }));

      await createMutation.mutateAsync({
        name: data.projectName,
        alamat: data.address,
        jumlah_kavling: data.jumlahKavling ? Number(data.jumlahKavling) : undefined,
        tipe: tipePayload,
        fasilitas: fasilitasPayload,
        gambars: data.gambars && data.gambars.length > 0 ? data.gambars : undefined,
        kamar_tidur: data.kamarTidur ? Number(data.kamarTidur) : 0,
        kamar_mandi: data.kamarMandi ? Number(data.kamarMandi) : 0,
        wifi: data.wifi ? true : false
      });

      handleCloseForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Terjadi error!');
    }
  };

  return (
    <section className='p-4'>
      <PageTitle title='Master Projek' />
      <PaginateTable
        columns={columns}
        id='projek'
        perPage={10}
        queryKey={['/projek']}
        url='/projek'
        Plugin={() => (
          <Button onClick={handleCreate} disabled={createMutation.isPending} className='text-white'>
            <Plus />
            Tambah Projek
          </Button>
        )}
      />
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className='w-[98vw] p-0 sm:max-w-[60rem]'>
          <TambahProjekWizard
            onCancel={handleCloseForm}
            onSubmit={handleWizardSubmit}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
});

export default ProjekPage;
