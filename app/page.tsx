"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [account, setAccount] = useState("@aaa");
  const [selectedAccount, setSelectedAccount] =
    useState("ALL");

  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const accounts = [
    "@aaa",
    "@bbb",
    "@ccc",
    "@ddd",
    "@eee",
    "@fff",
    "@ggg",
  ];

  async function fetchPosts() {
    let query = supabase
      .from("posts")
      .select("*")
      .order("custom_date", { ascending: false });

    if (selectedAccount !== "ALL") {
      query = query.eq("account", selectedAccount);
    }

    const { data } = await query;

    if (data) {
      setPosts(data);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, [selectedAccount]);

  async function addPost() {
    if (!file || !date) return;

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("posts")
      .upload(fileName, file);

    if (error) {
      alert("업로드 실패");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("posts")
      .getPublicUrl(fileName);

    await supabase.from("posts").insert([
      {
        account,
        media_url: publicUrl,
        custom_date: date,
      },
    ]);

    setFile(null);
    setDate("");

    fetchPosts();
  }

  async function deletePost(id: string) {
    await supabase.from("posts").delete().eq("id", id);

    fetchPosts();
  }

  async function updateDate(id: string, newDate: string) {
    await supabase
      .from("posts")
      .update({ custom_date: newDate })
      .eq("id", id);

    fetchPosts();
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto">

        <header className="sticky top-0 z-20 backdrop-blur-lg bg-black/70 border-b border-neutral-800">

          <div className="p-4">
            <h1 className="text-3xl font-bold tracking-tight">
              Archive
            </h1>
          </div>

          <div className="flex gap-4 overflow-x-auto px-4 pb-4">

            <div
              onClick={() => setSelectedAccount("ALL")}
              className="flex flex-col items-center cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-semibold">
                  ALL
                </div>
              </div>

              <span className="text-xs mt-2">
                ALL
              </span>
            </div>

            {accounts.map((acc) => (
              <div
                key={acc}
                onClick={() => setSelectedAccount(acc)}
                className="flex flex-col items-center cursor-pointer"
              >

                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px]">

                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-sm font-semibold">
                    {acc.replace("@", "")}
                  </div>

                </div>

                <span className="text-xs mt-2">
                  {acc}
                </span>

              </div>
            ))}
          </div>

        </header>

        <section className="p-4 border-b border-neutral-900 space-y-3 bg-neutral-950">

          <select
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full bg-neutral-900 p-3 rounded-xl"
          >
            {accounts.map((acc) => (
              <option key={acc}>{acc}</option>
            ))}
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
            className="w-full bg-neutral-900 p-3 rounded-xl"
          />

          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-neutral-900 p-3 rounded-xl"
          />

          <button
            onClick={addPost}
            className="w-full bg-white text-black font-semibold p-3 rounded-xl hover:scale-[1.02] transition"
          >
            업로드
          </button>

        </section>

        <section className="p-4 space-y-8">

          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-neutral-950 rounded-3xl overflow-hidden border border-neutral-900"
            >

              <div className="flex items-center justify-between p-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-yellow-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs">
                      {post.account.replace("@", "")}
                    </div>
                  </div>

                  <div>
                    <p className="font-semibold text-sm">
                      {post.account}
                    </p>

                    <p className="text-xs text-neutral-500">
                      archive
                    </p>
                  </div>

                </div>

                <button
                  onClick={() => deletePost(post.id)}
                  className="text-red-400 text-sm"
                >
                  삭제
                </button>

              </div>

              <img
                src={post.media_url}
                alt=""
                className="w-full aspect-square object-cover hover:opacity-90 transition"
              />

              <div className="p-4">

                <input
                  type="datetime-local"
                  defaultValue={post.custom_date}
                  onBlur={(e) =>
                    updateDate(post.id, e.target.value)
                  }
                  className="w-full bg-neutral-900 p-3 rounded-xl text-sm"
                />

              </div>

            </div>
          ))}

        </section>

      </div>
    </main>
  );
}