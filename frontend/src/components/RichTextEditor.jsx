import React, { useEffect, useMemo, useRef } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Enter text...", className = "" }) => {
    const editorRef = useRef(null);

    const decodeHTML = (html) => {
        if (!html) return '';
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    const decodedValue = useMemo(() => decodeHTML(value), [value]);

    useEffect(() => {
        if (!editorRef.current) return;
        if (editorRef.current.innerHTML !== decodedValue) {
            editorRef.current.innerHTML = decodedValue || '';
        }
    }, [decodedValue]);

    const emitChange = () => {
        if (!editorRef.current) return;
        const textContent = editorRef.current.textContent || '';
        if (!textContent.trim()) {
            editorRef.current.innerHTML = '';
            onChange('');
            return;
        }
        onChange(editorRef.current.innerHTML);
    };

    const applyCommand = (command) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, null);
        emitChange();
    };

    return (
        <div className={`rich-text-editor-wrapper ${className}`}>
            <div className="rich-text-editor-toolbar">
                <button type="button" className="rich-text-editor-button" onClick={() => applyCommand('bold')} aria-label="Bold">
                    <strong>B</strong>
                </button>
                <button type="button" className="rich-text-editor-button" onClick={() => applyCommand('italic')} aria-label="Italic">
                    <em>I</em>
                </button>
                <button type="button" className="rich-text-editor-button" onClick={() => applyCommand('underline')} aria-label="Underline">
                    <span style={{ textDecoration: 'underline' }}>U</span>
                </button>
                <button type="button" className="rich-text-editor-button" onClick={() => applyCommand('insertOrderedList')} aria-label="Numbered list">
                    1.
                </button>
                <button type="button" className="rich-text-editor-button" onClick={() => applyCommand('insertUnorderedList')} aria-label="Bullet list">
                    •
                </button>
                <button type="button" className="rich-text-editor-button" onClick={() => applyCommand('removeFormat')} aria-label="Clear formatting">
                    <i className="fa fa-eraser"></i>
                </button>
            </div>
            <div
                className="rich-text-editor-content"
                contentEditable
                ref={editorRef}
                onInput={emitChange}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />
        </div>
    );
};

export default RichTextEditor;
