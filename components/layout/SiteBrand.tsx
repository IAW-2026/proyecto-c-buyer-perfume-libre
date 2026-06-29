import Link from "next/link";

export default function SiteBrand() {
  return (
    <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
      <span
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "22px",
          color: "#1a1a1a",
          letterSpacing: "-0.01em",
          fontWeight: 500,
        }}
      >
        Perfume{" "}
        <em
          style={{
            color: "#c2a679",
            fontStyle: "italic",
          }}
        >
          Libre
        </em>
      </span>
    </Link>
  );
}
