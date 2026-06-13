import TournamentCard from "./TournamentCard";

export default function TournamentSection({
  title,
  tournaments,
}) {
  return (
    <section className="mb-20">
      <div className="mb-8 flex items-center gap-5">
        <h2 className="text-3xl font-bold text-white">
          {title}
        </h2>

        <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-500 to-transparent" />
      </div>

      {tournaments.length > 0 ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
          {tournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10">
            <span className="text-2xl">🎮</span>
          </div>

          <h3 className="text-2xl font-semibold text-white">
            No Tournaments Available
          </h3>

          <p className="mt-2 text-gray-500">
            There are currently no tournaments in this category.
          </p>
        </div>
      )}
    </section>
  );
}