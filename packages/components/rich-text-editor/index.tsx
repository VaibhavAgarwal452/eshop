import React, { useEffect, useRef, useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> & {
    modules?: any;
    formats?: string[];
} = ({ value, onChange }) => {
    const quillInitialized = useRef(false);

    useEffect(() => {
        if (!quillInitialized.current) {
            quillInitialized.current = true;

            setTimeout(() => {
                // Remove duplicate toolbars if any
                document.querySelectorAll(".ql-toolbar").forEach((toolbar, index) => {
                    if (index > 0) {
                        toolbar.remove();
                    }
                });
            }, 100);
        }
    }, []);

    return (
        <div
            className="relative"
            style={{
                border: "1px solid #d1d5db", // Tailwind gray-300
                borderRadius: "0.5rem", // rounded-lg
                overflow: "hidden",
                fontFamily: "'Inter', sans-serif",
            }}
        >
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                placeholder="Write Something..."
                modules={RichTextEditor.modules}
                formats={RichTextEditor.formats}
                className="rich-quill-editor"
            />
            <style>{`
        .rich-quill-editor .ql-toolbar {
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
          padding: 0.5rem;
        }
        .rich-quill-editor .ql-editor {
          min-height: 200px;
          font-size: 1rem;
          line-height: 1.6;
          padding: 1rem;
        }
      `}</style>
        </div>
    );
};

RichTextEditor.modules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }],
        ["blockquote", "code-block"],
        ["link", "image"],
        ["clean"],
    ],
};

RichTextEditor.formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "list",
    "blockquote",
    "code-block",
    "link",
    "image",
];

export default RichTextEditor;
