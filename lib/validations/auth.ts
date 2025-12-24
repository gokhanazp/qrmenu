import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Geçerli bir email adresi giriniz'),
    password: z
      .string()
      .min(6, 'Şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string(),
    restaurantName: z
      .string()
      .min(3, 'Restoran adı en az 3 karakter olmalıdır')
      .max(100, 'Restoran adı en fazla 100 karakter olabilir'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>