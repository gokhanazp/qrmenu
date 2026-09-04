/**
 * Material Symbols ikon fontunun yerine geçen inline SVG ikon seti.
 *
 * Neden: Material Symbols fontu `fonts.googleapis.com` üzerinden render-blocking
 * bir stylesheet + ~150 KB font dosyası olarak yükleniyordu ve FCP'yi ~2,8 sn'ye
 * çıkarıyordu. Inline SVG'de ek ağ isteği yok.
 *
 * Kullanım eski span'la birebir aynı görünsün diye SVG `1em` boyutunda çizilir;
 * yani `text-sm` / `text-3xl` gibi mevcut font-size sınıfları ikon boyutunu
 * eskisi gibi kontrol etmeye devam eder, renk de `currentColor`'dan gelir.
 *
 * İsimler Material Symbols adlarıyla aynı tutuldu ki geçiş sırasında
 * çağrı yerlerinde isim değiştirmek gerekmesin.
 */
import {
  Activity,
  Beef,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Bug,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  CreditCard,
  Eye,
  FilePenLine,
  FileText,
  Flame,
  Gauge,
  GripHorizontal,
  Heart,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Info,
  Languages,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  Lightbulb,
  Link2,
  List,
  LogIn,
  Mail,
  MapPin,
  Menu as MenuIcon,
  MessageCircle,
  MessageSquareText,
  MessagesSquare,
  MonitorPlay,
  Palette,
  Pencil,
  Phone,
  PhoneCall,
  Pizza,
  PlayCircle,
  Plus,
  Printer,
  QrCode,
  Quote,
  Rocket,
  Salad,
  Sandwich,
  ScanLine,
  Search,
  SearchX,
  Send,
  Share2,
  Smartphone,
  Soup,
  Sparkles,
  Star,
  Store,
  ThumbsUp,
  TrendingUp,
  UserPlus,
  Utensils,
  UtensilsCrossed,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  add: Plus,
  analytics: BarChart3,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  article: FileText,
  auto_awesome: Sparkles,
  bug_report: Bug,
  call: Phone,
  category: LayoutGrid,
  chat: MessageCircle,
  check_circle: CheckCircle2,
  chevron_right: ChevronRight,
  close: X,
  compare_arrows: ArrowLeftRight,
  contact_phone: PhoneCall,
  credit_card_off: CreditCard,
  dashboard: LayoutDashboard,
  description: FileText,
  drag_handle: GripHorizontal,
  edit: Pencil,
  edit_note: FilePenLine,
  favorite: Heart,
  format_quote: Quote,
  forum: MessagesSquare,
  help: HelpCircle,
  help_center: LifeBuoy,
  help_outline: HelpCircle,
  home: Home,
  image: ImageIcon,
  info: Info,
  kebab_dining: Sandwich,
  language: Languages,
  lightbulb: Lightbulb,
  link: Link2,
  list: List,
  local_cafe: Coffee,
  local_fire_department: Flame,
  local_pizza: Pizza,
  lunch_dining: Beef,
  location_on: MapPin,
  lock_clock: Clock,
  login: LogIn,
  mail: Mail,
  menu: MenuIcon,
  menu_book: BookOpen,
  monitoring: Activity,
  palette: Palette,
  payments: Wallet,
  person_add: UserPlus,
  photo_camera: Camera,
  play_circle: PlayCircle,
  print: Printer,
  qr_code_2: QrCode,
  qr_code_scanner: ScanLine,
  ramen_dining: Soup,
  rate_review: MessageSquareText,
  restaurant: Utensils,
  restaurant_menu: UtensilsCrossed,
  rocket_launch: Rocket,
  search: Search,
  search_off: SearchX,
  send: Send,
  share: Share2,
  smart_display: MonitorPlay,
  smartphone: Smartphone,
  speed: Gauge,
  star: Star,
  store: Store,
  thumb_up: ThumbsUp,
  translate: Languages,
  trending_up: TrendingUp,
  verified: BadgeCheck,
  visibility: Eye,
  eco: Salad,
}

export type IconName = keyof typeof ICONS

export function Icon({
  name,
  className = "",
  style,
  fill = false,
  strokeWidth = 2,
}: {
  name: string
  className?: string
  /** Eski span'lardaki `style={{ color }}` / `style={{ fontSize }}` kullanımı için */
  style?: React.CSSProperties
  /** Yıldız/kalp gibi dolu görünmesi gereken ikonlar için */
  fill?: boolean
  strokeWidth?: number
}) {
  const Cmp = ICONS[name]
  if (!Cmp) {
    // Haritada olmayan bir isim sessizce kaybolursa ikon ekranda hiç
    // görünmez ve bunu fark etmek zor. `edit_note` ve `translate` bu şekilde
    // gözden kaçmıştı (ikisi de veriden `{f.icon}` olarak geliyor, kod
    // taramasında görünmüyor). Geliştirmede yüksek sesle uyar.
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Icon] "${name}" components/icon.tsx içindeki ICONS haritasında yok — ikon render edilmedi.`,
      )
    }
    return null
  }
  return (
    <Cmp
      aria-hidden="true"
      size="1em"
      strokeWidth={strokeWidth}
      style={style}
      className={`inline-block shrink-0 align-middle ${className}`}
      {...(fill ? { fill: "currentColor" } : {})}
    />
  )
}
