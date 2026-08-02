export default function BrandMark({ size = 'md', showWordmark = false }) {
  return (
    <span className={`brand-mark brand-mark-${size}`}>
      <img src="/savi-logo.png" alt="Savi Travel & Tours" className="brand-mark-logo" />
      {showWordmark && (
        <span className="brand-mark-text">
          <strong>Savi Travels &amp; Tours</strong>
        </span>
      )}
    </span>
  );
}
