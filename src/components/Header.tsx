export default function Header() {
  return (
    <header className="top">
      <div className="brand">
        <svg className="aperture-icon" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
          <circle cx="12" cy="12" r="10.4" fill="none" stroke="#ffb454" strokeWidth="1.6" />
          <path d="M12 1.6 L18.4 12 M21.2 6.8 L10.6 13.6 M21.2 17.2 L9.4 14.6 M12 22.4 L6.8 11.4 M2.8 17.2 L14 15 M2.8 6.8 L15 10"
                stroke="#ffb454" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </svg>
        <div>
          <h1>Camera Simulator</h1>
          <p className="tagline">See how focal length, ƒ-stop &amp; ISO shape the photo — before you press the shutter.</p>
        </div>
      </div>
      <div className="sensor-badge">FULL-FRAME 36×24 mm</div>
    </header>
  );
}
