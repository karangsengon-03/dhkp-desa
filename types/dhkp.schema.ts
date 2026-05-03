import { z } from 'zod';

export const recordFormSchema = z.object({
  nomor: z.string().optional(),
  nop: z
    .string()
    .trim()
    .min(1, 'NOP wajib diisi'),
  nomorInduk: z.string().trim().optional().default(''),
  namaWajibPajak: z
    .string()
    .trim()
    .min(1, 'Nama wajib pajak wajib diisi'),
  alamatObjekPajak: z.string().trim().optional().default(''),
  pajakTerhutang: z
    .string()
    .refine(
      (v) => v !== '' && !isNaN(Number(v)) && Number(v) >= 0,
      'Pajak terhutang harus berupa angka positif',
    ),
  perubahanPajak: z
    .string()
    .refine(
      (v) => v === '' || (!isNaN(Number(v))),
      'Perubahan pajak harus berupa angka',
    )
    .optional()
    .default('0'),
  statusLunas: z.boolean().default(false),
  tanggalBayar: z.string().optional().default(''),
  luasTanah: z
    .string()
    .refine(
      (v) => v === '' || (!isNaN(Number(v)) && Number(v) >= 0),
      'Luas tanah harus berupa angka positif',
    )
    .optional()
    .default(''),
  luasBangunan: z
    .string()
    .refine(
      (v) => v === '' || (!isNaN(Number(v)) && Number(v) >= 0),
      'Luas bangunan harus berupa angka positif',
    )
    .optional()
    .default(''),
  dikelolaOleh: z.string().trim().optional().default(''),
});

export type RecordFormData = z.infer<typeof recordFormSchema>;
