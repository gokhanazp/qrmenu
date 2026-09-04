/**
 * Material Symbols ikon fontunu YALNIZCA /panel ve /admin içinde yükler.
 *
 * Public sayfalarda bu font tamamen kaldırıldı (bkz. components/icon.tsx) —
 * fonts.googleapis.com'dan gelen render-blocking istek ve ~150 KB font,
 * ölçülen 2,77 sn'lik FCP'nin ana sebebiydi.
 *
 * Panel ve admin arayüzlerinde 300'ün üzerinde ikon kullanımı var; ikisi de
 * oturum arkasında ve robots.txt'te `Disallow` olduğu için Core Web Vitals /
 * indeksleme açısından bir etkisi yok. Fontu orada bırakmak, o ekranları
 * gereksiz bir refactor riskine sokmamayı sağlıyor.
 */
export function MaterialSymbolsStylesheet() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
    />
  )
}
