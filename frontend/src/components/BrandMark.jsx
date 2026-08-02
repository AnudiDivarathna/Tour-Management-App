export default function BrandMark({ size = 'md', showWordmark = true }) {
  return (
    <span className={`brand-mark brand-mark-${size}`}>
      <img src="/savi-logo.png" alt="" className="brand-mark-logo" />
      {showWordmark && (
        <span className="brand-mark-text">
          <strong>Savi Travels &amp; Tours</strong>
        </span>
      )}
    </span>
  );
}
