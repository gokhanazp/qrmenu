# Supabase Kurulum Talimatları

## 1. Supabase Anahtarlarını Alma

1. [Supabase Dashboard](https://supabase.com/dashboard)'a gidin
2. Projenizi seçin: **psglgklfwmxfoslwzkrr**
3. Sol menüden **Project Settings** > **API** sekmesine gidin
4. Aşağıdaki anahtarları kopyalayın:
   - **Project URL**: `https://psglgklfwmxfoslwzkrr.supabase.co`
   - **anon public**: Bu anahtarı kopyalayın
   - **service_role**: Bu anahtarı kopyalayın (gizli tutun!)

## 2. .env.local Dosyasını Güncelleme

`.env.local` dosyasını açın ve şu satırları güncelleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=https://psglgklfwmxfoslwzkrr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=buraya-anon-key-yapistirin
SUPABASE_SERVICE_ROLE_KEY=buraya-service-role-key-yapistirin
```

## 3. Veritabanı Migration'larını Çalıştırma

Supabase Dashboard'da **SQL Editor** sekmesine gidin ve aşağıdaki dosyaları sırayla çalıştırın:

### 3.1. Schema Oluşturma
`supabase/migrations/001_initial_schema.sql` dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın ve **RUN** butonuna tıklayın.

### 3.2. RLS Politikaları
`supabase/migrations/002_rls_policies.sql` dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın ve **RUN** butonuna tıklayın.

### 3.3. Trigger ve Fonksiyonlar
`supabase/migrations/003_triggers_and_functions.sql` dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın ve **RUN** butonuna tıklayın.

### 3.4. Storage Kurulumu
`supabase/migrations/004_storage_setup.sql` dosyasının içeriğini kopyalayıp SQL Editor'e yapıştırın ve **RUN** butonuna tıklayın.

## 4. Email Ayarlarını Yapılandırma (Opsiyonel)

Varsayılan olarak Supabase email doğrulaması kapalıdır. Test için açmak isterseniz:

1. **Authentication** > **Settings** sekmesine gidin
2. **Email Auth** bölümünde:
   - "Confirm email" seçeneğini **kapatın** (test için)
   - Veya kendi SMTP ayarlarınızı yapılandırın

## 5. Test Admin Kullanıcısı Oluşturma

İlk admin kullanıcısını oluşturmak için:

1. Normal kayıt işlemini yapın (http://localhost:3001/auth/register)
2. Supabase Dashboard'da **SQL Editor**'e gidin
3. Şu SQL'i çalıştırın (email'i kendi email'iniz ile değiştirin):

```sql
-- Kullanıcının ID'sini bulun
SELECT id, email FROM auth.users WHERE email = 'sizin@email.com';

-- Admin yetkisi verin (yukarıdaki sorgudan aldığınız ID'yi kullanın)
INSERT INTO admin_users (user_id)
VALUES ('buraya-user-id-yapistirin');
```

## 6. Doğrulama

Kurulumun başarılı olduğunu doğrulamak için:

1. Development server'ı yeniden başlatın:
   ```bash
   npm run dev
   ```

2. http://localhost:3001 adresine gidin

3. Kayıt olun ve giriş yapın

4. Başarılı giriş sonrası `/panel` sayfasına yönlendirilmelisiniz

## Sorun Giderme

### "Invalid API key" hatası
- `.env.local` dosyasındaki anahtarları kontrol edin
- Development server'ı yeniden başlatın

### "relation does not exist" hatası
- Migration dosyalarının hepsini sırayla çalıştırdığınızdan emin olun
- SQL Editor'de hata mesajlarını kontrol edin

### Kayıt/Giriş çalışmıyor
- Browser console'da hata mesajlarını kontrol edin
- Network sekmesinde Supabase isteklerini inceleyin
- `.env.local` dosyasının doğru konumda olduğundan emin olun

### Email doğrulama gerekiyor
- Authentication > Settings'den "Confirm email" seçeneğini kapatın
- Veya test email'lerinizi Supabase'de onaylayın

## Yardım

Sorun yaşarsanız:
1. Browser console'u kontrol edin (F12)
2. Terminal'deki hata mesajlarını okuyun
3. Supabase Dashboard'da Logs sekmesini kontrol edin