export default function PlayerSection({
  title,
  prefix,
  required = true,
}) {
  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const fileClass =
    "w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-gray-300 outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-bold file:text-white hover:file:bg-blue-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const labelClass =
    "mb-2 block text-sm font-semibold text-gray-300";

  return (
    <div className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition hover:border-blue-500/40">
      {/* HEADER */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-2xl">
          👤
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-400">
            Player Information
          </p>

          <h3 className="mt-1 text-2xl font-black text-white">
            {title}
          </h3>
        </div>
      </div>

      {/* FORM GRID */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className={labelClass}>
            Real Name
          </label>

          <input
            type="text"
            name={`${prefix}_real_name`}
            placeholder="Real Name"
            required={required}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            In-Game Name
          </label>

          <input
            type="text"
            name={`${prefix}_ign`}
            placeholder="IGN"
            required={required}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            MLBB ID
          </label>

          <input
            type="text"
            name={`${prefix}_mlbb_id`}
            placeholder="MLBB ID"
            required={required}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            Server ID
          </label>

          <input
            type="text"
            name={`${prefix}_server_id`}
            placeholder="Server ID"
            required={required}
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>
            Player Photo
          </label>

          <input
            type="file"
            name={`${prefix}_photo`}
            required={required}
            className={fileClass}
          />
        </div>
      </div>
    </div>
  );
}