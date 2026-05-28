import { BookOpen, BookOpenCheck, ChevronRight, Folder, FolderPlus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Shell from "../components/layout/Shell.jsx";
import { createFolder, createSet, deleteFolder, deleteSet, getFolders, getSets } from "../services/api.js";

export default function Home() {
  const [folders, setFolders] = useState([]);
  const [sets, setSets] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [folderName, setFolderName] = useState("");
  const [setTitle, setSetTitle] = useState("");

  useEffect(() => {
    loadLibrary();
  }, []);

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) || folders[0] || null,
    [folders, selectedFolderId]
  );

  const selectedSets = useMemo(
    () => sets.filter((set) => selectedFolder && set.folderId === selectedFolder.id),
    [selectedFolder, sets]
  );

  async function loadLibrary(preferredFolderId) {
    const [folderData, setData] = await Promise.all([getFolders(), getSets()]);
    setFolders(folderData);
    setSets(setData);
    setSelectedFolderId((current) => {
      if (preferredFolderId && folderData.some((folder) => folder.id === preferredFolderId)) return preferredFolderId;
      if (current && folderData.some((folder) => folder.id === current)) return current;
      return folderData[0]?.id || "";
    });
  }

  async function addFolder(event) {
    event.preventDefault();
    if (!folderName.trim()) return;

    const folder = await createFolder({ name: folderName });
    setFolderName("");
    await loadLibrary(folder.id);
  }

  async function addSet(event) {
    event.preventDefault();
    if (!setTitle.trim() || !selectedFolder) return;

    const set = await createSet({
      title: setTitle,
      description: "Bộ từ vựng mới",
      sourceLanguage: "en-US",
      targetLanguage: "vi-VN",
      folderId: selectedFolder.id
    });

    setSets((current) => [{ ...set, cardCount: 0 }, ...current]);
    setFolders((current) =>
      current.map((folder) =>
        folder.id === selectedFolder.id ? { ...folder, setCount: (folder.setCount || 0) + 1 } : folder
      )
    );
    setSetTitle("");
  }

  async function removeFolder(folder) {
    const ok = window.confirm(`Xóa folder "${folder.name}" và toàn bộ bộ từ bên trong?`);
    if (!ok) return;

    await deleteFolder(folder.id);
    const nextFolders = folders.filter((item) => item.id !== folder.id);
    setFolders(nextFolders);
    setSets((current) => current.filter((set) => set.folderId !== folder.id));
    setSelectedFolderId(nextFolders[0]?.id || "");
  }

  async function removeSet(set) {
    const ok = window.confirm(`Xóa bộ từ "${set.title}"?`);
    if (!ok) return;

    await deleteSet(set.id);
    setSets((current) => current.filter((item) => item.id !== set.id));
    setFolders((current) =>
      current.map((folder) =>
        folder.id === set.folderId ? { ...folder, setCount: Math.max(0, (folder.setCount || 0) - 1) } : folder
      )
    );
  }

  const action = (
    <form onSubmit={addFolder} className="flex max-w-[54vw] gap-2 sm:max-w-sm">
      <input
        value={folderName}
        onChange={(event) => setFolderName(event.target.value)}
        className="min-w-0 rounded-xl border border-line bg-cloud/60 px-3 py-2 text-sm outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10 sm:text-base"
        placeholder="Tên folder"
      />
      <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-soft" title="Tạo folder">
        <FolderPlus size={18} />
      </button>
    </form>
  );

  return (
    <Shell action={action}>
      <section className="mb-6 rounded-2xl border border-line bg-white/80 p-5 shadow-soft sm:p-7">
        <div className="flex items-start gap-4">
          <div className="hidden h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand sm:grid">
            <BookOpenCheck size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Thư viện học tập</h1>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
              Tạo folder để gom bộ từ theo mục tiêu học, rồi vào từng folder để thêm bộ từ mới.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <section className="rounded-2xl border border-line bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">Folder</h2>
              <p className="text-sm font-semibold text-slate-500">{folders.length} folder</p>
            </div>
            <Folder className="text-brand" size={24} />
          </div>

          <div className="space-y-2">
            {folders.map((folder) => {
              const active = selectedFolder?.id === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition active:scale-[0.99] ${
                    active ? "border-brand bg-brand/10 text-brand" : "border-line bg-cloud/60 hover:border-brand"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-black">{folder.name}</span>
                    <span className="text-sm font-semibold text-slate-500">{folder.setCount || 0} bộ từ</span>
                  </span>
                  <ChevronRight size={18} />
                </button>
              );
            })}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
          {selectedFolder ? (
            <>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase text-brand">Folder đang mở</p>
                  <h2 className="mt-1 truncate text-2xl font-black sm:text-3xl">{selectedFolder.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{selectedSets.length} bộ từ</p>
                </div>
                <button
                  onClick={() => removeFolder(selectedFolder)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-700 transition active:scale-[0.98]"
                >
                  <Trash2 size={17} />
                  Xóa folder
                </button>
              </div>

              <form onSubmit={addSet} className="mb-5 flex gap-2 rounded-2xl bg-cloud/70 p-3">
                <input
                  value={setTitle}
                  onChange={(event) => setSetTitle(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-line bg-white px-3 py-3 outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
                  placeholder={`Tên bộ từ trong ${selectedFolder.name}`}
                />
                <button className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-3 font-black text-white shadow-soft">
                  <Plus size={18} />
                  <span className="hidden sm:inline">Tạo bộ</span>
                </button>
              </form>

              <div className="grid gap-4 sm:grid-cols-2">
                {selectedSets.map((set) => (
                  <div key={set.id} className="group rounded-2xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                    <div className="flex items-start justify-between gap-3">
                      <Link to={`/sets/${set.id}`} className="min-w-0 flex-1">
                        <p className="truncate text-xl font-black">{set.title}</p>
                        <p className="mt-2 min-h-10 text-sm leading-5 text-slate-600">{set.description}</p>
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full bg-brand/10 px-3 py-1 text-sm font-black text-brand">{set.cardCount || 0}</span>
                        <button
                          onClick={() => removeSet(set)}
                          className="grid h-9 w-9 place-items-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition active:scale-[0.98]"
                          title="Xóa bộ từ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <Link to={`/sets/${set.id}`} className="mt-5 inline-flex items-center gap-2 text-sm font-black text-brand transition group-hover:translate-x-1">
                      <BookOpen size={16} />
                      Vào học
                    </Link>
                  </div>
                ))}
              </div>

              {!selectedSets.length && (
                <div className="rounded-2xl border border-dashed border-line bg-cloud/60 p-8 text-center">
                  <BookOpen className="mx-auto text-slate-400" size={34} />
                  <p className="mt-3 font-black">Folder này chưa có bộ từ</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">Nhập tên bộ từ phía trên để tạo bộ đầu tiên.</p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-cloud/60 p-8 text-center">
              <FolderPlus className="mx-auto text-brand" size={38} />
              <p className="mt-3 font-black">Tạo folder đầu tiên</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">Dùng ô trên thanh đầu trang để đặt tên folder.</p>
            </div>
          )}
        </section>
      </div>
    </Shell>
  );
}
