export default function Input({
  label,
  name,
  type = "text",
  textarea = false,
  error,
  ...props
}) {
  const kelas = `w-full rounded-lg border ${
    error ? "border-bahaya focus:border-bahaya" : "border-garis focus:border-utama"
  } bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:outline-none`;

  return (
    <label className="flex flex-col gap-1.5 text-sm font-semibold">
      {label}
      {textarea ? (
        <textarea name={name} rows={4} className={kelas} {...props} />
      ) : (
        <input name={name} type={type} className={kelas} {...props} />
      )}
      {error && <span className="text-xs font-normal text-bahaya">{error}</span>}
    </label>
  );
}
