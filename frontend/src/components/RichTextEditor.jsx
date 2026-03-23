import React, { useEffect, useMemo, useRef } from 'react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder = "Enter text...", className = "" }) => {
    const editorRef = useRef(null);
    const isInternalChange = useRef(false);
    const allowedTags = useRef(new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'P', 'DIV', 'UL', 'OL', 'LI']));

    const decodeHTML = (html) => {
        if (!html) return '';
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    };

    const sanitizeHTML = (html) => {
        if (!html) return '';

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const sanitizeNode = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return document.createTextNode(node.textContent || '');
            }

            if (node.nodeType !== Node.ELEMENT_NODE) {
                return document.createDocumentFragment();
            }

            const tagName = node.tagName.toUpperCase();
            const fragment = document.createDocumentFragment();
            const sanitizedChildren = Array.from(node.childNodes).map(sanitizeNode);

            if (!allowedTags.current.has(tagName)) {
                sanitizedChildren.forEach((child) => fragment.appendChild(child));
                return fragment;
            }

            const cleanNode = document.createElement(tagName.toLowerCase());
            sanitizedChildren.forEach((child) => cleanNode.appendChild(child));
            return cleanNode;
        };

        const container = document.createElement('div');
        Array.from(doc.body.childNodes).forEach((child) => {
            container.appendChild(sanitizeNode(child));
        });

        return container.innerHTML;
    };

    const decodedValue = useMemo(() => sanitizeHTML(decodeHTML(value)), [value]);

    useEffect(() => {
        if (!editorRef.current || isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }
        if (editorRef.current.innerHTML !== decodedValue) {
            editorRef.current.innerHTML = decodedValue || '';
        }
    }, [decodedValue]);

    const emitChange = () => {
        if (!editorRef.current) return;
        isInternalChange.current = true;
        const textContent = editorRef.current.textContent || '';
        if (!textContent.trim()) {
            editorRef.current.innerHTML = '';
            onChange('');
            return;
        }

        const sanitizedContent = sanitizeHTML(editorRef.current.innerHTML);
        if (editorRef.current.innerHTML !== sanitizedContent) {
            editorRef.current.innerHTML = sanitizedContent;
        }

        onChange(sanitizedContent);
    };

    const applyCommand = (command) => {
        if (!editorRef.current) return;
        editorRef.current.focus();
        document.execCommand(command, false, null);
        emitChange();
    };

    const insertHTMLAtCursor = (html) => {
        editorRef.current?.focus();

        if (document.queryCommandSupported?.('insertHTML')) {
            document.execCommand('insertHTML', false, html);
            return;
        }

        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            if (editorRef.current) {
                editorRef.current.innerHTML += html;
            }
            return;
        }

        const range = selection.getRangeAt(0);
        range.deleteContents();

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = html;
        const fragment = document.createDocumentFragment();
        let lastNode = null;

        while (tempContainer.firstChild) {
            lastNode = fragment.appendChild(tempContainer.firstChild);
        }

        range.insertNode(fragment);

        if (lastNode) {
            range.setStartAfter(lastNode);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();

        const clipboard = event.clipboardData;
        if (!clipboard) return;

        const html = clipboard.getData('text/html');
        const plainText = clipboard.getData('text/plain');

        let contentToInsert = '';

        if (html) {
            contentToInsert = sanitizeHTML(html);
        } else if (plainText) {
            const escapedText = plainText
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\r\n|\r|\n/g, '<br>');
            contentToInsert = escapedText;
        }

        if (!contentToInsert) return;

        insertHTMLAtCursor(contentToInsert);
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
                onPaste={handlePaste}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />
        </div>
    );
};

export default RichTextEditor;
