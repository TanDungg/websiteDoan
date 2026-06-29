import React, { useEffect, useRef } from 'react';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const isMounted = useRef(true);
  const editorIdRef = useRef(`editor-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    isMounted.current = true;

    if (!window.CKEDITOR) {
      console.error('CKEditor script is not loaded. Please verify the script tag in index.html');
      return;
    }

    // Configure CKEditor 4 to look like Microsoft Word
    const editor = window.CKEDITOR.replace(textareaRef.current, {
      versionCheck: false,
      placeholder: placeholder || 'Nhập nội dung...',
      height: 280,
      // Load standard toolbar configuration for Word-like features
      toolbarGroups: [
        { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
        { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
        { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
        { name: 'forms', groups: [ 'forms' ] },
        '/',
        { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
        { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
        { name: 'links', groups: [ 'links' ] },
        { name: 'insert', groups: [ 'insert' ] },
        '/',
        { name: 'styles', groups: [ 'styles' ] },
        { name: 'colors', groups: [ 'colors' ] },
        { name: 'tools', groups: [ 'tools' ] },
        { name: 'others', groups: [ 'others' ] },
        { name: 'about', groups: [ 'about' ] }
      ],
      // Adjust configuration to enable all buttons for maximum functionality
      removeButtons: '', 
      // Configure extra plugins (CKEditor 4 includes image drag & drop and resize out of the box in full package)
      extraPlugins: 'colorbutton,font,justify,showblocks',
      // Allow all HTML tags, classes, and styles (so user styling is preserved)
      allowedContent: true,
    });

    editorRef.current = editor;

    // Set initial value once the instance is ready
    editor.on('instanceReady', () => {
      if (isMounted.current && value) {
        editor.setData(value);
      }
    });

    // Handle change event
    editor.on('change', () => {
      if (!isMounted.current) return;
      const data = editor.getData();
      if (data !== value) {
        onChange(data);
      }
    });

    return () => {
      isMounted.current = false;
      if (editorRef.current) {
        try {
          editorRef.current.destroy(true);
        } catch (e) {
          console.warn('CKEditor destroy failed:', e);
        }
        editorRef.current = null;
      }
    };
  }, []);

  // Update editor value from external React state
  useEffect(() => {
    if (!editorRef.current) return;
    
    // Ensure the editor instance is fully loaded/ready
    if (editorRef.current.status === 'ready') {
      const currentData = editorRef.current.getData();
      if ((value || '') !== currentData) {
        editorRef.current.setData(value || '');
      }
    }
  }, [value]);

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px', overflow: 'hidden' }}>
      <textarea 
        id={editorIdRef.current}
        ref={textareaRef} 
        defaultValue={value || ''} 
        style={{ width: '100%', minHeight: '150px', display: 'none' }} 
      />
    </div>
  );
}
