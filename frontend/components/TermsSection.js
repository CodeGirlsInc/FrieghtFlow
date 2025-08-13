export default function TermsSection({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-3">{title}</h2>
      <div className="text-gray-700 leading-relaxed">{children}</div>
      <a href="/">Back to home</a>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque deserunt
        non odio possimus repudiandae ipsam sit reprehenderit nam recusandae
        nostrum ut reiciendis, id similique libero eaque, harum voluptatum
        deleniti vitae.
      </p>
    </section>
  );
}
