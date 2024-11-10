import { Loader, X } from "lucide-react";
import { Button } from "./ui/button";
import { MinimalTiptapEditor } from "./minimal-tiptap";
import { Input } from "./ui/input";
import { Controller } from "react-hook-form";
import { FullScreenEditorProps } from "@/lib/types";

function FullScreenEditor({
  currentPost,
  content,
  setContent,
  onSubmit,
  onCancel,
  register,
  errors,
  control,
  isSubmitting,
  isValid,
}: FullScreenEditorProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between border-b p-4">
          <h2 className="text-2xl font-bold">
            {currentPost ? "Edit Post" : "New Post"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-6 w-6" />
          </Button>
        </header>
        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-auto p-4">
            <div className="mb-4 flex space-x-4">
              <div className="flex-1">
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: "Title is required" }}
                  render={({ field }) => (
                    <Input
                      placeholder="Title"
                      className="text-2xl"
                      disabled={isSubmitting}
                      {...field}
                    />
                  )}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.title.message}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-4 sm:flex sm:space-x-4">
              <div className="sm:w-32 mb-4">
                <Input
                  placeholder="Label (e.g., New)"
                  disabled={isSubmitting}
                  {...register("label")}
                />
              </div>
              <div className="mb-4">
                <Input
                  placeholder="Author"
                  disabled={isSubmitting}
                  {...register("author", { required: "Author is required" })}
                />
                {errors.author && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.author.message}
                  </p>
                )}
              </div>
              <div className="mb-4 flex-1">
                <Controller
                  name="slug"
                  control={control}
                  rules={{
                    required: "Slug is required",
                    pattern: {
                      value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                      message:
                        "Slug must be lowercase, numbers, and hyphens only",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      placeholder="Slug"
                      disabled={isSubmitting}
                      {...field}
                    />
                  )}
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>
            <MinimalTiptapEditor
              value={content}
              onChange={setContent}
              className="min-h-[500px] border rounded-md"
              editorContentClassName="p-5"
              output="html"
              placeholder="Type your content here
              ..."
              autofocus={true}
              editable={!isSubmitting}
              editorClassName="focus:outline-none prose max-w-full"
            />
          </div>
          <div className="border-t p-4 flex space-x-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !isValid || !content}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {currentPost ? "Updating..." : "Adding..."}
                </>
              ) : currentPost ? (
                "Update Post"
              ) : (
                "Add Post"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FullScreenEditor;
