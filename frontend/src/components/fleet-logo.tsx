export function FleetLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12.5C2 8.358 5.358 5 9.5 5s7.5 3.358 7.5 7.5S13.642 20 9.5 20a7.41 7.41 0 0 1-4.962-1.88" />
      <path d="M12.5 5H18l4 4-2 5h-4.5" />
      <path d="M14 14h5" />
      <path d="m10 9 2-2" />
    </svg>
  );
}
