"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Split from "react-split";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowUpIcon, Trash2 } from "lucide-react";
import { Editor } from "@monaco-editor/react";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

export default function NewsEditor({ initialData }) {
    const router = useRouter();
    const newsId = initialData?.id;

    const [homeTitle, setHomeTitle] = useState(initialData?.homeTitle || "");
    const [selectedTags, setSelectedTags] = useState(initialData?.tags || []);
    const [content, setContent] = useState(initialData?.contentMD || "");
    const [showPane, setShowPane] = useState({ images: true, editor: true, preview: true });
    const [allTags, setAllTags] = useState([]);
    const [newTagName, setNewTagName] = useState("");
    const [images, setImages] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const uploadRef = useRef(null);

    useEffect(() => {
        fetch("/api/tags").then((res) => res.json()).then(setAllTags);

        const loadImages = async () => {
            const res = await fetch("/api/images");
            const data = await res.json();
            const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setImages(sorted);
        };

        loadImages();
    }, []);

    const handleAddTag = async () => {
        if (!newTagName) return;
        const res = await fetch("/api/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newTagName }),
        });
        if (res.ok) {
            const tag = await res.json();
            setAllTags((prev) => [...prev, tag]);
            setNewTagName("");
        }
    };

    const handleDeleteGlobalTag = async (id) => {
        await fetch(`/api/tags/${id}`, { method: "DELETE" });
        setAllTags((prev) => prev.filter((tag) => tag.id !== id));
        setSelectedTags((prev) => prev.filter((name) => name !== id));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        if (newsId) fd.append("newsId", newsId);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/images");
        xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) setUploadProgress((ev.loaded / ev.total) * 100);
        };
        xhr.onload = () => {
            if (xhr.status === 200) {
                const img = JSON.parse(xhr.responseText);
                setImages((prev) => [img, ...prev]);
            }
            setUploadProgress(0);
        };
        xhr.send(fd);
    };

    const handleDeleteImage = async (id) => {
        const confirmed = confirm("確定要刪除這張圖片嗎？");
        if (!confirmed) return;
        await fetch(`/api/images/${id}`, { method: "DELETE" });
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    const handleSave = async () => {
        const payload = {
            homeTitle,
            tags: selectedTags,
            contentMD: content,
            imageIds: images.map((img) => img.id),
        };
        const method = newsId ? "PATCH" : "POST";
        const url = newsId ? `/api/news/${newsId}` : "/api/news";
        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        router.push("/admin");
    };

    return (
        <div className="p-6 space-y-6">
            <Input
                placeholder="首頁專用標題 (10字內)"
                maxLength={10}
                value={homeTitle}
                onChange={(e) => setHomeTitle(e.target.value)}
                className="w-full"
            />

            <div className="space-y-2">
                <div className="flex gap-2">
                    <Input
                        placeholder="新增標籤"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                    />
                    <Button onClick={handleAddTag}>新增</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-1">
                            <Button
                                variant={selectedTags.includes(tag.name) ? "primary" : "outline"}
                                size="sm"
                                onClick={() =>
                                    setSelectedTags((st) =>
                                        st.includes(tag.name)
                                            ? st.filter((t) => t !== tag.name)
                                            : [...st, tag.name]
                                    )
                                }
                            >
                                #{tag.name}
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleDeleteGlobalTag(tag.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex space-x-2">
                {Object.entries(showPane).map(([pane, visible]) => (
                    <Button
                        key={pane}
                        variant={visible ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => setShowPane((s) => ({ ...s, [pane]: !s[pane] }))}
                    >
                        {visible ? `隱藏 ${pane}` : `顯示 ${pane}`}
                    </Button>
                ))}
            </div>

            <Split
                sizes={[showPane.images ? 20 : 0, showPane.editor ? 40 : 0, showPane.preview ? 40 : 0]}
                minSize={0}
                gutterSize={8}
                className="flex h-[70vh]"
            >
                <div className="p-2 overflow-auto border-r">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold">圖片列表</h3>
                        <label className="cursor-pointer">
                            <ArrowUpIcon className="w-5 h-5" />
                            <input ref={uploadRef} type="file" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                    {uploadProgress > 0 && <progress value={uploadProgress} max={100} className="w-full mb-2 h-2 rounded" />}
                    {images.map((img) => (
                        <div key={img.id} className="mb-4 relative group">
                            <img src={img.url} alt={`preview-${img.id}`} className="w-full rounded" />
                            <div className="absolute top-2 left-2 bg-black/50 text-white px-1 text-xs rounded">
                                #{img.id}
                            </div>
                            <button
                                className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-red-500"
                                onClick={() => handleDeleteImage(img.id)}
                            >
                                <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                            <div className="mt-1 text-xs bg-zinc-100 dark:bg-zinc-800 p-1 rounded break-all">
                                `![#${img.id}](${img.url})`
                            </div>
                        </div>
                    ))}
                </div>

                <div className="w-full h-full">
                    <Editor
                        height="100%"
                        defaultLanguage="markdown"
                        theme="vs-dark"
                        value={content}
                        onChange={(value) => setContent(value || "")}
                        options={{ lineNumbers: "on", fontSize: 14 }}
                    />
                </div>

                <div className="p-2 overflow-auto prose dark:prose-invert">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            img: ({ node, ...props }) => (
                                <img {...props} className="max-w-full rounded shadow" />
                            )
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </Split>

            <div className="text-right">
                <Button onClick={handleSave}>送出</Button>
            </div>
        </div>
    );
}