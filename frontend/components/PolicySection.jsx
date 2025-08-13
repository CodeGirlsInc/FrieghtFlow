export default function PolicySection({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}
