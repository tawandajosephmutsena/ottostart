import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

// Custom plugin for word count and reading time
export const WordCountPlugin = Extension.create({
    name: 'wordCount',

    addStorage() {
        return {
            words: 0,
            characters: 0,
            readingTime: 0,
        };
    },

    onUpdate() {
        const { editor } = this;
        const text = editor.getText();
        const words = text.split(/\s+/).filter(word => word.length > 0).length;
        const characters = text.length;
        const readingTime = Math.ceil(words / 200); // Average reading speed

        this.storage.words = words;
        this.storage.characters = characters;
        this.storage.readingTime = readingTime;
    },
});

// Custom plugin for auto-save functionality
export const AutoSavePlugin = Extension.create({
    name: 'autoSave',

    addOptions() {
        return {
            delay: 2000, // 2 seconds
            onSave: () => {},
        };
    },

    addStorage() {
        return {
            timeout: null as NodeJS.Timeout | null,
        };
    },

    onUpdate() {
        const { onSave, delay } = this.options;
        
        if (this.storage.timeout) {
            clearTimeout(this.storage.timeout);
        }

        this.storage.timeout = setTimeout(() => {
            onSave(this.editor.getHTML());
        }, delay);
    },

    onDestroy() {
        if (this.storage.timeout) {
            clearTimeout(this.storage.timeout);
        }
    },
});

// Custom plugin for content validation
export const ContentValidationPlugin = Extension.create({
    name: 'contentValidation',

    addOptions() {
        return {
            maxLength: 50000,
            onValidationChange: () => {},
        };
    },

    addStorage() {
        return {
            isValid: true,
            errors: [] as string[],
        };
    },

    onUpdate() {
        const { maxLength, onValidationChange } = this.options;
        const text = this.editor.getText();
        const errors: string[] = [];

        if (text.length > maxLength) {
            errors.push(`Content exceeds maximum length of ${maxLength} characters`);
        }

        // Check for empty headings
        const doc = this.editor.state.doc;
        doc.descendants((node, pos) => {
            if (node.type.name.startsWith('heading') && node.textContent.trim() === '') {
                errors.push('Empty headings are not allowed');
            }
        });

        this.storage.isValid = errors.length === 0;
        this.storage.errors = errors;
        onValidationChange(this.storage.isValid, errors);
    },
});

// Custom plugin for focus mode (highlight current paragraph)
export const FocusModePlugin = Extension.create({
    name: 'focusMode',

    addOptions() {
        return {
            enabled: false,
        };
    },

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('focusMode'),
                props: {
                    decorations: (state) => {
                        if (!this.options.enabled) return DecorationSet.empty;

                        const { selection } = state;
                        const decorations: Decoration[] = [];

                        // Find the current paragraph
                        const resolvedPos = state.doc.resolve(selection.from);
                        const start = resolvedPos.start(resolvedPos.depth);
                        const end = resolvedPos.end(resolvedPos.depth);

                        // Add decoration to highlight current paragraph
                        decorations.push(
                            Decoration.node(start, end, {
                                class: 'focus-mode-active',
                            })
                        );

                        return DecorationSet.create(state.doc, decorations);
                    },
                },
            }),
        ];
    },
});

// Custom plugin for table of contents generation
export const TableOfContentsPlugin = Extension.create({
    name: 'tableOfContents',

    addStorage() {
        return {
            headings: [] as Array<{ level: number; text: string; id: string; pos: number }>,
        };
    },

    onUpdate() {
        const headings: Array<{ level: number; text: string; id: string; pos: number }> = [];
        
        this.editor.state.doc.descendants((node, pos) => {
            if (node.type.name === 'heading') {
                const level = node.attrs.level;
                const text = node.textContent;
                const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                
                headings.push({ level, text, id, pos });
            }
        });

        this.storage.headings = headings;
    },
});

export default {
    WordCountPlugin,
    AutoSavePlugin,
    ContentValidationPlugin,
    FocusModePlugin,
    TableOfContentsPlugin,
};