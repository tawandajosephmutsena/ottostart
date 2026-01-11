import { Node, mergeAttributes } from '@tiptap/core';

export interface ButtonOptions {
    HTMLAttributes: Record<string, string | number | boolean | undefined>;
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        button: {
            setButton: (options: { text: string; href: string; style?: string; align?: string }) => ReturnType;
        };
    }
}

export const ButtonExtension = Node.create<ButtonOptions>({
    name: 'button',
    
    group: 'block',
    
    atom: true,
    
    addOptions() {
        return {
            HTMLAttributes: {},
        };
    },
    
    addAttributes() {
        return {
            text: {
                default: 'Click Here',
            },
            href: {
                default: '#',
            },
            style: {
                default: 'primary',
            },
            align: {
                default: 'left',
            },
        };
    },
    
    parseHTML() {
        return [
            {
                tag: 'div[data-type="button"]',
            },
        ];
    },
    
    renderHTML({ node, HTMLAttributes }) {
        const style = node.attrs.style || 'primary';
        const align = node.attrs.align || 'left';
        
        // Alignment classes
        const alignClasses: Record<string, string> = {
            left: 'justify-start',
            center: 'justify-center',
            right: 'justify-end',
        };
        
        // Button style classes - using CSS custom properties for theme support
        const styleClasses: Record<string, string> = {
            primary: 'editor-btn-primary',
            secondary: 'editor-btn-secondary',
            outline: 'editor-btn-outline',
            ghost: 'editor-btn-ghost',
        };
        
        const buttonClasses = `inline-flex items-center justify-center rounded-lg px-6 py-3 font-semibold transition-all duration-200 no-underline ${styleClasses[style] || styleClasses.primary}`;
        const wrapperClasses = `flex my-4 ${alignClasses[align] || alignClasses.left}`;
        
        return [
            'div',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                'data-type': 'button',
                'data-style': style,
                'data-align': align,
                class: wrapperClasses,
            }),
            [
                'a',
                {
                    href: node.attrs.href,
                    class: buttonClasses,
                },
                node.attrs.text,
            ],
        ];
    },
    
    addCommands() {
        return {
            setButton:
                (options) =>
                ({ commands }) => {
                    return commands.insertContent({
                        type: this.name,
                        attrs: options,
                    });
                },
        };
    },
});

export default ButtonExtension;
