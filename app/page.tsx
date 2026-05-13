"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Home() {
  const PASSWORD = "archive123";

  const [authorized, setAuthorized] =
    useState(false);

  const [passwordInput, setPasswordInput] =
    useState("");

  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] =
    useState<any | null>(null);

  const [account, setAccount] = useState("@aaa");

  const [selectedAccount, setSelectedAccount] =
    useState("ALL");

  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const accounts = [
    "@rkive",
    "@jin",
    "@agustd",
    "@uarmyhope",
    "@j.m",
    "@thv",
    "@mnijungkook",
  ];

  async function fetchPosts() {
    let query = supabase
      .from("posts")
      .select("*")
      .order("custom_date", {
        ascending: false,
      });

    if (selectedAccount !== "ALL") {
      query = query.eq(
        "account",
        selectedAccount
      );
    }

    const { data } = await query;

    if (data) {
      setPosts(data);
    }
  }

  useEffect(() => {
    if (authorized) {
      fetchPosts();
    }
  }, [selectedAccount, authorized]);

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
    await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    fetchPosts();
    setSelectedPost(null);
  }

  async function updateDate(
    id: string,
    newDate: string
  ) {
    await supabase
      .from("posts")
      .update({
        custom_date: newDate,
      })
      .eq("id", id);

    fetchPosts();
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">

        <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800 rounded-3xl p-6 space-y-4">

          <h1 className="text-3xl font-bold text-center">
            Archive
          </h1>

          <input
            type="password"
            placeholder="비밀번호 입력"
            value={passwordInput}
            onChange={(e) =>
              setPasswordInput(e.target.value)
            }
            onKeyDown={(e) => {
  if (e.key === "Enter") {

    if (passwordInput === PASSWORD) {
      setAuthorized(true);

    } else {
      alert("비밀번호 오류");
    }

  }
}}
            className="w-full bg-neutral-900 p-4 rounded-xl"
          />

          <button
            onClick={() => {
              if (
                passwordInput === PASSWORD
              ) {
                setAuthorized(true);
              } else {
                alert("비밀번호 오류");
              }
            }}
            className="w-full bg-white text-black p-4 rounded-xl font-semibold"
          >
            입장
          </button>

        </div>

      </main>
    );
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
              onClick={() =>
                setSelectedAccount("ALL")
              }
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
                onClick={() =>
                  setSelectedAccount(acc)
                }
                className="flex flex-col items-center cursor-pointer"
              >

                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-[2px]">

                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs">
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
            onChange={(e) =>
              setAccount(e.target.value)
            }
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
              setFile(
                e.target.files?.[0] || null
              )
            }
            className="w-full bg-neutral-900 p-3 rounded-xl"
          />

          <input
            type="datetime-local"
            step="1"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            className="w-full bg-neutral-900 p-3 rounded-xl"
          />

          <button
            onClick={addPost}
            className="w-full bg-white text-black font-semibold p-3 rounded-xl"
          >
            업로드
          </button>

        </section>

        <section className="grid grid-cols-3 gap-[1px] bg-neutral-900">

          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() =>
                setSelectedPost(post)
              }
              className="cursor-pointer"
            >

              <img
                src={post.media_url}
                alt=""
                className="aspect-square object-cover w-full hover:opacity-80 transition"
              />

            </div>
          ))}

        </section>

        {selectedPost && (

          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">

            <div className="max-w-md w-full bg-neutral-950 rounded-3xl overflow-hidden">

              <img
                src={selectedPost.media_url}
                alt=""
                className="w-full"
              />

              <div className="p-4 space-y-3">

                <div className="flex items-center justify-between">

                  <p className="font-semibold">
                    {selectedPost.account}
                  </p>

                  <button
                    onClick={() =>
                      setSelectedPost(null)
                    }
                    className="text-neutral-400"
                  >
                    닫기
                  </button>

                </div>

                <input
                  type="datetime-local"
                  step="1"
                  defaultValue={
                    selectedPost.custom_date
                  }
                  onBlur={(e) =>
                    updateDate(
                      selectedPost.id,
                      e.target.value
                    )
                  }
                  className="w-full bg-neutral-900 p-3 rounded-xl text-sm"
                />

                <p className="text-sm text-neutral-400">

                  {new Date(
                    selectedPost.custom_date
                  ).toLocaleString(
                    "ko-KR",
                    {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    }
                  )}

                </p>

                <button
                  onClick={() =>
                    deletePost(selectedPost.id)
                  }
                  className="w-full bg-red-500 text-white p-3 rounded-xl"
                >
                  삭제
                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </main>
  );
}