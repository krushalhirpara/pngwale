function ContactPage() {
  return (
    <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-soft md:p-8 dark:border-slate-700 dark:bg-slate-800">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <div className="rounded-2xl bg-brand-900 p-6 text-white dark:bg-slate-950">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">Contact Us</p>
          <h1 className="mb-4 text-2xl font-black md:text-3xl">Reach PNGWALE</h1>
          <p className="text-sm leading-7 text-white/80">
            For copyright, licensing, custom design requests, or partnership discussions, use
            the form and share complete details. We strive to respond to all inquiries within 24-48 hours.
          </p>
          <div className="mt-6 space-y-4 text-sm text-white/85">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <strong>Email:</strong> support@pngwale.com
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Response Type: Copyright claims, licensing questions, and business requests.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              Best Practice: Include image title, page link, and your message context clearly.
            </div>
          </div>
        </div>

        <form className="grid gap-4 lg:min-w-0">
          <input
            className="rounded-xl border border-brand-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Your Name"
          />
          <input
            className="rounded-xl border border-brand-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Your Email"
            type="email"
          />
          <textarea
            className="min-h-40 rounded-xl border border-brand-100 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            placeholder="Your Message"
          />
          <button
            type="button"
            className="w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white lg:w-auto lg:justify-self-start"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  )
}

export default ContactPage
