'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ImageUploadProps {
  bucket: string
  path: string
  currentImageUrl?: string
  onUploadComplete: (url: string) => void
  onUploadStart?: () => void
  label?: string
  id?: string
}

export function ImageUpload({
  bucket,
  path,
  currentImageUrl,
  onUploadComplete,
  onUploadStart,
  label = 'Fotoğraf',
  id
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)
  const uploadId = id || `image-upload-${Math.random().toString(36).substr(2, 9)}`

  // Initialize Supabase client only on client-side
  useEffect(() => {
    setSupabase(createClient())
  }, [])

  // Update preview when currentImageUrl changes
  useEffect(() => {
    setPreview(currentImageUrl || null)
  }, [currentImageUrl])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if supabase client is ready
    if (!supabase) {
      alert('Yükleme servisi hazırlanıyor, lütfen tekrar deneyin')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Dosya boyutu 5MB\'dan küçük olmalıdır')
      return
    }

    setUploading(true)
    onUploadStart?.()

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${path}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      // Call callback with new URL
      onUploadComplete(publicUrl)
      
      // Show success message
      alert('Fotoğraf başarıyla yüklendi! Şimdi "Güncelle" butonuna basın.')
    } catch (error: any) {
      console.error('Upload error:', error)
      alert('Yükleme hatası: ' + (error.message || 'Bilinmeyen hata'))
      setPreview(currentImageUrl || null)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    if (!confirm('Fotoğrafı kaldırmak istediğinizden emin misiniz?')) {
      return
    }

    setPreview(null)
    onUploadComplete('')
  }

  function handleUrlSubmit() {
    if (!urlInput.trim()) {
      alert('Lütfen geçerli bir URL girin')
      return
    }

    // Basic URL validation
    try {
      new URL(urlInput)
    } catch {
      alert('Lütfen geçerli bir URL girin (örn: https://example.com/image.jpg)')
      return
    }

    setPreview(urlInput)
    onUploadComplete(urlInput)
    setUrlInput('')
    setShowUrlInput(false)
    alert('URL başarıyla eklendi! Şimdi "Güncelle" butonuna basın.')
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {preview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={preview}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id={uploadId}
          />
          <label htmlFor={uploadId}>
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById(uploadId)?.click()}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">upload_file</span>
              {uploading ? 'Yükleniyor...' : preview ? 'Dosya Değiştir' : 'Dosya Seç'}
            </Button>
          </label>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowUrlInput(!showUrlInput)}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">link</span>
            URL ile Ekle
          </Button>

          <p className="text-sm text-gray-500">
            JPG, PNG veya WebP (Max 5MB)
          </p>
        </div>

        {showUrlInput && (
          <div className="flex gap-2 p-4 bg-gray-50 rounded-lg border">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleUrlSubmit()
                }
              }}
            />
            <Button
              type="button"
              onClick={handleUrlSubmit}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Ekle
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUrlInput(false)
                setUrlInput('')
              }}
            >
              İptal
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}