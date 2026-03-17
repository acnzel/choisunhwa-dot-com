'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import { Heading } from '@tiptap/extension-heading'
import { useCallback, useEffect, useRef } from 'react'

interface TiptapEditorProps {
  content?: object | null
  onChange?: (json: object, html: string) => void
  placeholder?: string
  bucket?: string
}

function ToolbarButton({
  onClick, active, title, children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        padding: '4px 8px',
        borderRadius: 4,
        border: 'none',
        background: active ? '#1a1a2e' : 'transparent',
        color: active ? '#fff' : '#333',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: active ? 700 : 400,
      }}
    >
      {children}
    </button>
  )
}

export default function TiptapEditor({ content, onChange, placeholder, bucket = 'insights' }: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Heading.configure({ levels: [2, 3] }),
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false }),
      TextStyle,
      Color,
      Placeholder.configure({ placeholder: placeholder ?? '내용을 입력하세요...' }),
    ],
    content: content ?? '',
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange?.(editor.getJSON(), editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: 'min-height: 400px; padding: 16px; outline: none; font-size: 14px; line-height: 1.8;',
      },
    },
  })

  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content])

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return
    const formData = new FormData()
    formData.append('file', file)
    formData.append('bucket', bucket)
    formData.append('width', '1200')

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) { alert('이미지 업로드 실패'); return }
    const { url } = await res.json()
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor, bucket])

  if (!editor) return null

  return (
    <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' }}>
      {/* 툴바 */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 2, padding: '8px 12px',
        borderBottom: '1px solid #e0e0e0', background: '#fafafa',
      }}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')} title="굵게">B</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')} title="기울임"><em>I</em></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')} title="취소선"><s>S</s></ToolbarButton>
        <span style={{ width: 1, background: '#ddd', margin: '2px 6px' }} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })} title="H2">H2</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })} title="H3">H3</ToolbarButton>
        <span style={{ width: 1, background: '#ddd', margin: '2px 6px' }} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')} title="불릿 리스트">• 목록</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')} title="번호 리스트">1. 목록</ToolbarButton>
        <span style={{ width: 1, background: '#ddd', margin: '2px 6px' }} />
        <ToolbarButton
          onClick={() => {
            const url = prompt('링크 URL')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          active={editor.isActive('link')} title="링크">🔗</ToolbarButton>
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          active={false} title="이미지 업로드">🖼 이미지</ToolbarButton>
        <span style={{ width: 1, background: '#ddd', margin: '2px 6px' }} />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="실행취소">↩</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="다시실행">↪</ToolbarButton>
      </div>

      {/* 에디터 본문 */}
      <div style={{ background: '#fff' }}>
        <EditorContent editor={editor} />
      </div>

      {/* 히든 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
