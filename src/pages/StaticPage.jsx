function StaticPage({ title, body }) {
  const renderContent = (text) => {
    const lines = text.split('\n')
    const elements = []
    let i = 0

    while (i < lines.length) {
      const line = lines[i].trim()

      // Skip empty lines
      if (!line) {
        i++
        continue
      }

      // Check if it's a section heading (all caps or looks like a heading)
      const isSectionHeading =
        line === line.toUpperCase() &&
        line.length > 3 &&
        !line.includes('•') &&
        line.split(' ').length <= 6

      if (isSectionHeading) {
        elements.push(
          <h2 key={`section-${i}`} className="mb-4 mt-6 text-left text-xl font-bold text-brand-900 dark:text-slate-100">
            {line}
          </h2>
        )
        i++
        continue
      }

      // Check if it's a subsection heading (followed by content or next heading)
      const isSubHeading =
        !line.includes('•') &&
        !line.includes(':') &&
        i + 1 < lines.length &&
        lines[i + 1].trim() &&
        line.length < 60 &&
        line.split(' ').length <= 5 &&
        line.match(/^[A-Z]/)

      // More sophisticated check for subsection
      if (
        isSubHeading &&
        !isSectionHeading &&
        i > 0 &&
        lines[i - 1].trim() === ''
      ) {
        elements.push(
          <h3 key={`subsection-${i}`} className="mb-3 mt-4 text-left text-lg font-semibold text-slate-900 dark:text-slate-200">
            {line}
          </h3>
        )
        i++
        continue
      }

      // Handle bullet points
      if (line.startsWith('•')) {
        const bulletText = line.substring(1).trim()
        elements.push(
          <div key={`bullet-${i}`} className="mb-2 flex gap-3 text-left text-slate-700 dark:text-slate-300">
            <span className="mt-1 text-brand-600 dark:text-brand-400">•</span>
            <p className="leading-6">{bulletText}</p>
          </div>
        )
        i++
        continue
      }

      // Regular paragraphs
      elements.push(
        <p key={`para-${i}`} className="mb-4 text-left leading-7 text-slate-700 dark:text-slate-300">
          {line}
        </p>
      )
      i++
    }

    return elements
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 dark:border-slate-700 dark:bg-slate-800">
      <h1 className="mb-8 text-left text-3xl font-black text-slate-900 dark:text-slate-100 md:text-4xl">{title}</h1>
      <div className="prose prose-sm max-w-none text-left dark:prose-invert">
        {renderContent(body)}
      </div>
    </section>
  )
}

export default StaticPage
