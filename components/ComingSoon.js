import Navbar from "./Navbar";
import Footer from "./Footer";
import Seo from "./Seo";

export default function ComingSoon({ title, description, eyebrow, path, phaseNote }) {
  return (
    <>
      <Seo title={title} description={description} path={path} />
      <Navbar />
      <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-5 pt-24 text-center sm:px-8">
        <span className="font-mono text-xs uppercase tracking-widest text-core-500">
          {eyebrow}
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-md text-ink/60">{description}</p>
        {phaseNote && (
          <p className="mt-6 rounded-full border border-ink/10 bg-white px-4 py-1.5 text-xs font-mono text-ink/50">
            {phaseNote}
          </p>
        )}
      </section>
      <Footer />
    </>
  );
}
