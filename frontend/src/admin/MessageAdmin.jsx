import { useEffect, useState } from "react";
import api from "../services/api";

export default function MessagesAdmin() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const response = await api.get("/messages");
      setMessages(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const response = await api.get("/messages");

        if (isMounted) {
          setMessages(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const deleteMessage = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this message?"
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/messages/${id}`);

      alert("Message Deleted");

      fetchMessages();
    } catch (error) {
      console.error(error);
      alert("Delete Failed");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return String(date)
      .replace("T", " ")
      .slice(0, 16);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <p className="text-gray-400">
            Loading messages...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <div className="mb-10 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-xl shadow-black/30">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black">
              Contact Messages
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              View and manage messages submitted through the public
              contact form.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-6 py-4">
            <p className="text-sm text-gray-400">
              Total Messages
            </p>

            <p className="mt-1 text-3xl font-black text-blue-400">
              {messages.length}
            </p>
          </div>
        </div>
      </div>

      {/* EMPTY */}
      {messages.length === 0 ? (
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-12 text-center shadow-xl shadow-black/30">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-blue-500/30 bg-blue-500/10 text-4xl">
            📩
          </div>

          <h2 className="text-3xl font-bold">
            No Messages Found
          </h2>

          <p className="mt-3 text-gray-400">
            Contact messages will appear here after users submit the
            contact form.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl shadow-black/30 transition hover:border-blue-500/60 hover:shadow-blue-500/10"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                {/* MESSAGE CONTENT */}
                <div className="flex-1">
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                      Message #{message.id}
                    </span>

                    <span className="rounded-full border border-zinc-700 bg-black px-3 py-1 text-xs font-bold text-gray-400">
                      {formatDate(message.created_at)}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black text-white">
                    {message.subject || "No Subject"}
                  </h2>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                      <p className="text-sm text-gray-500">
                        Name
                      </p>

                      <p className="mt-1 font-bold text-white">
                        {message.name || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-black p-4">
                      <p className="text-sm text-gray-500">
                        Email
                      </p>

                      <a
                        href={`mailto:${message.email}`}
                        className="mt-1 block break-all font-bold text-blue-400 hover:underline"
                      >
                        {message.email || "-"}
                      </a>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-zinc-800 bg-black p-5">
                    <p className="mb-2 text-sm font-semibold text-gray-500">
                      Message
                    </p>

                    <p className="whitespace-pre-line leading-7 text-gray-300">
                      {message.message || "-"}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex flex-wrap gap-3 lg:flex-col">
                  <a
                    href={`mailto:${message.email}?subject=Reply: ${message.subject || "Contact Message"}`}
                    className="rounded-xl border border-blue-500/40 bg-black px-5 py-3 text-center font-bold text-white transition hover:bg-blue-500/10"
                  >
                    Reply
                  </a>

                  <button
                    onClick={() => deleteMessage(message.id)}
                    className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}