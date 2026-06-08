import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-black text-white flex items-center justify-center px-6">
      <div className="text-center max-w-xl">
        <p className="text-blue-500 font-semibold tracking-[0.4em] uppercase mb-4">
          404
        </p>

        <h1 className="text-4xl md:text-6xl font-black mb-4">
          Page not found
        </h1>

        <p className="text-gray-400 mb-8">
          The page you are looking for does not exist or has moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}