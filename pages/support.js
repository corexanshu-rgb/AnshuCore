import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Seo from "../components/Seo";

const FAQS = [
  {
    q: "How do I reset my School Portal password?",
    a: "Use the \"Forgot Password\" link on the School Portal login page. You'll receive a reset link at the email on file with your school.",
  },
  {
    q: "Which platforms are the apps available on?",
    a: "Each app's detail page lists its supported platforms and download links under \"Get it on\".",
  },
  {
    q: "How do I report a bug?",
    a: "Use the \"Report an issue\" link on any app's detail page, or the form below.",
  },
];

export default function Support() {
  return (
    <>
      <Seo
        title="Support"
        description="Help center and FAQs for Anshu Core apps and the School Portal."
        path="/support"
      />
      <Navbar />
      <section className="mx-auto max-w-3xl px-5 pb-24 pt-36 sm:px-8 sm:pt-44">
        <p className="font-mono text-xs uppercase tracking-widest text-core-500">Support</p>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Help center
        </h1>

        <div className="mt-12 space-y-6">
          {FAQS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-ink/10 bg-white p-5"
            >
              <summary className="cursor-pointer list-none font-display font-semibold text-ink">
                {item.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">{item.a}</p>
            </details>
          ))}
        </div>

        <div id="report" className="mt-16 rounded-2xl border border-ink/10 bg-white p-8">
          <h2 className="font-display text-xl font-semibold text-ink">Report an issue</h2>
          <p className="mt-2 text-sm text-ink/60">
            Still stuck? <a href="/contact" className="text-core-500 hover:text-core-600">Contact us</a> with the app name and what went wrong.
          </p>
        </div>
      </section>
      <Footer />
    </>
  );
}
