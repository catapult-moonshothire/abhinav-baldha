import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { Content, UseEditorOptions } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { useEditor } from "@tiptap/react";
import { Typography } from "@tiptap/extension-typography";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import {
  Link,
  Image,
  HorizontalRule,
  CodeBlockLowlight,
  Selection,
  Color,
  UnsetAllMarks,
  ResetMarksOnEnter,
  FileHandler,
} from "../extensions";
import { cn } from "@/lib/utils";
import { getOutput, randomId } from "../utils";
import { useThrottle } from "../hooks/use-throttle";
import { toast } from "sonner";

export interface UseMinimalTiptapEditorProps extends UseEditorOptions {
  value?: Content;
  output?: "html" | "json" | "text";
  placeholder?: string;
  editorClassName?: string;
  throttleDelay?: number;
  onUpdate?: (content: Content) => void;
  onBlur?: (content: Content) => void;
}

const createExtensions = (placeholder: string) => [
  StarterKit.configure({
    horizontalRule: false,
    codeBlock: false,
    paragraph: { HTMLAttributes: { class: "text-node" } },
    heading: { HTMLAttributes: { class: "heading-node" } },
    blockquote: { HTMLAttributes: { class: "block-node" } },
    bulletList: { HTMLAttributes: { class: "list-node" } },
    orderedList: { HTMLAttributes: { class: "list-node" } },
    code: { HTMLAttributes: { class: "inline", spellcheck: "false" } },
    dropcursor: { width: 2, class: "ProseMirror-dropcursor border" },
  }),
  Link,
  Underline,
  Image.configure({
    allowedMimeTypes: ["image/*"],
    maxFileSize: 5 * 1024 * 1024,
    uploadFn: async (file) => {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const filename = `${randomId()}-${file.name}`;
        const response = await fetch(
          `/api/upload-image?filename=${encodeURIComponent(filename)}`,
          {
            method: "POST",
            body: file,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to upload image");
        }

        const data = await response.json();
        return { id: data.url, src: data.url };
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    },
    onImageRemoved({ id, src }) {
      console.log("Image removed", { id, src });
      // You can implement image deletion from Vercel Blob here if needed
    },
    onValidationError(errors) {
      errors.forEach((error) => {
        toast.error("Image validation error", {
          position: "bottom-right",
          description: error.reason,
        });
      });
    },
    onActionSuccess({ action }) {
      const mapping = {
        copyImage: "Copy Image",
        copyLink: "Copy Link",
        download: "Download",
      };
      toast.success(mapping[action], {
        position: "bottom-right",
        description: "Image action success",
      });
    },
    onActionError(error, { action }) {
      const mapping = {
        copyImage: "Copy Image",
        copyLink: "Copy Link",
        download: "Download",
      };
      toast.error(`Failed to ${mapping[action]}`, {
        position: "bottom-right",
        description: error.message,
      });
    },
  }),
  FileHandler.configure({
    allowedMimeTypes: ["image/*"],
    maxFileSize: 5 * 1024 * 1024,
    onDrop: async (editor, files, pos) => {
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const filename = `${randomId()}-${file.name}`;
          const response = await fetch(
            `/api/upload-image?filename=${encodeURIComponent(filename)}`,
            {
              method: "POST",
              body: file,
            }
          );

          if (!response.ok) {
            throw new Error("Failed to upload image");
          }

          const data = await response.json();
          editor.commands.insertContentAt(pos, {
            type: "image",
            attrs: { src: data.url },
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image", {
              position: "bottom-right",
              description: error.message,
            });
          } else {
            console.error("Unknown error uploading image:", error);
            toast.error("An unknown error occurred while uploading the image", {
              position: "bottom-right",
            });
          }
        }
      }
    },
    onPaste: async (editor, files) => {
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const filename = `${randomId()}-${file.name}`;
          const response = await fetch(
            `/api/upload-image?filename=${encodeURIComponent(filename)}`,
            {
              method: "POST",
              body: file,
            }
          );

          if (!response.ok) {
            throw new Error("Failed to upload image");
          }

          const data = await response.json();
          editor.commands.insertContent({
            type: "image",
            attrs: { src: data.url },
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image", {
              position: "bottom-right",
              description: error.message,
            });
          } else {
            console.error("Unknown error uploading image:", error);
            toast.error("An unknown error occurred while uploading the image", {
              position: "bottom-right",
            });
          }
        }
      }
    },
    onValidationError: (errors) => {
      errors.forEach((error) => {
        toast.error("Image validation error", {
          position: "bottom-right",
          description: error.reason,
        });
      });
    },
  }),
  Color,
  TextStyle,
  Selection,
  Typography,
  UnsetAllMarks,
  HorizontalRule,
  ResetMarksOnEnter,
  CodeBlockLowlight,
  Placeholder.configure({ placeholder: () => placeholder }),
];

export const useMinimalTiptapEditor = ({
  value,
  output = "html",
  placeholder = "",
  editorClassName,
  throttleDelay = 0,
  onUpdate,
  onBlur,
  ...props
}: UseMinimalTiptapEditorProps) => {
  const throttledSetValue = useThrottle(
    (value: Content) => onUpdate?.(value),
    throttleDelay
  ) as (value: unknown) => void;

  const handleUpdate = React.useCallback(
    (editor: Editor) => throttledSetValue(getOutput(editor, output)),
    [output, throttledSetValue]
  );

  const handleCreate = React.useCallback(
    (editor: Editor) => {
      if (value && editor.isEmpty) {
        editor.commands.setContent(value);
      }
    },
    [value]
  );

  const handleBlur = React.useCallback(
    (editor: Editor) => onBlur?.(getOutput(editor, output)),
    [output, onBlur]
  );

  const editor = useEditor({
    extensions: createExtensions(placeholder),
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        class: cn("focus:outline-none", editorClassName),
      },
    },
    onUpdate: ({ editor }) => handleUpdate(editor),
    onCreate: ({ editor }) => handleCreate(editor),
    onBlur: ({ editor }) => handleBlur(editor),
    ...props,
  });

  return editor;
};

export default useMinimalTiptapEditor;
