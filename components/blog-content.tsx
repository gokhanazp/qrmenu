import Link from "next/link"
import type { Block } from "@/lib/blog/posts"

/**
 * İçerik metinlerinde iki satır içi işaret destekliyoruz:
 *   [bağlantı metni](/hedef)  ve  **kalın**
 * dangerouslySetInnerHTML kullanmamak için elle ayrıştırıyoruz.
 */
const INLINE_PATTERN = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g

export function Inline({ text }: { text: string }) {
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let key = 0

  // exec döngüsü lastIndex'i ilerlettiği için regex'i her çağrıda sıfırlıyoruz
  INLINE_PATTERN.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const [, linkText, href, boldText] = match

    if (linkText !== undefined && href !== undefined) {
      nodes.push(
        href.startsWith("/") ? (
          <Link
            key={key++}
            href={href}
            className="text-violet-400 hover:text-violet-300 underline decoration-violet-500/40 hover:decoration-violet-400 underline-offset-2 transition-colors"
          >
            {linkText}
          </Link>
        ) : (
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-400 hover:text-violet-300 underline underline-offset-2"
          >
            {linkText}
          </a>
        )
      )
    } else if (boldText !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-white">
          {boldText}
        </strong>
      )
    }

    lastIndex = INLINE_PATTERN.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return <>{nodes}</>
}

export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-gray-300 leading-relaxed mb-5">
          <Inline text={block.text} />
        </p>
      )

    case "list":
      return (
        <ul className="space-y-3 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-300 leading-relaxed">
              <span className="material-symbols-outlined text-emerald-400 text-xl flex-shrink-0 mt-0.5">
                check_circle
              </span>
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      )

    case "steps":
      return (
        <ol className="space-y-4 mb-6">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-4 text-gray-300 leading-relaxed">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-sm font-semibold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ol>
      )

    case "callout":
      return (
        <aside className="mb-6 rounded-2xl border border-violet-500/30 bg-violet-500/[0.07] p-5">
          <p className="flex items-center gap-2 font-semibold text-violet-300 mb-2">
            <span className="material-symbols-outlined text-lg">lightbulb</span>
            {block.title}
          </p>
          <p className="text-gray-300 leading-relaxed">
            <Inline text={block.text} />
          </p>
        </aside>
      )

    case "table":
      return (
        <div className="mb-6 -mx-4 px-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm border-collapse">
            <thead>
              <tr>
                {block.head.map((cell, i) => (
                  <th
                    key={i}
                    scope="col"
                    className="text-left font-semibold text-white bg-white/[0.06] border border-white/10 px-4 py-3"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.03] transition-colors">
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="text-gray-300 border border-white/10 px-4 py-3 align-top leading-relaxed"
                    >
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}
